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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Save, Home, Eye, Palette, Layout, Type, 
  Square, Plus, Trash2, GripVertical, ExternalLink, Settings, Upload, Image, Copy, MessageSquare,
  Heart, Mail, Phone, MapPin, Link2, Share2, Code, Github, Linkedin, Facebook, Instagram, Share, DollarSign
} from "lucide-react";
import { SiBilibili, SiTwitter, SiYoutube } from "react-icons/si";

const ICON_OPTIONS = [
  { value: "globe", label: "全球", Icon: undefined },
  { value: "twitter", label: "推特", Icon: undefined },
  { value: "youtube", label: "油管", Icon: undefined },
  { value: "bilibili", label: "B站", Icon: undefined },
  { value: "github", label: "GitHub", Icon: undefined },
  { value: "mail", label: "邮件", Icon: undefined },
  { value: "link", label: "链接", Icon: undefined },
  { value: "share", label: "分享", Icon: undefined },
  { value: "phone", label: "电话", Icon: undefined },
  { value: "mappin", label: "位置", Icon: undefined },
  { value: "facebook", label: "Facebook", Icon: undefined },
  { value: "instagram", label: "Instagram", Icon: undefined },
  { value: "linkedin", label: "LinkedIn", Icon: undefined },
];

export default function ConfigPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<SiteConfig>(defaultConfig);
  const [isMobileView, setIsMobileView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardImageInputRef = useRef<HTMLInputElement>(null);
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
    queryKey: ["/api/songs"],
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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (response.ok) {
        const data = await response.json();
        updatePreview("banner", { avatar: data.url });
        toast({ title: "上传成功", description: "头像已更新" });
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      toast({ title: "上传失败", description: "上传图片时出错", variant: "destructive" });
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (response.ok) {
        const data = await response.json();
        updateCard(cardId, { image: data.url });
        toast({ title: "上传成功", description: "卡片图片已更新" });
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      toast({ title: "上传失败", description: "上传图片时出错", variant: "destructive" });
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
      title: "新卡片",
      body: "卡片描述",
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

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} correctPassword={savedConfig.adminPassword} />;
  }

  // Defensive defaults
  const heroCards = previewConfig.heroCards ?? { mode: "scrollReveal", heroShiftPx: 0, gapPx: 32, animationDurationMs: 400, animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)" };
  const heroHotspot = previewConfig.heroHotspot ?? { enabled: true, target: "avatar", sizePx: 80, showHint: true, hintText: "移入展开", debounceMs: 120 };
  const copyConfig = previewConfig.copyConfig ?? { enabled: true, template: "点歌 {songName}", toastEnabled: true };
  const filterHint = previewConfig.filterHint ?? { enabled: true, text: "挑个想听的类别呗~", align: "left", fontSize: 14, colorMode: "auto", manualColor: "#333333" };

  const EditorContent = (
    <div className="p-4">
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger value="theme" className="gap-1 text-xs">
            <Palette className="w-3 h-3" />
            <span className="hidden sm:inline">主题</span>
          </TabsTrigger>
          <TabsTrigger value="banner" className="gap-1 text-xs">
            <Type className="w-3 h-3" />
            <span className="hidden sm:inline">横幅</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-1 text-xs">
            <Square className="w-3 h-3" />
            <span className="hidden sm:inline">卡片</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1 text-xs">
            <Copy className="w-3 h-3" />
            <span className="hidden sm:inline">功能</span>
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

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">入口图标</CardTitle>
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
              <Input type="text" value={previewConfig.adminPassword} onChange={(e) => setPreviewConfig(prev => ({ ...prev, adminPassword: e.target.value }))} className="rounded-lg" placeholder="管理密码" data-testid="input-admin-password" />
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
                <div className="flex-1 space-y-2">
                  <Input type="text" value={previewConfig.banner.avatar} onChange={(e) => updatePreview("banner", { avatar: e.target.value })} className="rounded-lg" placeholder="输入图片URL或上传图片" data-testid="input-avatar-url" />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg gap-2">
                    <Upload className="w-4 h-4" />上传头像
                  </Button>
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

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">头图卡片展示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">展示模式</Label>
                <Select value={heroCards.mode} onValueChange={(value) => updatePreview("heroCards", { mode: value as "off" | "scrollReveal" | "hoverReveal" })}>
                  <SelectTrigger className="rounded-lg" data-testid="select-hero-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">始终显示</SelectItem>
                    <SelectItem value="scrollReveal">滚动触发</SelectItem>
                    <SelectItem value="hoverReveal">悬停触发</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-2 block">卡片间距 (px)</Label>
                  <Input type="number" value={heroCards.gapPx} onChange={(e) => updatePreview("heroCards", { gapPx: parseInt(e.target.value) || 32 })} className="rounded-lg" />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">动画时长 (ms)</Label>
                  <Input type="number" value={heroCards.animationDurationMs} onChange={(e) => updatePreview("heroCards", { animationDurationMs: parseInt(e.target.value) || 400 })} className="rounded-lg" />
                </div>
              </div>
            </CardContent>
          </UICard>

          {heroCards.mode === "hoverReveal" && (
            <UICard>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">悬停热区设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">启用精准热区</Label>
                  <Switch checked={heroHotspot.enabled} onCheckedChange={(checked) => updatePreview("heroHotspot", { enabled: checked })} data-testid="switch-hotspot-enabled" />
                </div>
                {heroHotspot.enabled && (
                  <>
                    <div>
                      <Label className="text-sm mb-2 block">触发区域</Label>
                      <Select value={heroHotspot.target} onValueChange={(value) => updatePreview("heroHotspot", { target: value as "avatar" | "title" | "icon" })}>
                        <SelectTrigger className="rounded-lg" data-testid="select-hotspot-target">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="avatar">头像区域</SelectItem>
                          <SelectItem value="title">标题区域</SelectItem>
                          <SelectItem value="icon">图标提示</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">显示悬停提示</Label>
                      <Switch checked={heroHotspot.showHint} onCheckedChange={(checked) => updatePreview("heroHotspot", { showHint: checked })} data-testid="switch-hotspot-hint" />
                    </div>
                    {heroHotspot.showHint && (
                      <div>
                        <Label className="text-sm mb-2 block">提示文字</Label>
                        <Input type="text" value={heroHotspot.hintText} onChange={(e) => updatePreview("heroHotspot", { hintText: e.target.value })} className="rounded-lg" placeholder="移入展开" data-testid="input-hotspot-hint" />
                      </div>
                    )}
                    <div>
                      <Label className="text-sm mb-2 block">退出延迟 (ms)</Label>
                      <Input type="number" value={heroHotspot.debounceMs} onChange={(e) => updatePreview("heroHotspot", { debounceMs: Math.min(200, Math.max(50, parseInt(e.target.value) || 120)) })} className="rounded-lg" min={50} max={200} data-testid="input-hotspot-debounce" />
                      <p className="text-xs text-muted-foreground mt-1">防止鼠标移动时闪烁 (50-200ms)</p>
                    </div>
                  </>
                )}
              </CardContent>
            </UICard>
          )}
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
                    <div className="flex-1 space-y-2">
                      <Input type="text" value={card.image || ""} onChange={(e) => updateCard(card.id, { image: e.target.value })} className="rounded-lg text-sm" placeholder="输入图片URL或上传图片" data-testid={`input-card-image-${card.id}`} />
                      <input ref={cardImageInputRef} type="file" accept="image/*" onChange={(e) => handleCardImageUpload(e, card.id)} className="hidden" />
                      <Button variant="secondary" size="sm" onClick={() => cardImageInputRef.current?.click()} className="rounded-lg gap-2 h-8">
                        <Upload className="w-3 h-3" />上传图片
                      </Button>
                    </div>
                  </div>
                </div>
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
              {saveMutation.isPending ? "保存中..." : "保存"}
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
              {saveMutation.isPending ? "保存中..." : "保存"}
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
            <div className="w-full p-2 text-center text-xs text-muted-foreground bg-black/5">
              实时预览
            </div>
            <HeroSection config={previewConfig} isMobile={false} />
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
