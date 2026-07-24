import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage, UPLOADS_DIR } from "./storage";
import { siteConfigSchema, songSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { randomUUID } from "crypto";
import { pinyin } from "pinyin-pro";
import { clearSessionCookie, createSession, hashPassword, isAuthenticated, requireAuth, setSessionCookie, verifyPassword } from "./auth";

function publicConfig(config: any) {
  return { ...config, adminPassword: "" };
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = Object.assign(new Error("仅支持 JPEG、PNG、GIF 和 WebP 图片"), { status: 400 });
      cb(error);
    }
  },
});

function detectImageExtension(buffer: Buffer): "jpg" | "png" | "gif" | "webp" | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))) return "gif";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

function extractPlaylistId(source: string): string | null {
  const queryId = source.match(/[?&](?:id|disstid)=([0-9]+)/i)?.[1];
  if (queryId) return queryId;
  const pathId = source.match(/(?:playlist|playsquare)[\/:]([0-9]+)/i)?.[1];
  if (pathId) return pathId;
  return source.trim().match(/^[0-9]+$/)?.[0] || null;
}

type ImportedSong = { songName: string; singer: string };

function inferSongMetadata(songName: string, singer = "") {
  const text = songName.trim();
  const combined = `${text} ${singer}`;
  let language: "Mandarin" | "Japanese" | "English" | "Other" = "Other";
  if (/[\u3040-\u30ff\u31f0-\u31ff]/.test(combined)) language = "Japanese";
  else if (/[\u4e00-\u9fff]/.test(text)) language = "Mandarin";
  else if (/[A-Za-z]/.test(text)) language = "English";

  const first = text.match(/[A-Za-z\u4e00-\u9fff]/)?.[0];
  let pinyinInitial: string | undefined;
  if (language === "Mandarin" && first) {
    const initial = pinyin(first, { pattern: "first", toneType: "none" }).charAt(0).toUpperCase();
    if (/^[A-Z]$/.test(initial)) pinyinInitial = initial;
  } else if (language === "English" && first && /[A-Za-z]/.test(first)) {
    pinyinInitial = first.toUpperCase();
  }
  return { language, pinyinInitial };
}

