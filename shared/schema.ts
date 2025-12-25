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

// Animation configuration for card area
export const cardAnimationSchema = z.object({
  type: z.enum(["none", "fade", "slide", "scale", "fadeSlide"]).default("fade"),
  durationMs: z.number().default(200),
  delayMs: z.number().default(0),
  trigger: z.enum(["hover", "always", "click"]).default("hover"),
  mobileTrigger: z.enum(["always", "click"]).default("always"),
}).default({});

export type CardAnimation = z.infer<typeof cardAnimationSchema>;

// UI entry icons configuration
export const entryIconsSchema = z.object({
  showYuEntry: z.boolean().default(true),
  showConfigEntry: z.boolean().default(true),
}).default({});

export type EntryIcons = z.infer<typeof entryIconsSchema>;

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
    title: z.string().default("歌单列表"),
    subtitle: z.string().default("欢迎来到我的歌单"),
    hint: z.string().default("移入查看更多"),
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
  cardAnimation: cardAnimationSchema,
  entryIcons: entryIconsSchema,
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

// Default configuration with Chinese text
export const defaultConfig: SiteConfig = {
  theme: {
    background: "#A9BAC4",
    autoTextColor: true,
    textColorMode: "auto",
    manualTextColor: "#1B1B1B",
  },
  banner: {
    avatar: "",
    title: "歌单列表",
    subtitle: "欢迎来到我的歌单",
    hint: "移入查看更多",
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
  cardAnimation: {
    type: "fade",
    durationMs: 200,
    delayMs: 0,
    trigger: "hover",
    mobileTrigger: "always",
  },
  entryIcons: {
    showYuEntry: true,
    showConfigEntry: true,
  },
  cards: [
    {
      id: "card-1",
      title: "关于我",
      body: "一个热爱音乐的虚拟歌手，喜欢和大家分享歌曲！",
      links: [
        {
          id: "link-1",
          url: "https://twitter.com",
          label: "推特",
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
          label: "油管",
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
      title: "点歌说明",
      body: "舰长可以在直播期间点歌哦！",
      links: [
        {
          id: "link-3",
          url: "https://bilibili.com",
          label: "B站",
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
  { id: "1", songName: "Lemon", singer: "米津玄師", language: "Japanese", remark: "热门歌曲", captainRequestable: true },
  { id: "2", songName: "Pretender", singer: "Official髭男dism", language: "Japanese", remark: "", captainRequestable: true },
  { id: "3", songName: "Shape of You", singer: "Ed Sheeran", language: "English", remark: "舞曲", captainRequestable: false },
  { id: "4", songName: "爱你", singer: "周杰伦", language: "Mandarin", pinyinInitial: "A", remark: "经典", captainRequestable: true },
  { id: "5", songName: "Bling Bling", singer: "iKON", language: "Other", remark: "韩语歌", captainRequestable: false },
  { id: "6", songName: "北京欢迎你", singer: "群星", language: "Mandarin", pinyinInitial: "B", remark: "奥运歌曲", captainRequestable: true },
  { id: "7", songName: "夜に駆ける", singer: "YOASOBI", language: "Japanese", remark: "神曲", captainRequestable: true },
  { id: "8", songName: "曹操", singer: "林俊杰", language: "Mandarin", pinyinInitial: "C", remark: "历史题材", captainRequestable: true },
  { id: "9", songName: "Dynamite", singer: "BTS", language: "English", remark: "全球热门", captainRequestable: true },
  { id: "10", songName: "稻香", singer: "周杰伦", language: "Mandarin", pinyinInitial: "D", remark: "怀旧", captainRequestable: true },
];

// API response types
export type ConfigResponse = SiteConfig;
export type SongsResponse = Song[];
