import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { siteConfigSchema, songSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============================================
  // CONFIG ROUTES
  // ============================================
  
  // GET /api/config - Get site configuration
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  // PUT /api/config - Update site configuration
  app.put("/api/config", async (req, res) => {
    try {
      const validatedConfig = siteConfigSchema.parse(req.body);
      const savedConfig = await storage.saveConfig(validatedConfig);
      res.json(savedConfig);
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
  app.put("/api/songs", async (req, res) => {
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

  // POST /api/songs - Add a single song
  app.post("/api/songs", async (req, res) => {
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
  app.patch("/api/songs/:id", async (req, res) => {
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
  app.delete("/api/songs/:id", async (req, res) => {
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
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const publicUrl = await storage.saveUpload(req.file.originalname, req.file.buffer);
      res.json({ url: publicUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  return httpServer;
}
