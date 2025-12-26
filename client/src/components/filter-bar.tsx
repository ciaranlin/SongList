import { useState, useEffect, useMemo } from "react";
import { type SiteConfig, type Song } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Search, Anchor, X, Dice6 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FilterBarProps {
  config: SiteConfig;
  songs: Song[];
  onFilteredSongsChange: (songs: Song[]) => void;
}

const LANGUAGES = ["Mandarin", "Japanese", "English", "Other"] as const;
const LANGUAGE_LABELS: Record<typeof LANGUAGES[number] | "All", string> = {
  All: "全部",
  Mandarin: "国语",
  Japanese: "日语",
  English: "英语",
  Other: "其他",
};
const PINYIN_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type LanguageFilter = typeof LANGUAGES[number] | "All";

export function FilterBar({ config, songs, onFilteredSongsChange }: FilterBarProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilter>("All");
  const [selectedPinyin, setSelectedPinyin] = useState<string | null>(null);
  const [captainOnly, setCaptainOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const textColor = config.theme.textColorMode === "auto" 
    ? getAutoTextColor(config.theme.background) 
    : config.theme.manualTextColor;

  // Defensive defaults for copyConfig
  const copyConfig = config.copyConfig ?? {
    enabled: true,
    template: "点歌 {songName}",
    toastEnabled: true,
  };

  // Defensive defaults for filterHint
  const filterHint = config.filterHint ?? {
    enabled: true,
    text: "挑个想听的类别呗~",
    align: "left" as const,
    fontSize: 14,
    colorMode: "auto" as const,
    manualColor: "#333333",
  };

  const hintColor = filterHint.colorMode === "auto" ? textColor : filterHint.manualColor;

  // Compute filtered songs using useMemo
  const filteredSongs = useMemo(() => {
    let filtered = [...songs];

    // Language filter
    if (selectedLanguage !== "All") {
      filtered = filtered.filter(song => song.language === selectedLanguage);
    }

    // Pinyin filter (only for Mandarin)
    if (selectedLanguage === "Mandarin" && selectedPinyin) {
      filtered = filtered.filter(song => song.pinyinInitial === selectedPinyin);
    }

    // Captain filter
    if (captainOnly) {
      filtered = filtered.filter(song => song.captainRequestable);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(song =>
        song.songName.toLowerCase().includes(query) ||
        song.singer.toLowerCase().includes(query) ||
        (song.remark?.toLowerCase().includes(query) ?? false)
      );
    }

    return filtered;
  }, [songs, selectedLanguage, selectedPinyin, captainOnly, searchQuery]);

  // Update parent when filtered songs change
  useEffect(() => {
    onFilteredSongsChange(filteredSongs);
  }, [filteredSongs, onFilteredSongsChange]);

  // Handle language change
  const handleLanguageChange = (lang: LanguageFilter) => {
    setSelectedLanguage(lang);
    if (lang !== "Mandarin") {
      setSelectedPinyin(null);
    }
  };

  // Handle pinyin change
  const handlePinyinChange = (initial: string) => {
    setSelectedPinyin(initial === selectedPinyin ? null : initial);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedLanguage("All");
    setSelectedPinyin(null);
    setCaptainOnly(false);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedLanguage !== "All" || selectedPinyin || captainOnly || searchQuery;

  // Random copy song function
  const handleRandomCopy = async () => {
    if (!copyConfig.enabled) return;

    if (filteredSongs.length === 0) {
      toast({
        title: "当前没有可随机的歌曲",
        description: "尝试调整筛选条件",
        variant: "destructive",
      });
      return;
    }

    // Randomly select a song from filtered list
    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    const randomSong = filteredSongs[randomIndex];
    const copyText = copyConfig.template.replace("{songName}", randomSong.songName);
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyText);
      } else {
        // Fallback to execCommand
        const textArea = document.createElement("textarea");
        textArea.value = copyText;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      if (copyConfig.toastEnabled) {
        toast({
          title: "已随机复制",
          description: `${randomSong.songName} - ${randomSong.singer}`,
        });
      }
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制歌名",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="w-full px-4"
      style={{ 
        maxWidth: config.layout.contentMaxWidth,
        padding: config.layout.filterBarPadding,
      }}
      data-testid="filter-bar"
    >
      <div 
        className="vtuber-glass rounded-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4"
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Row 1: Hint Text */}
        <div className="flex justify-between items-center px-1" data-testid="row-hints">
          {/* Left Hint: Filter Region */}
          {filterHint.enabled && (
            <div data-testid="filter-hint">
              <span
                style={{
                  color: hintColor,
                  fontSize: "14px",
                  opacity: 0.8,
                }}
              >
                {filterHint.text}
              </span>
            </div>
          )}
          
          {/* Right Hint: Search Region */}
          <div style={{ width: "fit-content" }}>
            <div 
              style={{ color: textColor, opacity: 0.6, fontSize: "14px" }}
            >
              行内点击即可复制
            </div>
          </div>
        </div>

        {/* Row 2: Controls (Language tabs + Search + Captain) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" data-testid="row-controls">
          {/* Left: Language Tabs - scrollable on mobile */}
          <div 
            className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            <button
              onClick={() => handleLanguageChange("All")}
              className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0"
              style={{
                color: textColor,
                background: selectedLanguage === "All" ? config.filterBar.languageTabBackground : "transparent",
              }}
              data-testid="button-filter-all"
            >
              {LANGUAGE_LABELS.All}
            </button>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0"
                style={{
                  color: textColor,
                  background: selectedLanguage === lang ? config.filterBar.languageTabBackground : "transparent",
                }}
                data-testid={`button-filter-${lang.toLowerCase()}`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>

          {/* Spacer between language tabs and right section */}
          <div className="hidden sm:flex flex-1"></div>

          {/* Right Section: Search + Captain Button */}
          <div className="flex items-center gap-3">
            {/* Middle: Search Input */}
            <div className="relative flex-1 sm:flex-none" style={{ minWidth: "140px" }}>
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                style={{ color: textColor, opacity: 0.5 }}
              />
              <Input
                type="search"
                placeholder="搜索歌曲..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl border-0 w-full"
                style={{
                  maxWidth: config.filterBar.searchInputWidth,
                  background: "rgba(255,255,255,0.45)",
                  color: textColor,
                }}
                data-testid="input-search"
              />
            </div>

            {/* Right: Captain Button */}
            <div className="flex items-center gap-2">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="rounded-xl flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant={captainOnly ? "default" : "secondary"}
                size="default"
                onClick={() => setCaptainOnly(!captainOnly)}
                className={`rounded-xl gap-2 whitespace-nowrap ${captainOnly ? "" : "vtuber-button border-0"}`}
                data-testid="button-captain-filter"
              >
                <Anchor className="w-4 h-4" />
                <span className="hidden sm:inline">舰长点歌</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Pinyin Initial Row (only show for Mandarin) */}
        {selectedLanguage === "Mandarin" && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5" data-testid="pinyin-filter-row">
            {PINYIN_INITIALS.map((initial) => (
              <button
                key={initial}
                onClick={() => handlePinyinChange(initial)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
                style={{
                  color: textColor,
                  background: selectedPinyin === initial 
                    ? config.filterBar.languageTabBackground 
                    : "rgba(255,255,255,0.25)",
                  border: selectedPinyin === initial 
                    ? "1px solid rgba(255,255,255,0.5)" 
                    : "1px solid transparent",
                }}
                data-testid={`button-pinyin-${initial}`}
              >
                {initial}
              </button>
            ))}
          </div>
        )}

        {/* Row 3: Filter Summary + Random Copy */}
        <div className="flex items-center justify-between gap-3" data-testid="row-status">
          {/* Left: Filter Summary */}
          <div className="flex flex-wrap items-center gap-2">
            <span 
              className="text-sm"
              style={{ color: textColor, opacity: 0.7 }}
            >
              筛选:
            </span>
            {selectedLanguage !== "All" && (
              <Badge variant="secondary" className="rounded-full" data-testid="badge-language-filter">
                {LANGUAGE_LABELS[selectedLanguage]}
              </Badge>
            )}
            {selectedPinyin && (
              <Badge variant="secondary" className="rounded-full" data-testid="badge-pinyin-filter">
                首字母: {selectedPinyin}
              </Badge>
            )}
            {captainOnly && (
              <Badge variant="secondary" className="rounded-full" data-testid="badge-captain-filter">
                舰长点歌
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="rounded-full" data-testid="badge-search-filter">
                搜索: {searchQuery}
              </Badge>
            )}
            {!hasActiveFilters && (
              <span 
                className="text-sm"
                style={{ color: textColor, opacity: 0.5 }}
              >
                无
              </span>
            )}
          </div>

          {/* Right: Random Copy Button */}
          <Button
            variant="secondary"
            size="default"
            onClick={handleRandomCopy}
            className="rounded-xl gap-2 vtuber-button border-0 whitespace-nowrap"
            data-testid="button-random-copy"
          >
            <Dice6 className="w-4 h-4" />
            <span className="hidden sm:inline">随机复制一首歌</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
