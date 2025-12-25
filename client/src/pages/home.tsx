import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type SiteConfig, type Song, defaultConfig, defaultSongs } from "@shared/schema";
import { ConfigProvider } from "@/lib/config-context";
import { HeroBanner } from "@/components/hero-banner";
import { HoverCards } from "@/components/hover-cards";
import { FilterBar } from "@/components/filter-bar";
import { SongTable } from "@/components/song-table";
import { Button } from "@/components/ui/button";
import { Settings, ListMusic } from "lucide-react";

export default function Home() {
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);

  // Fetch config from API
  const { data: config = defaultConfig, isLoading: configLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  // Fetch songs from API
  const { data: songs = defaultSongs, isLoading: songsLoading } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  // Initialize filtered songs when songs load
  useEffect(() => {
    if (songs.length > 0) {
      setFilteredSongs(songs);
    }
  }, [songs]);

  const handleFilterChange = useCallback((newFilteredSongs: Song[]) => {
    setFilteredSongs(newFilteredSongs);
  }, []);

  const handleHeroMouseEnter = useCallback(() => {
    if (config.hoverBehavior.enabled && config.hoverBehavior.showOnHeroHover) {
      setIsHeroHovered(true);
    }
  }, [config.hoverBehavior]);

  const handleHeroMouseLeave = useCallback(() => {
    setIsHeroHovered(false);
  }, []);

  return (
    <ConfigProvider initialConfig={config}>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{ 
          backgroundColor: config.theme.background,
        }}
      >
        {/* Corner Admin Links */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Link href="/config">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-xl vtuber-glass border-0"
              data-testid="link-config"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/yu">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-xl vtuber-glass border-0"
              data-testid="link-admin"
            >
              <ListMusic className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center">
          {/* Hero Section */}
          <HeroBanner 
            config={config}
            isHovered={isHeroHovered}
            onMouseEnter={handleHeroMouseEnter}
            onMouseLeave={handleHeroMouseLeave}
          />

          {/* Hover-reveal Cards */}
          <HoverCards 
            config={config}
            isVisible={isHeroHovered}
          />

          {/* Filter Bar */}
          <FilterBar 
            config={config}
            songs={songs}
            onFilteredSongsChange={handleFilterChange}
          />

          {/* Song Table */}
          <div 
            className="w-full px-4 pb-8 flex justify-center"
            style={{ maxWidth: config.layout.contentMaxWidth }}
          >
            <SongTable 
              config={config}
              songs={filteredSongs}
              isLoading={songsLoading}
            />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
