import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { type SiteConfig, type Card, type LinkItem, defaultConfig, defaultSongs, type Song } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfigProvider, getAutoTextColor } from "@/lib/config-context";
import { PasswordGate } from "@/components/password-gate";
import { HeroSection } from "@/components/hero-section";
import { FilterBar } from "@/components/filter-bar";
import { SongTable } from "@/components/song-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Save, Home, Eye, Palette, Layout, Type, Sparkles,
  Square, Plus, Trash2, GripVertical, ExternalLink, Settings, Upload, Image, Copy, MessageSquare,
  Heart, Mail, Phone, MapPin, Link2, Share2, Code, Github, Linkedin, Facebook, Instagram, Share, DollarSign
} from "lucide-react";
import { SiBilibili } from "react-icons/si";

const ICON_OPTIONS = [
  { value: "album-fill", label: "专辑", Icon: undefined },
  { value: "alipay-fill", label: "支付宝", Icon: undefined },
  { value: "anchor-line", label: "主播", Icon: undefined },
  { value: "apple-line", label: "苹果", Icon: undefined },
  { value: "bilibili-line", label: "哔哩哔哩", Icon: undefined },
  { value: "disc-line", label: "唱片", Icon: undefined },
  { value: "external-link-line", label: "外部链接", Icon: undefined },
  { value: "file-copy-line", label: "复制", Icon: undefined },
  { value: "github-fill", label: "GitHub", Icon: undefined },
  { value: "home-3-line", label: "主页", Icon: undefined },
  { value: "link-unlink", label: "链接管理", Icon: undefined },
  { value: "link", label: "链接", Icon: undefined },
  { value: "links-fill", label: "链接填充", Icon: undefined },
  { value: "music-2-line", label: "音乐", Icon: undefined },
  { value: "netease-cloud-music-line", label: "网易云音乐", Icon: undefined },
  { value: "qq-line", label: "QQ", Icon: undefined },
  { value: "search-2-line", label: "搜索", Icon: undefined },
  { value: "settings-line", label: "设置", Icon: undefined },
  { value: "steam-fill", label: "Steam", Icon: undefined },
  { value: "wechat-2-line", label: "微信", Icon: undefined },
  { value: "wechat-fill", label: "微信填充", Icon: undefined },
  { value: "weibo-line", label: "微博", Icon: undefined },
  { value: "zhihu-fill", label: "知乎", Icon: undefined },
  // 兼容旧图标名称
  { value: "twitter", label: "推特", Icon: undefined },
  { value: "youtube", label: "油管", Icon: undefined },
  { value: "bilibili", label: "哔哩哔哩", Icon: undefined },
  { value: "github", label: "GitHub", Icon: undefined },
  { value: "mail", label: "邮件", Icon: undefined },
  { value: "share", label: "分享", Icon: undefined },
  { value: "phone", label: "电话", Icon: undefined },
  { value: "mappin", label: "位置", Icon: undefined },
  { value: "facebook", label: "Facebook", Icon: undefined },
  { value: "instagram", label: "Instagram", Icon: undefined },
  { value: "linkedin", label: "LinkedIn", Icon: undefined },
  { value: "globe", label: "全球", Icon: undefined },
];

const DEFAULT_CARD_IMAGE_CONFIG = {
  fit: "cover" as const,
  posX: 50,
  posY: 50,
  scale: 1,
  boxWidth: "100%",
  boxHeight: "128px",
  borderRadius: "8px",
  padding: "0px",
  backgroundColor: "transparent",
};

const LAYER_ANIMATION_EFFECTS: Array<{
  value: NonNullable<SiteConfig["layerAnimation"]>["effect"];
  label: string;
}> = [
  { value: "fade", label: "淡出" },
  { value: "slideUp", label: "向上退出" },
  { value: "slideDown", label: "向下退出" },
  { value: "slideLeft", label: "向左退出" },
  { value: "slideRight", label: "向右退出" },
  { value: "scale", label: "缩小退出" },
  { value: "zoomOut", label: "放大退出" },
  { value: "rotate", label: "旋转退出" },
  { value: "flip", label: "翻转退出" },
  { value: "blur", label: "模糊退出" },
];

const ANIMATION_PACES = [
  { value: "cubic-bezier(0.22, 1, 0.36, 1)", label: "柔和", description: "自然减速，适合大多数动画" },
  { value: "ease-in-out", label: "平滑", description: "慢慢开始，慢慢结束" },
  { value: "cubic-bezier(0.4, 0, 1, 1)", label: "快速", description: "迅速完成，响应更干脆" },
  { value: "cubic-bezier(0.34, 1.56, 0.64, 1)", label: "弹性", description: "结束时带轻微回弹" },
  { value: "linear", label: "匀速", description: "全程保持相同速度" },
] as const;

