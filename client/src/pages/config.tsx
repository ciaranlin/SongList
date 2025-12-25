import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { type SiteConfig, type Card, type LinkItem, defaultConfig, defaultSongs, type Song } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfigProvider } from "@/lib/config-context";
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
  Save, Home, Eye, Palette, Layout, Type, 
  Square, Plus, Trash2, GripVertical, ExternalLink, Settings
} from "lucide-react";

export default function ConfigPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<SiteConfig>(defaultConfig);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const { toast } = useToast();

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
        title: "Configuration saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to save",
        description: "There was an error saving your configuration.",
        variant: "destructive",
      });
    },
  });

  // Update preview config
  const updatePreview = useCallback(<K extends keyof SiteConfig>(
    section: K,
    updates: Partial<SiteConfig[K]>
  ) => {
    setPreviewConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }));
  }, []);

  // Update nested config
  const updateNestedPreview = useCallback(<K extends keyof SiteConfig>(
    section: K,
    subsection: keyof SiteConfig[K],
    updates: Partial<SiteConfig[K][typeof subsection]>
  ) => {
    setPreviewConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          ...updates,
        },
      },
    }));
  }, []);

  // Card management
  const addCard = useCallback(() => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: "New Card",
      body: "Card description",
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
      label: "New Link",
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

  return (
    <div className="flex h-screen" style={{ background: "hsl(var(--background))" }}>
      {/* Left Column - Editor */}
      <div className="w-[480px] border-r flex flex-col bg-card">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-4 border-b sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Configuration</h1>
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
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <ScrollArea className="flex-1 custom-scrollbar">
          <div className="p-4">
            <Tabs defaultValue="theme" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="theme" className="gap-1">
                  <Palette className="w-3 h-3" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="banner" className="gap-1">
                  <Type className="w-3 h-3" />
                  Banner
                </TabsTrigger>
                <TabsTrigger value="cards" className="gap-1">
                  <Square className="w-3 h-3" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="layout" className="gap-1">
                  <Layout className="w-3 h-3" />
                  Layout
                </TabsTrigger>
              </TabsList>

              {/* Theme Tab */}
              <TabsContent value="theme" className="space-y-4">
                <UICard>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Label className="w-24 text-sm">Color</Label>
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
                    <CardTitle className="text-sm">Text Color</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto Text Color</Label>
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
                        <Label className="w-24 text-sm">Color</Label>
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
                    <CardTitle className="text-sm">Admin Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="text"
                      value={previewConfig.adminPassword}
                      onChange={(e) => setPreviewConfig(prev => ({ ...prev, adminPassword: e.target.value }))}
                      className="rounded-lg"
                      placeholder="Admin password"
                      data-testid="input-admin-password"
                    />
                  </CardContent>
                </UICard>
              </TabsContent>

              {/* Banner Tab */}
              <TabsContent value="banner" className="space-y-4">
                <UICard>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block">Avatar URL</Label>
                      <Input
                        type="text"
                        value={previewConfig.banner.avatar}
                        onChange={(e) => updatePreview("banner", { avatar: e.target.value })}
                        className="rounded-lg"
                        placeholder="https://example.com/avatar.png"
                        data-testid="input-avatar-url"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Title</Label>
                      <Input
                        type="text"
                        value={previewConfig.banner.title}
                        onChange={(e) => updatePreview("banner", { title: e.target.value })}
                        className="rounded-lg"
                        data-testid="input-banner-title"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Subtitle</Label>
                      <Input
                        type="text"
                        value={previewConfig.banner.subtitle}
                        onChange={(e) => updatePreview("banner", { subtitle: e.target.value })}
                        className="rounded-lg"
                        data-testid="input-banner-subtitle"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Hint Text</Label>
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
                    <CardTitle className="text-sm">Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm mb-2 block">Title Size</Label>
                        <Input
                          type="text"
                          value={previewConfig.banner.styles.titleSize}
                          onChange={(e) => updateNestedPreview("banner", "styles", { titleSize: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">Title Weight</Label>
                        <Input
                          type="text"
                          value={previewConfig.banner.styles.titleWeight}
                          onChange={(e) => updateNestedPreview("banner", "styles", { titleWeight: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm mb-2 block">Subtitle Size</Label>
                        <Input
                          type="text"
                          value={previewConfig.banner.styles.subtitleSize}
                          onChange={(e) => updateNestedPreview("banner", "styles", { subtitleSize: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">Subtitle Weight</Label>
                        <Input
                          type="text"
                          value={previewConfig.banner.styles.subtitleWeight}
                          onChange={(e) => updateNestedPreview("banner", "styles", { subtitleWeight: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </UICard>

                <UICard>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Hover Behavior</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Enable Hover Cards</Label>
                      <Switch
                        checked={previewConfig.hoverBehavior.enabled}
                        onCheckedChange={(checked) => updatePreview("hoverBehavior", { enabled: checked })}
                        data-testid="switch-hover-enabled"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm mb-2 block">Fade In (ms)</Label>
                        <Input
                          type="number"
                          value={previewConfig.hoverBehavior.fadeInDuration}
                          onChange={(e) => updatePreview("hoverBehavior", { fadeInDuration: parseInt(e.target.value) || 250 })}
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">Fade Out (ms)</Label>
                        <Input
                          type="number"
                          value={previewConfig.hoverBehavior.fadeOutDuration}
                          onChange={(e) => updatePreview("hoverBehavior", { fadeOutDuration: parseInt(e.target.value) || 200 })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </UICard>
              </TabsContent>

              {/* Cards Tab */}
              <TabsContent value="cards" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Cards ({previewConfig.cards.length})</h3>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={addCard}
                    className="rounded-lg gap-1"
                    data-testid="button-add-card"
                  >
                    <Plus className="w-3 h-3" />
                    Add Card
                  </Button>
                </div>

                {previewConfig.cards.map((card, index) => (
                  <UICard key={card.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <CardTitle className="text-sm">Card {index + 1}</CardTitle>
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
                        <Label className="text-sm mb-2 block">Title</Label>
                        <Input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateCard(card.id, { title: e.target.value })}
                          className="rounded-lg"
                          data-testid={`input-card-title-${card.id}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">Body</Label>
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
                          <Label className="text-sm">Links ({card.links.length})</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => addLink(card.id)}
                            className="rounded-lg gap-1 h-7"
                            data-testid={`button-add-link-${card.id}`}
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </Button>
                        </div>
                        {card.links.map((link) => (
                          <div key={link.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <Input
                              type="text"
                              value={link.label}
                              onChange={(e) => updateLink(card.id, link.id, { label: e.target.value })}
                              className="flex-1 h-8 rounded-lg text-sm"
                              placeholder="Label"
                            />
                            <Input
                              type="text"
                              value={link.url || ""}
                              onChange={(e) => updateLink(card.id, link.id, { url: e.target.value })}
                              className="flex-1 h-8 rounded-lg text-sm"
                              placeholder="URL"
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
                    <CardTitle className="text-sm">Content Width</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block">Max Width</Label>
                      <Input
                        type="text"
                        value={previewConfig.layout.contentMaxWidth}
                        onChange={(e) => updatePreview("layout", { contentMaxWidth: e.target.value })}
                        className="rounded-lg"
                        placeholder="1200px"
                        data-testid="input-max-width"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Align Filter Bar with Table</Label>
                      <Switch
                        checked={previewConfig.layout.alignWithTable}
                        onCheckedChange={(checked) => updatePreview("layout", { alignWithTable: checked })}
                      />
                    </div>
                  </CardContent>
                </UICard>

                <UICard>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Filter Bar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block">Gap</Label>
                      <Input
                        type="text"
                        value={previewConfig.layout.filterBarGap}
                        onChange={(e) => updatePreview("layout", { filterBarGap: e.target.value })}
                        className="rounded-lg"
                        placeholder="12px"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Padding</Label>
                      <Input
                        type="text"
                        value={previewConfig.layout.filterBarPadding}
                        onChange={(e) => updatePreview("layout", { filterBarPadding: e.target.value })}
                        className="rounded-lg"
                        placeholder="16px"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Search Width</Label>
                      <Input
                        type="text"
                        value={previewConfig.filterBar.searchInputWidth}
                        onChange={(e) => updatePreview("filterBar", { searchInputWidth: e.target.value })}
                        className="rounded-lg"
                        placeholder="220px"
                      />
                    </div>
                  </CardContent>
                </UICard>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Right Column - Live Preview */}
      <div 
        className="flex-1 overflow-auto custom-scrollbar"
        style={{ backgroundColor: previewConfig.theme.background }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 py-2 px-4" 
          style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Live Preview</span>
        </div>

        <ConfigProvider initialConfig={previewConfig}>
          <div className="flex flex-col items-center pb-8">
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
              className="w-full px-4 flex justify-center"
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
