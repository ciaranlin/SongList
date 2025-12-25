import { type SiteConfig } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Music } from "lucide-react";

interface HeroBannerProps {
  config: SiteConfig;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMobile?: boolean;
}

export function HeroBanner({ config, isHovered, onMouseEnter, onMouseLeave, isMobile = false }: HeroBannerProps) {
  const { banner, theme } = config;
  const textColor = theme.textColorMode === "auto" 
    ? getAutoTextColor(theme.background) 
    : theme.manualTextColor;

  // Defensive defaults for cardAnimation
  const cardAnimation = config.cardAnimation ?? {
    type: "fade" as const,
    durationMs: 200,
    delayMs: 0,
    trigger: "hover" as const,
    mobileTrigger: "always" as const,
  };

  const trigger = isMobile ? cardAnimation.mobileTrigger : cardAnimation.trigger;
  const showHint = config.hoverBehavior.enabled && trigger === "hover" && !isMobile;

  return (
    <div 
      className="relative py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center text-center w-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid="hero-banner"
    >
      {/* Avatar */}
      <div 
        className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 sm:mb-6 flex items-center justify-center flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.22)",
          border: "2px solid rgba(255,255,255,0.35)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {banner.avatar ? (
          <img 
            src={banner.avatar} 
            alt="头像" 
            className="w-full h-full object-cover"
            data-testid="img-avatar"
          />
        ) : (
          <Music className="w-8 h-8 sm:w-12 sm:h-12" style={{ color: textColor, opacity: 0.6 }} />
        )}
      </div>

      {/* Title */}
      <h1 
        className="mb-2 sm:mb-3 tracking-tight px-2"
        style={{
          color: textColor,
          fontSize: `clamp(24px, 5vw, ${banner.styles.titleSize})`,
          fontWeight: banner.styles.titleWeight,
          textShadow: "0 2px 8px rgba(0,0,0,0.1)",
          wordBreak: "break-word",
        }}
        data-testid="text-hero-title"
      >
        {banner.title}
      </h1>

      {/* Subtitle */}
      <p 
        className="mb-3 sm:mb-4 px-2"
        style={{
          color: textColor,
          fontSize: `clamp(16px, 3vw, ${banner.styles.subtitleSize})`,
          fontWeight: banner.styles.subtitleWeight,
          opacity: 0.9,
          wordBreak: "break-word",
        }}
        data-testid="text-hero-subtitle"
      >
        {banner.subtitle}
      </p>

      {/* Hint - only show on desktop with hover trigger */}
      {showHint && (
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
