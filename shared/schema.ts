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
  styles: z
    .object({
      padding: z.string().default("6px 12px"),
      borderRadius: z.string().default("9999px"),
      background: z.string().default("rgba(255,255,255,0.45)"),
      border: z.string().default("1px solid rgba(255,255,255,0.35)"),
      hoverBackground: z.string().default("rgba(255,255,255,0.60)"),
    })
    .default({}),
});

export type LinkItem = z.infer<typeof linkItemSchema>;

// Card configuration
export const cardSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().optional(),
  image: z.string().optional(), // Card image URL
  links: z.array(linkItemSchema).default([]),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(280),
  height: z.number().default(200),
  zIndex: z.number().default(10),
  visible: z.boolean().default(true),
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

// Card animation configuration for card area (legacy, kept for compatibility)
export const cardAnimationSchema = z
  .object({
    type: z
      .enum(["none", "fade", "slide", "scale", "fadeSlide"])
      .default("fade"),
    durationMs: z.number().default(200),
    delayMs: z.number().default(0),
    trigger: z.enum(["hover", "always", "click"]).default("hover"),
    mobileTrigger: z.enum(["always", "click"]).default("always"),
  })
  .default({});

export type CardAnimation = z.infer<typeof cardAnimationSchema>;

// Card image display configuration
export const cardImageConfigSchema = z
  .object({
    fit: z.enum(["contain", "cover"]).default("cover"),
    posX: z.number().min(0).max(100).default(50), // percentage
    posY: z.number().min(0).max(100).default(50), // percentage
    scale: z.number().min(0.5).max(2).default(1),
    boxWidth: z.string().default("100%"),
    boxHeight: z.string().default("128px"),
    borderRadius: z.string().default("8px"),
    padding: z.string().default("0px"),
    backgroundColor: z.string().default("transparent"),
  })
  .default({});

export type CardImageConfig = z.infer<typeof cardImageConfigSchema>;

// Card layout configuration
export const cardLayoutSchema = z
  .object({
    mode: z.enum(["columns", "grid"]).default("columns"), // mode A: columns, mode B: grid
    areaHeight: z.string().default("42vh"), // fixed px or responsive vh
    columnCount: z.number().min(2).max(4).default(2), // for grid mode
    cardWidth: z.string().default("280px"), // width of a single card/column
    cardGap: z.number().min(0).max(40).default(12), // gap between cards
    mobileColumnCount: z.number().min(1).max(2).default(1), // grid mode on mobile
  })
  .default({});

export type CardLayout = z.infer<typeof cardLayoutSchema>;

// Hero cards reveal mode configuration
export const heroCardsSchema = z
  .object({
    mode: z
      .enum(["off", "scrollReveal", "hoverReveal"])
      .default("scrollReveal"),
    heroShiftPx: z.number().default(0), // 0 = auto calculate
    gapPx: z.number().default(32),
    animationDurationMs: z.number().default(400),
    animationEasing: z.string().default("cubic-bezier(0.4, 0, 0.2, 1)"),
  })
  .default({});

export type HeroCards = z.infer<typeof heroCardsSchema>;



// Hero hotspot configuration for precise hover trigger
export const heroHotspotSchema = z
  .object({
    enabled: z.boolean().default(true),
    target: z.enum(["avatar", "title", "icon"]).default("avatar"),
    sizePx: z.number().min(40).max(120).default(80),
    showHint: z.boolean().default(true),
    hintText: z.string().default("移入展开"),
    debounceMs: z.number().min(50).max(200).default(120),
  })
  .default({});

export type HeroHotspot = z.infer<typeof heroHotspotSchema>;

// Copy to clipboard configuration
export const copyConfigSchema = z
  .object({
    enabled: z.boolean().default(true),
    template: z.string().default("点歌 {songName}"),
    toastEnabled: z.boolean().default(true),
  })
  .default({});

export type CopyConfig = z.infer<typeof copyConfigSchema>;

// Filter hint configuration
export const filterHintSchema = z
  .object({
    enabled: z.boolean().default(true),
    text: z.string().default("挑个想听的类别呗~"),
    align: z.enum(["left", "center", "right"]).default("left"),
    fontSize: z.number().default(14),
    colorMode: z.enum(["auto", "manual"]).default("auto"),
    manualColor: z.string().default("#333333"),
  })
  .default({});

export type FilterHint = z.infer<typeof filterHintSchema>;

// UI entry icons configuration
export const entryIconsSchema = z
  .object({
    showYuEntry: z.boolean().default(true),
    showConfigEntry: z.boolean().default(true),
  })
  .default({});

export type EntryIcons = z.infer<typeof entryIconsSchema>;

// Avatar configuration
export const avatarConfigSchema = z.object({
  size: z.number().min(40).max(200).default(160), // size in pixels
  borderWidth: z.string().default("2px"),
  borderColor: z.string().default("rgba(255,255,255,0.35)"),
  borderRadius: z.string().default("50%"),
}).default({});

