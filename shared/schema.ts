import { z } from "zod";

// Song data model
export const songSchema = z.object({
  id: z.string(),
  songName: z.string().min(1),
  singer: z.string().min(1),
  language: z.enum(["Mandarin", "Japanese", "English", "Other"]),
  remark: z.string().optional(),
  captainRequestable: z.boolean().default(false),
  pinyinInitial: z.string().length(1).optional(), // A-Z for Mandarin songs
});

export type Song = z.infer<typeof songSchema>;
export const insertSongSchema = songSchema.omit({ id: true });
export type InsertSong = z.infer<typeof insertSongSchema>;

// Link item inside a card
export const linkItemSchema = z.object({
  id: z.string(),
  url: z.string().url().optional().or(z.literal("")),
  label: z.string(),
  icon: z.string().optional(), // URL or icon name
  openInNewTab: z.boolean().default(true),
  styles: z.object({
    padding: z.string().default("6px 12px"),
    borderRadius: z.string().default("9999px"),
    background: z.string().default("rgba(255,255,255,0.45)"),
    border: z.string().default("1px solid rgba(255,255,255,0.35)"),
    hoverBackground: z.string().default("rgba(255,255,255,0.60)"),
  }).default({}),
});

export type LinkItem = z.infer<typeof linkItemSchema>;

// Card configuration
export const cardSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().optional(),
  links: z.array(linkItemSchema).default([]),
  styles: z.object({
    padding: z.string().default("16px"),
    borderRadius: z.string().default("16px"),
    background: z.string().default("rgba(255,255,255,0.22)"),
    border: z.string().default("1px solid rgba(255,255,255,0.35)"),
    shadow: z.string().default("0 4px 16px rgba(0,0,0,0.08)"),
  }).default({}),
  typography: z.object({
    titleSize: z.string().default("16px"),
    titleWeight: z.string().default("600"),
    bodySize: z.string().default("14px"),
    lineHeight: z.string().default("1.5"),
  }).default({}),
});

export type Card = z.infer<typeof cardSchema>;

