import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { type SiteConfig, type Card, type LinkItem, defaultConfig, defaultSongs, type Song } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfigProvider, getAutoTextColor } from "@/lib/config-context";
import { PasswordGate } from "@/components/password-gate";
import { HeroBanner } from "@/components/hero-banner";
import { HoverCards } from "@/components/hover-cards";
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
  Square, Plus, Trash2, GripVertical, ExternalLink, Settings, Upload, Image
} from "lucide-react";

export default function ConfigPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<SiteConfig>(defaultConfig);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch persisted config
  const { data: savedConfig = defaultConfig, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  // Fetch songs for preview
  const { data: songs = defaultSongs } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  // Initialize preview with saved config
  useEffect(() => {
    if (savedConfig) {
      setPreviewConfig(savedConfig);
    }
  }, [savedConfig]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (config: SiteConfig) => {
      return apiRequest("PUT", "/api/config", config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "保存成功",
        description: "配置已保存",
      });
    },
    onError: () => {
      toast({
        title: "保存失败",
        description: "保存配置时出错",
        variant: "destructive",
      });
    },
  });

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        updatePreview("banner", { avatar: data.url });
        toast({
          title: "上传成功",
          description: "头像已更新",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      toast({
        title: "上传失败",
        description: "上传图片时出错",
        variant: "destructive",
      });
    }
  };

  // Update preview config
  const updatePreview = useCallback(<K extends keyof SiteConfig>(
    section: K,
    updates: Partial<SiteConfig[K]>
  ) => {
    setPreviewConfig(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            ...updates,
          },
        };
      }
      return {
        ...prev,
        [section]: updates,
      };
    });
  }, []);

  // Update nested config
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
          [section]: {
            ...currentSection,
            [subsection]: {
              ...currentSubsection,
              ...updates,
            },
          },
        };
      }
      return prev;
    });
  }, []);

  // Card management
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
    setPreviewConfig(prev => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c.id !== cardId),
    }));
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === cardId ? { ...c, ...updates } : c),
    }));
  }, []);

  // Link management
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
      cards: prev.cards.map(c => 
        c.id === cardId 
          ? { ...c, links: [...c.links, newLink] }
          : c
      ),
    }));
  }, []);

  const removeLink = useCallback((cardId: string, linkId: string) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => 
        c.id === cardId 
          ? { ...c, links: c.links.filter(l => l.id !== linkId) }
          : c
      ),
    }));
  }, []);

  const updateLink = useCallback((cardId: string, linkId: string, updates: Partial<LinkItem>) => {
    setPreviewConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => 
        c.id === cardId 
          ? { ...c, links: c.links.map(l => l.id === linkId ? { ...l, ...updates } : l) }
          : c
      ),
    }));
  }, []);

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} correctPassword={savedConfig.adminPassword} />;
  }

  const EditorContent = (
    <div className="p-4">
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="theme" className="gap-1 text-xs sm:text-sm">
            <Palette className="w-3 h-3" />
            <span className="hidden sm:inline">主题</span>
          </TabsTrigger>
          <TabsTrigger value="banner" className="gap-1 text-xs sm:text-sm">
            <Type className="w-3 h-3" />
            <span className="hidden sm:inline">横幅</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-1 text-xs sm:text-sm">
            <Square className="w-3 h-3" />
            <span className="hidden sm:inline">卡片</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-1 text-xs sm:text-sm">
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
                <Input
                  type="color"
                  value={previewConfig.theme.background}
                  onChange={(e) => updatePreview("theme", { background: e.target.value })}
                  className="w-12 h-10 p-1 rounded-lg cursor-pointer"
                  data-testid="input-bg-color"
                />
                <Input
                  type="text"
                  value={previewConfig.theme.background}
                  onChange={(e) => updatePreview("theme", { background: e.target.value })}
                  className="flex-1 rounded-lg"
                  data-testid="input-bg-color-text"
                />
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
                <Switch
                  checked={previewConfig.theme.textColorMode === "auto"}
                  onCheckedChange={(checked) => 
                    updatePreview("theme", { textColorMode: checked ? "auto" : "manual" })
                  }
                  data-testid="switch-auto-text"
                />
              </div>
              {previewConfig.theme.textColorMode === "manual" && (
                <div className="flex items-center gap-3">
                  <Label className="w-16 text-sm flex-shrink-0">颜色</Label>
                  <Input
                    type="color"
                    value={previewConfig.theme.manualTextColor}
                    onChange={(e) => updatePreview("theme", { manualTextColor: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={previewConfig.theme.manualTextColor}
                    onChange={(e) => updatePreview("theme", { manualTextColor: e.target.value })}
                    className="flex-1 rounded-lg"
                  />
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
                <Switch
                  checked={previewConfig.entryIcons?.showConfigEntry ?? true}
                  onCheckedChange={(checked) => 
                    updatePreview("entryIcons", { showConfigEntry: checked })
                  }
                  data-testid="switch-show-config-entry"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">显示歌单入口</Label>
                <Switch
                  checked={previewConfig.entryIcons?.showYuEntry ?? true}
                  onCheckedChange={(checked) => 
                    updatePreview("entryIcons", { showYuEntry: checked })
                  }
                  data-testid="switch-show-yu-entry"
                />
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">管理密码</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={previewConfig.adminPassword}
                onChange={(e) => setPreviewConfig(prev => ({ ...prev, adminPassword: e.target.value }))}
                className="rounded-lg"
                placeholder="管理密码"
                data-testid="input-admin-password"
              />
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
                  <img 
                    src={previewConfig.banner.avatar} 
                    alt="头像预览" 
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    value={previewConfig.banner.avatar}
                    onChange={(e) => updatePreview("banner", { avatar: e.target.value })}
                    className="rounded-lg"
                    placeholder="输入图片URL或上传图片"
                    data-testid="input-avatar-url"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    上传头像
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
                <Input
                  type="text"
                  value={previewConfig.banner.title}
                  onChange={(e) => updatePreview("banner", { title: e.target.value })}
                  className="rounded-lg"
                  data-testid="input-banner-title"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">副标题</Label>
                <Input
                  type="text"
                  value={previewConfig.banner.subtitle}
                  onChange={(e) => updatePreview("banner", { subtitle: e.target.value })}
                  className="rounded-lg"
                  data-testid="input-banner-subtitle"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">提示文字</Label>
                <Input
                  type="text"
                  value={previewConfig.banner.hint}
                  onChange={(e) => updatePreview("banner", { hint: e.target.value })}
                  className="rounded-lg"
                  data-testid="input-banner-hint"
                />
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">卡片动效</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">动效类型</Label>
                <Select
                  value={previewConfig.cardAnimation?.type || "fade"}
                  onValueChange={(value) => updatePreview("cardAnimation", { 
                    type: value as "none" | "fade" | "slide" | "scale" | "fadeSlide" 
                  })}
                >
                  <SelectTrigger className="rounded-lg" data-testid="select-animation-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无动效</SelectItem>
                    <SelectItem value="fade">淡入淡出</SelectItem>
                    <SelectItem value="slide">上滑</SelectItem>
                    <SelectItem value="scale">缩放</SelectItem>
                    <SelectItem value="fadeSlide">淡入+滑动</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-2 block">时长 (ms)</Label>
                  <Input
                    type="number"
                    value={previewConfig.cardAnimation?.durationMs || 200}
                    onChange={(e) => updatePreview("cardAnimation", { durationMs: parseInt(e.target.value) || 200 })}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">延迟 (ms)</Label>
                  <Input
                    type="number"
                    value={previewConfig.cardAnimation?.delayMs || 0}
                    onChange={(e) => updatePreview("cardAnimation", { delayMs: parseInt(e.target.value) || 0 })}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm mb-2 block">PC端触发方式</Label>
                <Select
                  value={previewConfig.cardAnimation?.trigger || "hover"}
                  onValueChange={(value) => updatePreview("cardAnimation", { 
                    trigger: value as "hover" | "always" | "click" 
                  })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hover">鼠标悬停</SelectItem>
                    <SelectItem value="always">始终显示</SelectItem>
                    <SelectItem value="click">点击展开</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-2 block">移动端触发方式</Label>
                <Select
                  value={previewConfig.cardAnimation?.mobileTrigger || "always"}
                  onValueChange={(value) => updatePreview("cardAnimation", { 
                    mobileTrigger: value as "always" | "click" 
                  })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">始终显示</SelectItem>
                    <SelectItem value="click">点击展开</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </UICard>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">卡片 ({previewConfig.cards.length})</h3>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={addCard}
              className="rounded-lg gap-1"
              data-testid="button-add-card"
            >
              <Plus className="w-3 h-3" />
              添加卡片
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCard(card.id)}
                    className="rounded-lg text-destructive"
                    data-testid={`button-delete-card-${card.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">标题</Label>
                  <Input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(card.id, { title: e.target.value })}
                    className="rounded-lg"
                    data-testid={`input-card-title-${card.id}`}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">内容</Label>
                  <Textarea
                    value={card.body || ""}
                    onChange={(e) => updateCard(card.id, { body: e.target.value })}
                    className="rounded-lg resize-none"
                    rows={2}
                    data-testid={`input-card-body-${card.id}`}
                  />
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">链接 ({card.links.length})</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addLink(card.id)}
                      className="rounded-lg gap-1 h-7"
                      data-testid={`button-add-link-${card.id}`}
                    >
                      <Plus className="w-3 h-3" />
                      添加
                    </Button>
                  </div>
                  {card.links.map((link) => (
                    <div key={link.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(card.id, link.id, { label: e.target.value })}
                        className="flex-1 h-8 rounded-lg text-sm"
                        placeholder="名称"
                      />
                      <Input
                        type="text"
                        value={link.url || ""}
                        onChange={(e) => updateLink(card.id, link.id, { url: e.target.value })}
                        className="flex-1 h-8 rounded-lg text-sm"
                        placeholder="链接"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeLink(card.id, link.id)}
                        className="h-8 w-8 rounded-lg text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </UICard>
          ))}
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
                <Input
                  type="text"
                  value={previewConfig.layout.contentMaxWidth}
                  onChange={(e) => updatePreview("layout", { contentMaxWidth: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">对齐表格</Label>
                <Switch
                  checked={previewConfig.layout.alignWithTable}
                  onCheckedChange={(checked) => updatePreview("layout", { alignWithTable: checked })}
                />
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
                <Input
                  type="text"
                  value={previewConfig.filterBar.searchInputWidth}
                  onChange={(e) => updatePreview("filterBar", { searchInputWidth: e.target.value })}
                  className="rounded-lg"
                />
              </div>
            </CardContent>
          </UICard>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Mobile layout
  if (isMobileView) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
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
            <Button 
              onClick={() => saveMutation.mutate(previewConfig)}
              disabled={saveMutation.isPending}
              size="sm"
              className="rounded-xl gap-2"
              data-testid="button-save-config"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <ScrollArea className="h-[calc(100vh-57px)] custom-scrollbar">
          {EditorContent}
        </ScrollArea>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-screen" style={{ background: "hsl(var(--background))" }}>
      {/* Left Column - Editor */}
      <div className="w-[480px] border-r flex flex-col bg-card">
        {/* Header */}
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
            <Button 
              onClick={() => saveMutation.mutate(previewConfig)}
              disabled={saveMutation.isPending}
              className="rounded-xl gap-2"
              data-testid="button-save-config"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <ScrollArea className="flex-1 custom-scrollbar">
          {EditorContent}
        </ScrollArea>
      </div>

      {/* Right Column - Live Preview */}
      <div 
        className="flex-1 overflow-auto custom-scrollbar"
        style={{ backgroundColor: previewConfig.theme.background }}
      >
        <ConfigProvider initialConfig={previewConfig}>
          <div className="flex flex-col items-center min-h-full">
            {/* Preview Label */}
            <div className="w-full p-2 text-center text-xs text-muted-foreground bg-black/5">
              实时预览
            </div>

            {/* Preview Content */}
            <HeroBanner 
              config={previewConfig}
              isHovered={isPreviewHovered}
              onMouseEnter={() => setIsPreviewHovered(true)}
              onMouseLeave={() => setIsPreviewHovered(false)}
            />
            
            <HoverCards 
              config={previewConfig}
              isVisible={isPreviewHovered}
            />

            <FilterBar 
              config={previewConfig}
              songs={songs}
              onFilteredSongsChange={() => {}}
            />

            <div 
              className="w-full px-4 pb-8 flex justify-center"
              style={{ maxWidth: previewConfig.layout.contentMaxWidth }}
            >
              <SongTable 
                config={previewConfig}
                songs={songs.slice(0, 5)}
              />
            </div>
          </div>
        </ConfigProvider>
      </div>
    </div>
  );
}