export type AvatarConfig = z.infer<typeof avatarConfigSchema>;

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
  headerImage: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    width: z.number().default(1200),
    height: z.number().default(360),
    src: z.string().default(""),
    zIndex: z.number().default(1),
  }).default({}),
  hoverBehavior: z.object({
    enabled: z.boolean().default(true),
    showOnHeroHover: z.boolean().default(true),
    fadeInDuration: z.number().default(250),
    fadeOutDuration: z.number().default(200),
  }).default({}),
  cardAnimation: cardAnimationSchema,
  heroCards: heroCardsSchema,
  heroHotspot: heroHotspotSchema,
  displayMode: z.enum(["always", "hoverReveal"]).default("always"),
  copyConfig: copyConfigSchema,
  filterHint: filterHintSchema,
  entryIcons: entryIconsSchema,
  cards: z.array(cardSchema).default([]),
  layout: z
    .object({
      contentMaxWidth: z.string().default("1200px"),
      alignWithTable: z.boolean().default(true),
      filterBarGap: z.string().default("12px"),
      filterBarPadding: z.string().default("16px"),
    })
    .default({}),
  filterBar: z
    .object({
      languageTabBackground: z.string().default("rgba(255,255,255,0.45)"),
      searchInputWidth: z.string().default("220px"),
      spacing: z.string().default("12px"),
    })
    .default({}),
  adminPassword: z.string().default("qwe123"),
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
  headerImage: {
    x: 0,
    y: 0,
    width: 1200,
    height: 360,
    src: "",
    zIndex: 1,
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
  heroCards: {
    mode: "scrollReveal",
    heroShiftPx: 0,
    gapPx: 32,
    animationDurationMs: 400,
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  heroHotspot: {
    enabled: true,
    target: "avatar",
    sizePx: 80,
    showHint: true,
    hintText: "移入展开",
    debounceMs: 120,
  },
  copyConfig: {
    enabled: true,
    template: "点歌 {songName}",
    toastEnabled: true,
  },
  filterHint: {
    enabled: true,
    text: "挑个想听的类别呗~",
    align: "left",
    fontSize: 14,
    colorMode: "auto",
    manualColor: "#333333",
  },
  entryIcons: {
    showYuEntry: true,
    showConfigEntry: true,
  },
  displayMode: "always",
  cards: [
    {
      id: "card-1",
      title: "关于我",
      body: "一个热爱音乐的虚拟歌手，喜欢和大家分享歌曲！",
      x: 20,
      y: 80,
      width: 280,
      height: 200,
      zIndex: 10,
      visible: true,
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
      x: 320,
      y: 120,
      width: 280,
      height: 200,
      zIndex: 10,
      visible: true,
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
  adminPassword: "qwe123",
};

// Default songs
export const defaultSongs: Song[] = [
  {
    id: "1",
    songName: "Lemon",
    singer: "米津玄師",
    language: "Japanese",
    remark: "热门歌曲",
    captainRequestable: true,
  },
  {
    id: "2",
    songName: "Pretender",
    singer: "Official髭男dism",
    language: "Japanese",
    remark: "",
    captainRequestable: true,
  },
  {
    id: "3",
    songName: "Shape of You",
    singer: "Ed Sheeran",
    language: "English",
    remark: "舞曲",
    captainRequestable: false,
  },
  {
    id: "4",
    songName: "爱你",
    singer: "周杰伦",
    language: "Mandarin",
    pinyinInitial: "A",
    remark: "经典",
    captainRequestable: true,
  },
  {
    id: "5",
    songName: "Bling Bling",
    singer: "iKON",
    language: "Other",
    remark: "韩语歌",
    captainRequestable: false,
  },
  {
    id: "6",
    songName: "北京欢迎你",
    singer: "群星",
    language: "Mandarin",
    pinyinInitial: "B",
    remark: "奥运歌曲",
    captainRequestable: true,
  },
  {
    id: "7",
    songName: "夜に駆ける",
    singer: "YOASOBI",
    language: "Japanese",
    remark: "神曲",
    captainRequestable: true,
  },
  {
    id: "8",
    songName: "曹操",
    singer: "林俊杰",
    language: "Mandarin",
    pinyinInitial: "C",
    remark: "历史题材",
    captainRequestable: true,
  },
  {
    id: "9",
    songName: "Dynamite",
    singer: "BTS",
    language: "English",
    remark: "全球热门",
    captainRequestable: true,
  },
  {
    id: "10",
    songName: "稻香",
    singer: "周杰伦",
    language: "Mandarin",
    pinyinInitial: "D",
    remark: "怀旧",
    captainRequestable: true,
  },
];

// API response types
export type ConfigResponse = SiteConfig;
export type SongsResponse = Song[];
