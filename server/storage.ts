import { type SiteConfig, type Song, defaultConfig, defaultSongs } from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// File paths for persistence
const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "site-config.json");
const SONGS_FILE = path.join(DATA_DIR, "songs.json");
const UPLOADS_DIR = path.join(process.cwd(), "client", "public", "uploads");

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Storage interface
export interface IStorage {
  // Config operations
  getConfig(): Promise<SiteConfig>;
  saveConfig(config: SiteConfig): Promise<SiteConfig>;
  
  // Song operations
  getSongs(): Promise<Song[]>;
  saveSongs(songs: Song[]): Promise<Song[]>;
  addSong(song: Omit<Song, "id">): Promise<Song>;
  updateSong(id: string, song: Partial<Song>): Promise<Song | null>;
  deleteSong(id: string): Promise<boolean>;
  
  // Upload operations
  saveUpload(filename: string, buffer: Buffer): Promise<string>;
}

export class FileStorage implements IStorage {
  constructor() {
    ensureDirectories();
  }

  // Config operations
  async getConfig(): Promise<SiteConfig> {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, "utf-8");
        return JSON.parse(data) as SiteConfig;
      }
    } catch (error) {
      console.error("Error reading config file:", error);
    }
    return defaultConfig;
  }

  async saveConfig(config: SiteConfig): Promise<SiteConfig> {
    try {
      ensureDirectories();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
      return config;
    } catch (error) {
      console.error("Error saving config file:", error);
      throw error;
    }
  }

  // Song operations
  async getSongs(): Promise<Song[]> {
    try {
      if (fs.existsSync(SONGS_FILE)) {
        const data = fs.readFileSync(SONGS_FILE, "utf-8");
        return JSON.parse(data) as Song[];
      }
    } catch (error) {
      console.error("Error reading songs file:", error);
    }
    return defaultSongs;
  }

  async saveSongs(songs: Song[]): Promise<Song[]> {
    try {
      ensureDirectories();
      fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2), "utf-8");
      return songs;
    } catch (error) {
      console.error("Error saving songs file:", error);
      throw error;
    }
  }

  async addSong(songData: Omit<Song, "id">): Promise<Song> {
    const songs = await this.getSongs();
    const newSong: Song = {
      ...songData,
      id: randomUUID(),
    };
    songs.push(newSong);
    await this.saveSongs(songs);
    return newSong;
  }

  async updateSong(id: string, updates: Partial<Song>): Promise<Song | null> {
    const songs = await this.getSongs();
    const index = songs.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    songs[index] = { ...songs[index], ...updates, id };
    await this.saveSongs(songs);
    return songs[index];
  }

  async deleteSong(id: string): Promise<boolean> {
    const songs = await this.getSongs();
    const filtered = songs.filter(s => s.id !== id);
    if (filtered.length === songs.length) return false;
    
    await this.saveSongs(filtered);
    return true;
  }

  // Upload operations
  async saveUpload(filename: string, buffer: Buffer): Promise<string> {
    ensureDirectories();
    const ext = path.extname(filename);
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${uniqueName}`;
  }
}

export const storage = new FileStorage();