// Site configuration schema
export const siteConfigSchema = z.object({
  theme: z.object({
    background: z.string().default("#A9BAC4"),
    autoTextColor: z.boolean().default(true),
    textColorMode: z.enum(["auto", "manual"]).default("auto"),
    manualTextColor: z.string().default("#1B1B1B"),
  }).default({}),
  banner: z.object({
    avatar: z.string().default(""),
    title: z.string().default("VTuber Song List"),
    subtitle: z.string().default("Welcome to my song collection"),
    hint: z.string().default("Hover to see more"),
    styles: z.object({
      titleSize: z.string().default("44px"),
      titleWeight: z.string().default("700"),
      subtitleSize: z.string().default("28px"),
      subtitleWeight: z.string().default("500"),
      hintSize: z.string().default("13px"),
    }).default({}),
  }).default({}),
  hoverBehavior: z.object({
    enabled: z.boolean().default(true),
    showOnHeroHover: z.boolean().default(true),
    fadeInDuration: z.number().default(250),
    fadeOutDuration: z.number().default(200),
  }).default({}),
  cards: z.array(cardSchema).default([]),
  layout: z.object({
    contentMaxWidth: z.string().default("1200px"),
    alignWithTable: z.boolean().default(true),
    filterBarGap: z.string().default("12px"),
    filterBarPadding: z.string().default("16px"),
  }).default({}),
  filterBar: z.object({
    languageTabBackground: z.string().default("rgba(255,255,255,0.45)"),
    searchInputWidth: z.string().default("220px"),
    spacing: z.string().default("12px"),
  }).default({}),
  adminPassword: z.string().default("vtuber123"),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

// Default configuration
export const defaultConfig: SiteConfig = {
  theme: {
    background: "#A9BAC4",
    autoTextColor: true,
    textColorMode: "auto",
    manualTextColor: "#1B1B1B",
  },
  banner: {
    avatar: "",
    title: "VTuber Song List",
    subtitle: "Welcome to my song collection",
    hint: "Hover to see more info",
    styles: {
      titleSize: "44px",
      titleWeight: "700",
      subtitleSize: "28px",
      subtitleWeight: "500",
      hintSize: "13px",
    },
  },
  hoverBehavior: {
    enabled: true,
    showOnHeroHover: true,
    fadeInDuration: 250,
    fadeOutDuration: 200,
  },
  cards: [
    {
      id: "card-1",
      title: "About Me",
      body: "A virtual singer who loves to share music with everyone!",
      links: [
        {
          id: "link-1",
          url: "https://twitter.com",
          label: "Twitter",
          icon: "twitter",
          openInNewTab: true,
          styles: {
            padding: "6px 12px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(255,255,255,0.35)",
            hoverBackground: "rgba(255,255,255,0.60)",
          },
        },
        {
          id: "link-2",
          url: "https://youtube.com",
          label: "YouTube",
          icon: "youtube",
          openInNewTab: true,
          styles: {
            padding: "6px 12px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(255,255,255,0.35)",
            hoverBackground: "rgba(255,255,255,0.60)",
          },
        },
      ],
      styles: {
        padding: "16px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.22)",
        border: "1px solid rgba(255,255,255,0.35)",
        shadow: "0 4px 16px rgba(0,0,0,0.08)",
      },
      typography: {
        titleSize: "16px",
        titleWeight: "600",
        bodySize: "14px",
        lineHeight: "1.5",
      },
    },
    {
      id: "card-2",
      title: "Song Requests",
      body: "Captain members can request songs during streams!",
      links: [
        {
          id: "link-3",
          url: "https://bilibili.com",
          label: "Bilibili",
          icon: "bilibili",
          openInNewTab: true,
          styles: {
            padding: "6px 12px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(255,255,255,0.35)",
            hoverBackground: "rgba(255,255,255,0.60)",
          },
        },
      ],
      styles: {
        padding: "16px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.22)",
        border: "1px solid rgba(255,255,255,0.35)",
        shadow: "0 4px 16px rgba(0,0,0,0.08)",
      },
      typography: {
        titleSize: "16px",
        titleWeight: "600",
        bodySize: "14px",
        lineHeight: "1.5",
      },
    },
  ],
  layout: {
    contentMaxWidth: "1200px",
    alignWithTable: true,
    filterBarGap: "12px",
    filterBarPadding: "16px",
  },
  filterBar: {
    languageTabBackground: "rgba(255,255,255,0.45)",
    searchInputWidth: "220px",
    spacing: "12px",
  },
  adminPassword: "vtuber123",
};

// Default songs
export const defaultSongs: Song[] = [
  { id: "1", songName: "Lemon", singer: "Yonezu Kenshi", language: "Japanese", remark: "Popular hit", captainRequestable: true },
  { id: "2", songName: "Pretender", singer: "Official HIGE DANdism", language: "Japanese", remark: "", captainRequestable: true },
  { id: "3", songName: "Shape of You", singer: "Ed Sheeran", language: "English", remark: "Dance hit", captainRequestable: false },
  { id: "4", songName: "Ai Ni", singer: "Jay Chou", language: "Mandarin", pinyinInitial: "A", remark: "Classic", captainRequestable: true },
  { id: "5", songName: "Bling Bling", singer: "iKON", language: "Other", remark: "K-pop", captainRequestable: false },
  { id: "6", songName: "Bei Jing Huan Ying Ni", singer: "Various", language: "Mandarin", pinyinInitial: "B", remark: "Olympic song", captainRequestable: true },
  { id: "7", songName: "YOASOBI - Racing into the Night", singer: "YOASOBI", language: "Japanese", remark: "Viral hit", captainRequestable: true },
  { id: "8", songName: "Cao Cao", singer: "JJ Lin", language: "Mandarin", pinyinInitial: "C", remark: "Historical theme", captainRequestable: true },
  { id: "9", songName: "Dynamite", singer: "BTS", language: "English", remark: "Global hit", captainRequestable: true },
  { id: "10", songName: "Dao Xiang", singer: "Jay Chou", language: "Mandarin", pinyinInitial: "D", remark: "Nostalgic", captainRequestable: true },
];

// API response types
export type ConfigResponse = SiteConfig;
export type SongsResponse = Song[];