async function fetchJson(url: string, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`上游平台返回 ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function importPlaylist(provider: "netease" | "qq", id: string): Promise<ImportedSong[]> {
  if (provider === "netease") {
    const data: any = await fetchJson(
      `https://music.163.com/api/v6/playlist/detail?id=${id}&n=10000&s=0`,
      { "User-Agent": "Mozilla/5.0", Referer: "https://music.163.com/" },
    );
    const trackIds = Array.isArray(data?.playlist?.trackIds)
      ? data.playlist.trackIds.map((item: any) => Number(item?.id)).filter(Number.isFinite)
      : [];
    let tracks = Array.isArray(data?.playlist?.tracks) ? data.playlist.tracks : [];
    if (trackIds.length > tracks.length) {
      const detailedTracks: any[] = [];
      for (let index = 0; index < trackIds.length; index += 100) {
        const batch = trackIds.slice(index, index + 100);
        const details: any = await fetchJson(
          `https://music.163.com/api/song/detail?ids=${encodeURIComponent(JSON.stringify(batch))}`,
          { "User-Agent": "Mozilla/5.0", Referer: "https://music.163.com/" },
        );
        if (Array.isArray(details?.songs)) detailedTracks.push(...details.songs);
      }
      const byId = new Map(detailedTracks.map(track => [Number(track?.id), track]));
      tracks = trackIds.map((trackId: number) => byId.get(trackId)).filter(Boolean);
    }
    if (!tracks.length) throw new Error("无法读取网易云歌单，请确认歌单为公开状态");
    return tracks.map((track: any) => {
      const artists = Array.isArray(track?.ar) ? track.ar : Array.isArray(track?.artists) ? track.artists : [];
      return {
        songName: String(track?.name || "").trim(),
        singer: artists.map((artist: any) => artist?.name).filter(Boolean).join(" / "),
      };
    }).filter((song: ImportedSong) => song.songName && song.singer);
  }

  const data: any = await fetchJson(
    `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${id}&format=json`,
    { "User-Agent": "Mozilla/5.0", Referer: "https://y.qq.com/" },
  );
  const tracks = data?.cdlist?.[0]?.songlist;
  if (!Array.isArray(tracks)) throw new Error("无法读取 QQ 音乐歌单，请确认歌单为公开状态");
  return tracks.map((track: any) => ({
    songName: String(track?.songname || track?.name || "").trim(),
    singer: Array.isArray(track?.singer) ? track.singer.map((artist: any) => artist?.name).filter(Boolean).join(" / ") : "",
  })).filter((song: ImportedSong) => song.songName && song.singer);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/uploads", express.static(UPLOADS_DIR, {
    dotfiles: "deny",
    fallthrough: false,
    index: false,
    immutable: true,
    maxAge: "30d",
  }));
  
  // ============================================
  // CONFIG ROUTES
  // ============================================
  
  // GET /api/config - Get site configuration
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfig();
      res.json(publicConfig(config));
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  // PUT /api/config - Update site configuration
  app.put("/api/config", requireAuth, async (req, res) => {
    try {
      const current = await storage.getConfig();
      const requestedPassword = typeof req.body.adminPassword === "string" ? req.body.adminPassword.trim() : "";
      const validatedConfig = siteConfigSchema.parse({
        ...req.body,
        adminPassword: requestedPassword ? hashPassword(requestedPassword) : current.adminPassword,
      });
      const savedConfig = await storage.saveConfig(validatedConfig);
      res.json(publicConfig(savedConfig));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid configuration", details: error.errors });
      } else {
        console.error("Error saving config:", error);
        res.status(500).json({ error: "Failed to save configuration" });
      }
    }
  });

  // ============================================
  // SONGS ROUTES
  // ============================================
  
  // GET /api/songs - Get all songs
  app.get("/api/songs", async (req, res) => {
    try {
      const songs = await storage.getSongs();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  // PUT /api/songs - Update entire song list
  app.put("/api/songs", requireAuth, async (req, res) => {
    try {
      const songsArray = z.array(songSchema).parse(req.body);
      const savedSongs = await storage.saveSongs(songsArray);
      res.json(savedSongs);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid songs data", details: error.errors });
      } else {
        console.error("Error saving songs:", error);
        res.status(500).json({ error: "Failed to save songs" });
      }
    }
  });

  app.post("/api/songs/import", requireAuth, async (req, res) => {
    try {
      const input = z.object({
        provider: z.enum(["netease", "qq"]),
        source: z.string().min(1).max(500),
      }).parse(req.body);
      const playlistId = extractPlaylistId(input.source);
      if (!playlistId) return res.status(400).json({ error: "无法识别歌单链接或 ID" });

      const imported = (await importPlaylist(input.provider, playlistId)).slice(0, 5000);
      if (imported.length === 0) throw new Error("歌单中没有可导入的歌曲，请检查链接或歌单公开状态");
      const existing = (await storage.getSongs()).map(song => {
        if (!['网易云导入', 'QQ音乐导入'].includes(song.remark || '')) return song;
        const metadata = inferSongMetadata(song.songName, song.singer);
        return { ...song, ...metadata, remark: "" };
      });
      const seen = new Set(existing.map(song => `${song.songName.trim().toLowerCase()}\u0000${song.singer.trim().toLowerCase()}`));
      const additions = imported.filter(song => {
        const key = `${song.songName.toLowerCase()}\u0000${song.singer.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).map(song => {
        const metadata = inferSongMetadata(song.songName, song.singer);
        return {
          id: randomUUID(),
          songName: song.songName,
          singer: song.singer,
          ...metadata,
          remark: "",
          captainRequestable: false,
        };
      });
      const savedSongs = await storage.saveSongs([...existing, ...additions]);
      return res.json({ imported: additions.length, skipped: imported.length - additions.length, total: savedSongs.length, songs: savedSongs });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "导入参数无效" });
      console.error("Playlist import failed:", error);
      return res.status(502).json({ error: error instanceof Error ? error.message : "歌单导入失败" });
    }
  });

  app.delete("/api/songs", requireAuth, async (_req, res) => {
    await storage.saveSongs([]);
    return res.json({ cleared: true });
  });

  // POST /api/songs - Add a single song
  app.post("/api/songs", requireAuth, async (req, res) => {
    try {
      const songData = songSchema.omit({ id: true }).parse(req.body);
      const newSong = await storage.addSong(songData);
      res.status(201).json(newSong);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid song data", details: error.errors });
      } else {
        console.error("Error adding song:", error);
        res.status(500).json({ error: "Failed to add song" });
      }
    }
  });

  // PATCH /api/songs/:id - Update a single song
  app.patch("/api/songs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = songSchema.partial().parse(req.body);
      const updatedSong = await storage.updateSong(id, updates);
      
      if (!updatedSong) {
        res.status(404).json({ error: "Song not found" });
        return;
      }
      
      res.json(updatedSong);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid song data", details: error.errors });
      } else {
        console.error("Error updating song:", error);
        res.status(500).json({ error: "Failed to update song" });
      }
    }
  });

  // DELETE /api/songs/:id - Delete a song
  app.delete("/api/songs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSong(id);
      
      if (!deleted) {
        res.status(404).json({ error: "Song not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting song:", error);
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  // ============================================
  // UPLOAD ROUTES
  // ============================================
  
  // POST /api/upload - Upload an image
  app.post("/api/upload", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const extension = detectImageExtension(req.file.buffer);
      if (!extension) {
        res.status(400).json({ error: "图片内容无效，仅支持 JPEG、PNG、GIF 和 WebP" });
        return;
      }
      const publicUrl = await storage.saveUpload(extension, req.file.buffer);
      res.json({ url: publicUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/api/auth/session", (req, res) => res.status(isAuthenticated(req) ? 200 : 401).json({ authenticated: isAuthenticated(req) }));
  app.post("/api/auth/login", async (req, res) => {
    const config = await storage.getConfig();
    const configuredHash = config.adminPassword || process.env.ADMIN_PASSWORD_HASH || "";
    if (!verifyPassword(String(req.body?.password || ""), configuredHash)) return res.status(401).json({ error: "密码错误" });
    setSessionCookie(res, createSession());
    return res.json({ authenticated: true });
  });
  app.post("/api/auth/logout", (_req, res) => { clearSessionCookie(res); return res.json({ authenticated: false }); });

  return httpServer;
}
