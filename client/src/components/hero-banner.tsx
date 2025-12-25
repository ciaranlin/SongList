import { type SiteConfig } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Music } from "lucide-react";

interface HeroBannerProps {
  config: SiteConfig;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function HeroBanner({ config, isHovered, onMouseEnter, onMouseLeave }: HeroBannerProps) {
  const { banner, theme } = config;
  const textColor = theme.textColorMode === "auto" 
    ? getAutoTextColor(theme.background) 
    : theme.manualTextColor;

  return (
    <div 
      className="relative py-12 px-6 flex flex-col items-center text-center"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid="hero-banner"
    >
      {/* Avatar */}
      <div 
        className="w-28 h-28 rounded-full overflow-hidden mb-6 flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.22)",
          border: "2px solid rgba(255,255,255,0.35)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {banner.avatar ? (
          <img 
            src={banner.avatar} 
            alt="VTuber Avatar" 
            className="w-full h-full object-cover"
            data-testid="img-avatar"
          />
        ) : (
          <Music className="w-12 h-12" style={{ color: textColor, opacity: 0.6 }} />
        )}
      </div>

      {/* Title */}
      <h1 
        className="mb-3 tracking-tight"
        style={{
          color: textColor,
          fontSize: banner.styles.titleSize,
          fontWeight: banner.styles.titleWeight,
          textShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        data-testid="text-hero-title"
      >
        {banner.title}
      </h1>

      {/* Subtitle */}
      <p 
        className="mb-4"
        style={{
          color: textColor,
          fontSize: banner.styles.subtitleSize,
          fontWeight: banner.styles.subtitleWeight,
          opacity: 0.9,
        }}
        data-testid="text-hero-subtitle"
      >
        {banner.subtitle}
      </p>

      {/* Hint */}
      {config.hoverBehavior.enabled && (
        <p 
          className="transition-opacity duration-300"
          style={{
            color: textColor,
            fontSize: banner.styles.hintSize,
            opacity: isHovered ? 0 : 0.6,
          }}
          data-testid="text-hero-hint"
        >
          {banner.hint}
        </p>
      )}
    </div>
  );
}