function SimpleCardImageEditor({ card, onChange }: { card: Card; onChange: (updates: Partial<Card["imageConfig"]>) => void }) {
  const config = { ...DEFAULT_CARD_IMAGE_CONFIG, ...card.imageConfig };
  const height = Math.max(60, Math.min(400, parseInt(config.boxHeight, 10) || 128));
  return (
    <div className="pt-3 border-t space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm font-medium">调整图片</Label>
          <p className="text-xs text-muted-foreground mt-1">拖动滑块即可在右侧实时查看效果</p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => onChange(DEFAULT_CARD_IMAGE_CONFIG)}>恢复默认</Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">显示方式</Label>
        <Select value={config.fit} onValueChange={(fit) => onChange({ fit: fit as "cover" | "contain" })}>
          <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">填满图片框</SelectItem>
            <SelectItem value="contain">完整显示图片</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs"><Label>图片框高度</Label><span>{height}px</span></div>
        <Slider value={[height]} min={60} max={400} step={4} onValueChange={([value]) => onChange({ boxHeight: `${value}px` })} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs"><Label>放大 / 缩小</Label><span>{Math.round(config.scale * 100)}%</span></div>
        <Slider value={[config.scale * 100]} min={50} max={200} step={5} onValueChange={([value]) => onChange({ scale: value / 100 })} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs"><Label>左右位置</Label><span>{config.posX < 40 ? "偏左" : config.posX > 60 ? "偏右" : "居中"}</span></div>
        <Slider value={[config.posX]} min={0} max={100} step={1} onValueChange={([value]) => onChange({ posX: value })} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs"><Label>上下位置</Label><span>{config.posY < 40 ? "偏上" : config.posY > 60 ? "偏下" : "居中"}</span></div>
        <Slider value={[config.posY]} min={0} max={100} step={1} onValueChange={([value]) => onChange({ posY: value })} />
      </div>
    </div>
  );
}

