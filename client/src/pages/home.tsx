import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type SiteConfig, type Song, defaultConfig, defaultSongs } from "@shared/schema";
import { ConfigProvider } from "@/lib/config-context";
import { HeroSection } from "@/components/hero-section";
import { FilterBar } from "@/components/filter-bar";
import { SongTable } from "@/components/song-table";
import { Button } from "@/components/ui/button";
import { Settings, ListMusic } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  return isMobile;
}

export default function Home() {
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const isMobile = useIsMobile();

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

  // Show entry icons based on config
  const showConfigEntry = config.entryIcons?.showConfigEntry ?? true;
  const showYuEntry = config.entryIcons?.showYuEntry ?? true;

  return (
    <ConfigProvider initialConfig={config}>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{ 
          backgroundColor: config.theme.background,
        }}
      >
        {/* Corner Admin Links - controlled by config */}
        {(showConfigEntry || showYuEntry) && (
          <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex gap-2">
            {showConfigEntry && (
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
            )}
            {showYuEntry && (
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
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col items-center">
          {/* Top Row: Hero Section + Cards Grid Layout */}
          <div 
            className={`topRow w-full px-4 transition-all duration-300`}
            style={{ maxWidth: config.layout.contentMaxWidth }}
          >
            {/* Hero Section with Reveal Animation */}
            <HeroSection 
              config={config}
              isMobile={isMobile}
            />
          </div>

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
