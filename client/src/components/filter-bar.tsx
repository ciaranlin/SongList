import { useState, useEffect, useMemo } from "react";
import { type SiteConfig, type Song } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Search, Anchor, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  config: SiteConfig;
  songs: Song[];
  onFilteredSongsChange: (songs: Song[]) => void;
}

const LANGUAGES = ["Mandarin", "Japanese", "English", "Other"] as const;
const PINYIN_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type LanguageFilter = typeof LANGUAGES[number] | "All";

export function FilterBar({ config, songs, onFilteredSongsChange }: FilterBarProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilter>("All");
  const [selectedPinyin, setSelectedPinyin] = useState<string | null>(null);
  const [captainOnly, setCaptainOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const textColor = config.theme.textColorMode === "auto" 
    ? getAutoTextColor(config.theme.background) 
    : config.theme.manualTextColor;

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

  return (
    <div 
      className="w-full"
      style={{ 
        maxWidth: config.layout.contentMaxWidth,
        padding: config.layout.filterBarPadding,
      }}
      data-testid="filter-bar"
    >
      <div 
        className="vtuber-glass rounded-2xl p-4 flex flex-col gap-4"
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Top row: Language tabs + Search + Captain + Clear */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Tabs */}
          <div 
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            <button
              onClick={() => handleLanguageChange("All")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: textColor,
                background: selectedLanguage === "All" ? config.filterBar.languageTabBackground : "transparent",
              }}
              data-testid="button-filter-all"
            >
              All
            </button>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: textColor,
                  background: selectedLanguage === lang ? config.filterBar.languageTabBackground : "transparent",
                }}
                data-testid={`button-filter-${lang.toLowerCase()}`}
              >
                {lang === "Mandarin" ? "Mandarin" : 
                 lang === "Japanese" ? "Japanese" : 
                 lang === "English" ? "English" : "Other"}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Input */}
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
              style={{ color: textColor, opacity: 0.5 }}
            />
            <Input
              type="search"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-0"
              style={{
                width: config.filterBar.searchInputWidth,
                background: "rgba(255,255,255,0.45)",
                color: textColor,
              }}
              data-testid="input-search"
            />
          </div>

          {/* Captain Toggle */}
          <Button
            variant={captainOnly ? "default" : "secondary"}
            size="default"
            onClick={() => setCaptainOnly(!captainOnly)}
            className={`rounded-xl gap-2 ${captainOnly ? "" : "vtuber-button border-0"}`}
            data-testid="button-captain-filter"
          >
            <Anchor className="w-4 h-4" />
            <span className="hidden sm:inline">Captain Only</span>
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="rounded-xl"
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Pinyin Initial Row (only show for Mandarin) */}
        {selectedLanguage === "Mandarin" && (
          <div className="flex flex-wrap gap-1.5" data-testid="pinyin-filter-row">
            {PINYIN_INITIALS.map((initial) => (
              <button
                key={initial}
                onClick={() => handlePinyinChange(initial)}
                className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200"
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

        {/* Active Filters Summary */}
        <div className="flex flex-wrap items-center gap-2">
          <span 
            className="text-sm"
            style={{ color: textColor, opacity: 0.7 }}
          >
            Filters:
          </span>
          {selectedLanguage !== "All" && (
            <Badge variant="secondary" className="rounded-full" data-testid="badge-language-filter">
              {selectedLanguage}
            </Badge>
          )}
          {selectedPinyin && (
            <Badge variant="secondary" className="rounded-full" data-testid="badge-pinyin-filter">
              Initial: {selectedPinyin}
            </Badge>
          )}
          {captainOnly && (
            <Badge variant="secondary" className="rounded-full" data-testid="badge-captain-filter">
              Captain Requests
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="rounded-full" data-testid="badge-search-filter">
              Search: {searchQuery}
            </Badge>
          )}
          {!hasActiveFilters && (
            <span 
              className="text-sm"
              style={{ color: textColor, opacity: 0.5 }}
            >
              None
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