export default function ConfigPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<SiteConfig>(defaultConfig);
  const [isMobileView, setIsMobileView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { data: savedConfig = defaultConfig, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const { data: songs = defaultSongs } = useQuery<Song[]>({
    queryKey: ["/api/songs?compact=1"],
  });

  useEffect(() => {
    if (savedConfig) {
      setPreviewConfig(savedConfig);
    }
  }, [savedConfig]);

  const saveMutation = useMutation({
    mutationFn: async (config: SiteConfig) => {
      return apiRequest("PUT", "/api/config", config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "保存成功", description: "配置已保存" });
    },
    onError: () => {
      toast({ title: "保存失败", description: "保存配置时出错", variant: "destructive" });
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage("avatar");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (response.ok) {
        const data = await response.json();
        updatePreview("banner", { avatar: data.url });
        toast({ title: "上传成功", description: "头像已更新" });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "上传失败");
      }
    } catch (error) {
      toast({ title: "上传失败", description: error instanceof Error ? error.message : "上传图片时出错", variant: "destructive" });
    } finally {
      e.target.value = "";
      setUploadingImage(null);
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(cardId);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (response.ok) {
        const data = await response.json();
        updateCard(cardId, { image: data.url });
        toast({ title: "上传成功", description: "卡片图片已更新" });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "上传失败");
      }
    } catch (error) {
      toast({ title: "上传失败", description: error instanceof Error ? error.message : "上传图片时出错", variant: "destructive" });
    } finally {
      e.target.value = "";
      setUploadingImage(null);
    }
  };

  const updatePreview = useCallback(<K extends keyof SiteConfig>(
    section: K,
    updates: Partial<SiteConfig[K]>
  ) => {
    setPreviewConfig(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return { ...prev, [section]: { ...currentSection, ...updates } };
      }
      return { ...prev, [section]: updates };
    });
  }, []);

  const updateNestedPreview = useCallback(<K extends keyof SiteConfig>(
    section: K,
    subsection: string,
    updates: Record<string, unknown>
  ) => {
    setPreviewConfig(prev => {
      const currentSection = prev[section] as Record<string, unknown>;
      const currentSubsection = currentSection[subsection];
      if (typeof currentSubsection === 'object' && currentSubsection !== null) {
        return {
          ...prev,
          [section]: { ...currentSection, [subsection]: { ...currentSubsection, ...updates } },
        };
      }
      return prev;
    });
  }, []);

  const addCard = useCallback(() => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: "",
      body: "",
      links: [],
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
      x: 20,
      y: 20,
      width: 280,
      height: 200,
      zIndex: 10,
      visible: true,
      image: "",
      imageConfig: {
        fit: "cover",
        posX: 50,
        posY: 50,
        scale: 1,
        boxWidth: "100%",
        boxHeight: "128px",
        borderRadius: "8px",
        padding: "0px",
        backgroundColor: "transparent",
      },
    };
    setPreviewConfig(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setPreviewConfig(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== cardId) }));
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === cardId ? { ...c, ...updates } : c),
    }));
  }, []);

  const addLink = useCallback((cardId: string) => {
    const newLink: LinkItem = {
      id: `link-${Date.now()}`,
      url: "",
      label: "新链接",
      icon: "globe",
      openInNewTab: true,
      styles: {
        padding: "6px 12px",
        borderRadius: "9999px",
        background: "rgba(255,255,255,0.45)",
        border: "1px solid rgba(255,255,255,0.35)",
        hoverBackground: "rgba(255,255,255,0.60)",
      },
    };
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === cardId ? { ...c, links: [...c.links, newLink] } : c),
    }));
  }, []);

  const removeLink = useCallback((cardId: string, linkId: string) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === cardId ? { ...c, links: c.links.filter(l => l.id !== linkId) } : c),
    }));
  }, []);

  const updateLink = useCallback((cardId: string, linkId: string, updates: Partial<LinkItem>) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === cardId 
        ? { ...c, links: c.links.map(l => l.id === linkId ? { ...l, ...updates } : l) } 
        : c
      ),
    }));
  }, []);

  const handleHeaderDragEnd = useCallback((position: { x: number; y: number }, size: { width: number; height: number }) => {
    setPreviewConfig(prev => ({
      ...prev,
      headerImage: {
        ...prev.headerImage,
        ...position,
        ...size,
      },
    }));
  }, []);

  const handleCardDragEnd = useCallback((cardId: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(card => card.id === cardId ? {
        ...card,
        ...position,
        ...size,
      } : card),
    }));
  }, []);

  const handleAreaResizeEnd = useCallback((size: { width: number; height: number }) => {
    setPreviewConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, functionalAreaWidth: size.width, functionalAreaHeight: size.height },
    }));
  }, []);

  const handleCardImageChange = useCallback((cardId: string, updates: Partial<Card["imageConfig"]>) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(card => card.id === cardId ? {
        ...card,
        imageConfig: { ...DEFAULT_CARD_IMAGE_CONFIG, ...card.imageConfig, ...updates },
      } : card),
    }));
  }, []);

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />;
  }

  // Defensive defaults
  const heroCards = previewConfig.heroCards ?? { mode: "scrollReveal", heroShiftPx: 0, gapPx: 32, animationDurationMs: 400, animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)" };
  const copyConfig = previewConfig.copyConfig ?? { enabled: true, template: "点歌 {songName}", toastEnabled: true };
  const filterHint = previewConfig.filterHint ?? { enabled: true, text: "挑个想听的类别呗~", align: "left", fontSize: 14, colorMode: "auto", manualColor: "#333333" };

  const EditorContent = (
    <div className="p-4">
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="w-full grid grid-cols-6 mb-4">
          <TabsTrigger value="theme" className="gap-1 text-xs">
            <Palette className="w-3 h-3" />
            <span className="hidden sm:inline">外观</span>
          </TabsTrigger>
          <TabsTrigger value="banner" className="gap-1 text-xs">
            <Type className="w-3 h-3" />
            <span className="hidden sm:inline">头图</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-1 text-xs">
            <Square className="w-3 h-3" />
            <span className="hidden sm:inline">卡片</span>
          </TabsTrigger>
          <TabsTrigger value="animation" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">动画</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1 text-xs">
            <Copy className="w-3 h-3" />
            <span className="hidden sm:inline">交互</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-1 text-xs">
            <Layout className="w-3 h-3" />
            <span className="hidden sm:inline">布局</span>
          </TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">背景颜色</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Label className="w-16 text-sm flex-shrink-0">颜色</Label>
                <Input type="color" value={previewConfig.theme.background} onChange={(e) => updatePreview("theme", { background: e.target.value })} className="w-12 h-10 p-1 rounded-lg cursor-pointer" data-testid="input-bg-color" />
                <Input type="text" value={previewConfig.theme.background} onChange={(e) => updatePreview("theme", { background: e.target.value })} className="flex-1 rounded-lg" data-testid="input-bg-color-text" />
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">文字颜色</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">自动文字颜色</Label>
                <Switch checked={previewConfig.theme.textColorMode === "auto"} onCheckedChange={(checked) => updatePreview("theme", { textColorMode: checked ? "auto" : "manual" })} data-testid="switch-auto-text" />
              </div>
              {previewConfig.theme.textColorMode === "manual" && (
                <div className="flex items-center gap-3">
                  <Label className="w-16 text-sm flex-shrink-0">颜色</Label>
                  <Input type="color" value={previewConfig.theme.manualTextColor} onChange={(e) => updatePreview("theme", { manualTextColor: e.target.value })} className="w-12 h-10 p-1 rounded-lg cursor-pointer" />
                  <Input type="text" value={previewConfig.theme.manualTextColor} onChange={(e) => updatePreview("theme", { manualTextColor: e.target.value })} className="flex-1 rounded-lg" />
                </div>
              )}
            </CardContent>
          </UICard>

        </TabsContent>

        {/* Banner Tab */}
        <TabsContent value="banner" className="space-y-4">
          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">头像</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {previewConfig.banner.avatar ? (
                  <img src={previewConfig.banner.avatar} alt="头像预览" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 flex flex-wrap gap-2">
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarUpload} className="hidden" />
                  <Button variant="secondary" size="sm" disabled={uploadingImage !== null} onClick={() => fileInputRef.current?.click()} className="rounded-lg gap-2">
                    <Upload className="w-4 h-4" />{uploadingImage === "avatar" ? "上传中…" : previewConfig.banner.avatar ? "替换头像" : "上传头像"}
                  </Button>
                  {previewConfig.banner.avatar && (
                    <Button variant="ghost" size="sm" onClick={() => updatePreview("banner", { avatar: "" })} className="rounded-lg text-destructive gap-2">
                      <Trash2 className="w-4 h-4" />清除
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">文案</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">标题</Label>
                <Input type="text" value={previewConfig.banner.title} onChange={(e) => updatePreview("banner", { title: e.target.value })} className="rounded-lg" data-testid="input-banner-title" />
              </div>
              <div>
                <Label className="text-sm mb-2 block">副标题</Label>
                <Input type="text" value={previewConfig.banner.subtitle} onChange={(e) => updatePreview("banner", { subtitle: e.target.value })} className="rounded-lg" data-testid="input-banner-subtitle" />
              </div>
              <div>
                <Label className="text-sm mb-2 block">提示文字</Label>
                <Input type="text" value={previewConfig.banner.hint} onChange={(e) => updatePreview("banner", { hint: e.target.value })} className="rounded-lg" data-testid="input-banner-hint" />
              </div>
            </CardContent>
          </UICard>

        </TabsContent>

        {/* Animation Tab */}
        <TabsContent value="animation" className="space-y-4">
          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">头图卡片展示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">展示模式</Label>
                <Select value={previewConfig.displayMode} onValueChange={(value) => setPreviewConfig(prev => ({ ...prev, displayMode: value as "always" | "hoverReveal" }))}>
                  <SelectTrigger className="rounded-lg" data-testid="select-display-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">始终显示</SelectItem>
                    <SelectItem value="hoverReveal">悬停触发</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">头图退出动画</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">启用头图悬停退出</Label>
                <Switch checked={previewConfig.layerAnimation?.enabled ?? false} onCheckedChange={(enabled) => setPreviewConfig(prev => ({ ...prev, layerAnimation: { ...(prev.layerAnimation ?? { triggerLayer: 1, targetLayer: 2, effect: "fade", durationMs: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }), enabled } }))} />
              </div>
              <p className="text-xs text-muted-foreground rounded-lg bg-muted/60 p-3">
                鼠标移入头图时，头图播放退出动画并显示下方卡片；鼠标离开后头图自动返回。
              </p>
              <div>
                <Label className="text-sm mb-2 block">显示效果</Label>
                <div className="grid grid-cols-2 gap-2">
                  {LAYER_ANIMATION_EFFECTS.map((item) => {
                    const selected = (previewConfig.layerAnimation?.effect ?? "fade") === item.value;
                    return (
                      <Button
                        key={item.value}
                        type="button"
                        size="sm"
                        variant={selected ? "default" : "outline"}
                        className="justify-start rounded-lg"
                        onClick={() => setPreviewConfig(prev => ({ ...prev, layerAnimation: { ...prev.layerAnimation, effect: item.value } }))}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-sm mb-2 block">动画时长（毫秒）</Label>
                <Input type="number" min={0} max={5000} step={50} value={previewConfig.layerAnimation?.durationMs ?? 400} onChange={(e) => setPreviewConfig(prev => ({ ...prev, layerAnimation: { ...prev.layerAnimation, durationMs: Number(e.target.value) } }))} className="rounded-lg" />
              </div>
              <div>
                <Label className="text-sm mb-2 block">动画节奏</Label>
                <Select
                  value={previewConfig.layerAnimation?.easing ?? ANIMATION_PACES[0].value}
                  onValueChange={(easing) => setPreviewConfig(prev => ({ ...prev, layerAnimation: { ...prev.layerAnimation, easing } }))}
                >
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANIMATION_PACES.map((pace) => (
                      <SelectItem key={pace.value} value={pace.value}>
                        {pace.label} — {pace.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">元素层级</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {previewConfig.cards.map((card, index) => (
                <div key={card.id} className="flex items-center gap-3">
                  <Label className="flex-1 text-sm truncate">卡片 {index + 1}：{card.title || "未命名"}</Label>
                  <Input type="number" min={0} max={999} value={card.zIndex} onChange={(e) => updateCard(card.id, { zIndex: Number(e.target.value) })} className="w-24 rounded-lg" aria-label={`${card.title || `卡片 ${index + 1}`}层级`} />
                </div>
              ))}
              {previewConfig.cards.length === 0 && <p className="text-sm text-muted-foreground">暂无卡片</p>}
            </CardContent>
          </UICard>

        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">卡片 ({previewConfig.cards.length})</h3>
            <Button variant="secondary" size="sm" onClick={addCard} className="rounded-lg gap-1" data-testid="button-add-card">
              <Plus className="w-3 h-3" />添加卡片
            </Button>
          </div>

          {previewConfig.cards.map((card, index) => (
            <UICard key={card.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <CardTitle className="text-sm">卡片 {index + 1}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCard(card.id)} className="rounded-lg text-destructive" data-testid={`button-delete-card-${card.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">标题</Label>
                  <Input type="text" value={card.title} onChange={(e) => updateCard(card.id, { title: e.target.value })} className="rounded-lg" data-testid={`input-card-title-${card.id}`} />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">内容</Label>
                  <Textarea value={card.body || ""} onChange={(e) => updateCard(card.id, { body: e.target.value })} className="rounded-lg resize-none" rows={2} data-testid={`input-card-body-${card.id}`} />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">卡片图片</Label>
                  <div className="flex items-center gap-3">
                    {card.image ? (
                      <img src={card.image} alt="卡片图片" className="w-16 h-16 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Image className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-wrap gap-2">
                      <input id={`card-image-upload-${card.id}`} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => handleCardImageUpload(e, card.id)} className="hidden" />
                      <Button variant="secondary" size="sm" disabled={uploadingImage !== null} onClick={() => document.getElementById(`card-image-upload-${card.id}`)?.click()} className="rounded-lg gap-2 h-8">
                        <Upload className="w-3 h-3" />{uploadingImage === card.id ? "上传中…" : card.image ? "替换图片" : "上传图片"}
                      </Button>
                      {card.image && (
                        <Button variant="ghost" size="sm" onClick={() => updateCard(card.id, { image: "" })} className="rounded-lg text-destructive gap-2 h-8">
                          <Trash2 className="w-3 h-3" />清除
                        </Button>
                      )}
                    </div>
                  </div>
                  {card.image && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      右侧直接操作：拖动图片定位，滚轮缩放；拖动图片右边或底边调整尺寸，双击恢复完整显示。
                    </p>
                  )}
                </div>
                
                {false && card.image && (
                  <SimpleCardImageEditor
                    card={card}
                    onChange={(updates) => updateCard(card.id, { imageConfig: { ...DEFAULT_CARD_IMAGE_CONFIG, ...card.imageConfig, ...updates } })}
                  />
                )}

                {/* 旧版高级图片配置保留用于数据兼容，但不再显示 */}
                {false && card.image && (
                  <div className="pt-2 border-t space-y-3">
                    <Label className="text-sm font-medium block">图片配置</Label>
                    
                    {/* 图片大小 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1 block">宽度</Label>
                        <Input 
                          type="text" 
                          value={card.imageConfig?.boxWidth || "100%"} 
                          onChange={(e) => updateCard(card.id, { 
                            imageConfig: { 
                              ...(card.imageConfig || { 
                                fit: "cover",
                                posX: 50,
                                posY: 50,
                                scale: 1,
                                boxWidth: "100%",
                                boxHeight: "128px",
                                borderRadius: "8px",
                                padding: "0px",
                                backgroundColor: "transparent",
                              }), 
                              boxWidth: e.target.value 
                            } 
                          })} 
                          className="rounded-lg text-sm h-8" 
                          placeholder="100%" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">高度</Label>
                        <Input 
                          type="text" 
                          value={card.imageConfig?.boxHeight || "128px"} 
                          onChange={(e) => updateCard(card.id, { 
                            imageConfig: { 
                              ...(card.imageConfig || { 
                                fit: "cover",
                                posX: 50,
                                posY: 50,
                                scale: 1,
                                boxWidth: "100%",
                                boxHeight: "128px",
                                borderRadius: "8px",
                                padding: "0px",
                                backgroundColor: "transparent",
                              }), 
                              boxHeight: e.target.value 
                            } 
                          })} 
                          className="rounded-lg text-sm h-8" 
                          placeholder="128px" 
                        />
                      </div>
                    </div>
                    
                    {/* 图片拟合方式 */}
                    <div>
                      <Label className="text-xs mb-1 block">拟合方式</Label>
                      <Select 
                        value={card.imageConfig?.fit || "cover"} 
                        onValueChange={(value) => updateCard(card.id, { 
                          imageConfig: { 
                            ...(card.imageConfig || { 
                              fit: "cover",
                              posX: 50,
                              posY: 50,
                              scale: 1,
                              boxWidth: "100%",
                              boxHeight: "128px",
                              borderRadius: "8px",
                              padding: "0px",
                              backgroundColor: "transparent",
                            }), 
                            fit: value as "contain" | "cover" 
                          } 
                        })} 
                      >
                        <SelectTrigger className="rounded-lg text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contain">包含</SelectItem>
                          <SelectItem value="cover">覆盖</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* 图片缩放 */}
                    <div>
                      <Label className="text-xs mb-1 block">缩放比例: {(card.imageConfig?.scale || 1).toFixed(1)}x</Label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.1" 
                        value={card.imageConfig?.scale || 1} 
                        onChange={(e) => updateCard(card.id, { 
                          imageConfig: { 
                            ...(card.imageConfig || { 
                              fit: "cover",
                              posX: 50,
                              posY: 50,
                              scale: 1,
                              boxWidth: "100%",
                              boxHeight: "128px",
                              borderRadius: "8px",
                              padding: "0px",
                              backgroundColor: "transparent",
                            }), 
                            scale: parseFloat(e.target.value) 
                          } 
                        })} 
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    
                    {/* 图片位置 */}
                    <div className="space-y-2">
                      <Label className="text-xs mb-1 block">图片位置</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">水平: {(card.imageConfig?.posX || 50)}%</Label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={card.imageConfig?.posX || 50} 
                            onChange={(e) => updateCard(card.id, { 
                              imageConfig: { 
                                ...(card.imageConfig || { 
                                  fit: "cover",
                                  posX: 50,
                                  posY: 50,
                                  scale: 1,
                                  boxWidth: "100%",
                                  boxHeight: "128px",
                                  borderRadius: "8px",
                                  padding: "0px",
                                  backgroundColor: "transparent",
                                }), 
                                posX: parseInt(e.target.value) 
                              } 
                            })} 
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">垂直: {(card.imageConfig?.posY || 50)}%</Label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={card.imageConfig?.posY || 50} 
                            onChange={(e) => updateCard(card.id, { 
                              imageConfig: { 
                                ...(card.imageConfig || { 
                                  fit: "cover",
                                  posX: 50,
                                  posY: 50,
                                  scale: 1,
                                  boxWidth: "100%",
                                  boxHeight: "128px",
                                  borderRadius: "8px",
                                  padding: "0px",
                                  backgroundColor: "transparent",
                                }), 
                                posY: parseInt(e.target.value) 
                              } 
                            })} 
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 圆角和内边距 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1 block">圆角</Label>
                        <Input 
                          type="text" 
                          value={card.imageConfig?.borderRadius || "8px"} 
                          onChange={(e) => updateCard(card.id, { 
                            imageConfig: { 
                              ...(card.imageConfig || { 
                                fit: "cover",
                                posX: 50,
                                posY: 50,
                                scale: 1,
                                boxWidth: "100%",
                                boxHeight: "128px",
                                borderRadius: "8px",
                                padding: "0px",
                                backgroundColor: "transparent",
                              }), 
                              borderRadius: e.target.value 
                            } 
                          })} 
                          className="rounded-lg text-sm h-8" 
                          placeholder="8px" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">内边距</Label>
                        <Input 
                          type="text" 
                          value={card.imageConfig?.padding || "0px"} 
                          onChange={(e) => updateCard(card.id, { 
                            imageConfig: { 
                              ...(card.imageConfig || { 
                                fit: "cover",
                                posX: 50,
                                posY: 50,
                                scale: 1,
                                boxWidth: "100%",
                                boxHeight: "128px",
                                borderRadius: "8px",
                                padding: "0px",
                                backgroundColor: "transparent",
                              }), 
                              padding: e.target.value 
                            } 
                          })} 
                          className="rounded-lg text-sm h-8" 
                          placeholder="0px" 
                        />
                      </div>
                    </div>
                    
                    {/* 背景色 */}
                    <div>
                      <Label className="text-xs mb-1 block">背景色</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          value={card.imageConfig?.backgroundColor || "#ffffff"} 
                          onChange={(e) => updateCard(card.id, { 
                            imageConfig: { 
                              ...(card.imageConfig || { 
                                fit: "cover",
                                posX: 50,
                                posY: 50,
                                scale: 1,
                                boxWidth: "100%",
                                boxHeight: "128px",
                                borderRadius: "8px",
                                padding: "0px",
                                backgroundColor: "transparent",
                              }), 
                              backgroundColor: e.target.value 
                            } 
                          })} 
                          className="w-10 h-8 p-0 rounded-lg cursor-pointer" 
                        />
                        <Input 
                          type="text" 
                          value={card.imageConfig?.backgroundColor || "transparent"} 
                          onChange={(e) => updateCard(card.id, { 
                            imageConfig: { 
                              ...(card.imageConfig || { 
                                fit: "cover",
                                posX: 50,
                                posY: 50,
                                scale: 1,
                                boxWidth: "100%",
                                boxHeight: "128px",
                                borderRadius: "8px",
                                padding: "0px",
                                backgroundColor: "transparent",
                              }), 
                              backgroundColor: e.target.value 
                            } 
                          })} 
                          className="flex-1 rounded-lg text-sm h-8" 
                          placeholder="transparent" 
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">链接 ({card.links.length})</Label>
                    <Button variant="ghost" size="sm" onClick={() => addLink(card.id)} className="rounded-lg gap-1 h-7" data-testid={`button-add-link-${card.id}`}>
                      <Plus className="w-3 h-3" />添加
                    </Button>
                  </div>
                  {card.links.map((link) => (
                    <div key={link.id} className="space-y-2 p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Input type="text" value={link.label} onChange={(e) => updateLink(card.id, link.id, { label: e.target.value })} className="flex-1 h-8 rounded-lg text-sm" placeholder="名称" />
                        <Input type="text" value={link.url || ""} onChange={(e) => updateLink(card.id, link.id, { url: e.target.value })} className="flex-1 h-8 rounded-lg text-sm" placeholder="链接" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={link.icon || "globe"} onValueChange={(value) => updateLink(card.id, link.id, { icon: value })}>
                          <SelectTrigger className="flex-1 h-8 rounded-lg text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => removeLink(card.id, link.id)} className="h-8 w-8 rounded-lg text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </UICard>
          ))}
        </TabsContent>

        {/* Features Tab - NEW */}
        <TabsContent value="features" className="space-y-4">
          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">点击复制歌名</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">启用复制功能</Label>
                <Switch checked={copyConfig.enabled} onCheckedChange={(checked) => updatePreview("copyConfig", { enabled: checked })} data-testid="switch-copy-enabled" />
              </div>
              <div>
                <Label className="text-sm mb-2 block">复制模板</Label>
                <Input type="text" value={copyConfig.template} onChange={(e) => updatePreview("copyConfig", { template: e.target.value })} className="rounded-lg" placeholder="点歌 {songName}" data-testid="input-copy-template" />
                <p className="text-xs text-muted-foreground mt-1">{"{songName}"} 会被替换为歌曲名</p>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">显示复制提示</Label>
                <Switch checked={copyConfig.toastEnabled} onCheckedChange={(checked) => updatePreview("copyConfig", { toastEnabled: checked })} data-testid="switch-copy-toast" />
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">筛选区提示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">显示提示文字</Label>
                <Switch checked={filterHint.enabled} onCheckedChange={(checked) => updatePreview("filterHint", { enabled: checked })} data-testid="switch-filter-hint" />
              </div>
              {filterHint.enabled && (
                <>
                  <div>
                    <Label className="text-sm mb-2 block">提示文字</Label>
                    <Input type="text" value={filterHint.text} onChange={(e) => updatePreview("filterHint", { text: e.target.value })} className="rounded-lg" data-testid="input-filter-hint-text" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm mb-2 block">对齐方式</Label>
                      <Select value={filterHint.align} onValueChange={(value) => updatePreview("filterHint", { align: value as "left" | "center" | "right" })}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">左对齐</SelectItem>
                          <SelectItem value="center">居中</SelectItem>
                          <SelectItem value="right">右对齐</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">字体大小</Label>
                      <Input type="number" value={filterHint.fontSize} onChange={(e) => updatePreview("filterHint", { fontSize: parseInt(e.target.value) || 14 })} className="rounded-lg" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">自动颜色</Label>
                    <Switch checked={filterHint.colorMode === "auto"} onCheckedChange={(checked) => updatePreview("filterHint", { colorMode: checked ? "auto" : "manual" })} />
                  </div>
                  {filterHint.colorMode === "manual" && (
                    <div className="flex items-center gap-3">
                      <Label className="w-16 text-sm flex-shrink-0">颜色</Label>
                      <Input type="color" value={filterHint.manualColor} onChange={(e) => updatePreview("filterHint", { manualColor: e.target.value })} className="w-12 h-10 p-1 rounded-lg cursor-pointer" />
                      <Input type="text" value={filterHint.manualColor} onChange={(e) => updatePreview("filterHint", { manualColor: e.target.value })} className="flex-1 rounded-lg" />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">管理入口</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">显示配置入口</Label>
                <Switch checked={previewConfig.entryIcons?.showConfigEntry ?? true} onCheckedChange={(checked) => updatePreview("entryIcons", { showConfigEntry: checked })} data-testid="switch-show-config-entry" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">显示歌单入口</Label>
                <Switch checked={previewConfig.entryIcons?.showYuEntry ?? true} onCheckedChange={(checked) => updatePreview("entryIcons", { showYuEntry: checked })} data-testid="switch-show-yu-entry" />
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">管理密码</CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="password" value={previewConfig.adminPassword} onChange={(e) => setPreviewConfig(prev => ({ ...prev, adminPassword: e.target.value }))} className="rounded-lg" placeholder="留空则不修改密码" autoComplete="new-password" data-testid="input-admin-password" />
            </CardContent>
          </UICard>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">内容布局</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">最大宽度</Label>
                <Input type="text" value={previewConfig.layout.contentMaxWidth} onChange={(e) => updatePreview("layout", { contentMaxWidth: e.target.value })} className="rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-2 block">功能区宽度</Label>
                  <Input type="number" min={240} max={10000} value={previewConfig.layout.functionalAreaWidth ?? 1200} onChange={(e) => updatePreview("layout", { functionalAreaWidth: Number(e.target.value) })} className="rounded-lg" />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">功能区高度</Label>
                  <Input type="number" min={280} max={1400} value={previewConfig.layout.functionalAreaHeight ?? 450} onChange={(e) => updatePreview("layout", { functionalAreaHeight: Number(e.target.value) })} className="rounded-lg" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">对齐表格</Label>
                <Switch checked={previewConfig.layout.alignWithTable} onCheckedChange={(checked) => updatePreview("layout", { alignWithTable: checked })} />
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">筛选栏</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">搜索框宽度</Label>
                <Input type="text" value={previewConfig.filterBar.searchInputWidth} onChange={(e) => updatePreview("filterBar", { searchInputWidth: e.target.value })} className="rounded-lg" />
              </div>
            </CardContent>
          </UICard>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobileView) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 p-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold">配置</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl" data-testid="link-home">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={() => saveMutation.mutate(previewConfig)} disabled={saveMutation.isPending} size="sm" className="rounded-xl gap-2" data-testid="button-save-config">
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "保存�?.." : "保存"}
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-57px)] custom-scrollbar">
          {EditorContent}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="w-[480px] border-r flex flex-col bg-card">
        <div className="flex items-center justify-between gap-4 p-4 border-b sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">配置</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl" data-testid="link-home">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={() => saveMutation.mutate(previewConfig)} disabled={saveMutation.isPending} className="rounded-xl gap-2" data-testid="button-save-config">
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "保存�?.." : "保存"}
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 custom-scrollbar">
          {EditorContent}
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar" style={{ backgroundColor: previewConfig.theme.background }}>
        <ConfigProvider initialConfig={previewConfig}>
          <div className="flex flex-col items-center min-h-full">
            <div className="w-full p-2 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-black/5">
              <Eye className="w-3.5 h-3.5" />
              所见即所得实时预览（元素可直接拖动）
            </div>
            <HeroSection 
              config={previewConfig} 
              isMobile={false} 
              onCardDragEnd={handleCardDragEnd}
              onHeaderDragEnd={handleHeaderDragEnd}
              onAreaResizeEnd={handleAreaResizeEnd}
              onCardImageChange={handleCardImageChange}
              canDrag={true}
            />
            <FilterBar config={previewConfig} songs={songs} onFilteredSongsChange={() => {}} />
            <div className="w-full px-4 pb-8 flex justify-center" style={{ maxWidth: previewConfig.layout.contentMaxWidth }}>
              <SongTable config={previewConfig} songs={songs.slice(0, 5)} />
            </div>
          </div>
        </ConfigProvider>
      </div>
    </div>
  );
}
