import { useState, useEffect, useRef, useCallback } from "react";
import { type SiteConfig, type Card as CardType } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Music, ExternalLink, Twitter, Youtube, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { SiBilibili } from "react-icons/si";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  config: SiteConfig;
  isMobile: boolean;
}

function getIconComponent(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case "twitter":
      return Twitter;
    case "youtube":
      return Youtube;
    case "bilibili":
      return SiBilibili;
    default:
      return Globe;
  }
}

function CardLinkItem({ link, textColor }: { link: CardType["links"][0]; textColor: string }) {
  const IconComponent = getIconComponent(link.icon);
  
  return (
    <a
      href={link.url || "#"}
      target={link.openInNewTab ? "_blank" : "_self"}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 transition-all duration-200 hover-elevate active-elevate-2"
      style={{
        padding: link.styles.padding,
        borderRadius: link.styles.borderRadius,
        background: link.styles.background,
        border: link.styles.border,
        color: textColor,
        fontSize: "13px",
        fontWeight: 500,
      }}
      data-testid={`link-${link.id}`}
    >
      <IconComponent className="w-4 h-4" />
      <span>{link.label}</span>
    </a>
  );
}

function HoverCard({ card, textColor }: { card: CardType; textColor: string }) {
  return (
    <div
      className="flex flex-col gap-3"
      style={{
        padding: card.styles.padding,
        borderRadius: card.styles.borderRadius,
        background: card.styles.background,
        border: card.styles.border,
        boxShadow: card.styles.shadow,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      data-testid={`card-${card.id}`}
    >
      <h3
        style={{
          color: textColor,
          fontSize: card.typography.titleSize,
          fontWeight: card.typography.titleWeight,
          lineHeight: card.typography.lineHeight,
        }}
      >
        {card.title}
      </h3>

      {card.body && (
        <p
          style={{
            color: textColor,
            fontSize: card.typography.bodySize,
            lineHeight: card.typography.lineHeight,
            opacity: 0.85,
          }}
        >
          {card.body}
        </p>
      )}

      {card.links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {card.links.map((link) => (
            <CardLinkItem key={link.id} link={link} textColor={textColor} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroSection({ config, isMobile }: HeroSectionProps) {
  const { banner, theme, cards } = config;
  const heroRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Defensive defaults for heroCards
  const heroCards = config.heroCards ?? {
    mode: "scrollReveal" as const,
    heroShiftPx: 0,
    gapPx: 32,
    animationDurationMs: 400,
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const textColor = theme.textColorMode === "auto" 
    ? getAutoTextColor(theme.background) 
    : theme.manualTextColor;

  // "off" mode = always revealed
  useEffect(() => {
    if (heroCards.mode === "off") {
      setIsRevealed(true);
    }
  }, [heroCards.mode]);

  // IntersectionObserver for scroll reveal mode
  useEffect(() => {
    if (heroCards.mode !== "scrollReveal" || isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRevealed(entry.isIntersecting);
      },
      { threshold: 0.5, rootMargin: "0px" }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [heroCards.mode, isMobile]);

  // Handle hover reveal mode
  const handleMouseEnter = useCallback(() => {
    if (heroCards.mode === "hoverReveal" && !isMobile) {
      setIsRevealed(true);
    }
  }, [heroCards.mode, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (heroCards.mode === "hoverReveal" && !isMobile) {
      setIsRevealed(false);
    }
  }, [heroCards.mode, isMobile]);

  // Calculate hero shift amount - use config value if > 0, otherwise auto-calculate
  const cardContainerWidth = 320; // Approximate card container width
  const autoShift = cards.length > 0 ? (cardContainerWidth / 2) + (heroCards.gapPx / 2) : 0;
  const heroShiftAmount = heroCards.heroShiftPx > 0 ? heroCards.heroShiftPx : autoShift;

  const animationStyle = {
    transitionProperty: "transform, opacity",
    transitionDuration: `${heroCards.animationDurationMs}ms`,
    transitionTimingFunction: heroCards.animationEasing,
  };

  // Mobile layout - vertical with expand/collapse
  if (isMobile) {
    return (
      <div 
        ref={heroRef}
        className="w-full"
        data-testid="hero-section"
      >
        {/* Hero Banner - always centered on mobile */}
        <div className="py-8 px-4 flex flex-col items-center text-center">
          <div 
            className="w-20 h-20 rounded-full overflow-hidden mb-4 flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.22)",
              border: "2px solid rgba(255,255,255,0.35)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {banner.avatar ? (
              <img src={banner.avatar} alt="头像" className="w-full h-full object-cover" data-testid="img-avatar" />
            ) : (
              <Music className="w-8 h-8" style={{ color: textColor, opacity: 0.6 }} />
            )}
          </div>

          <h1 
            className="mb-2 tracking-tight px-2"
            style={{
              color: textColor,
              fontSize: `clamp(24px, 5vw, ${banner.styles.titleSize})`,
              fontWeight: banner.styles.titleWeight,
              textShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            data-testid="text-hero-title"
          >
            {banner.title}
          </h1>

          <p 
            className="mb-3 px-2"
            style={{
              color: textColor,
              fontSize: `clamp(16px, 3vw, ${banner.styles.subtitleSize})`,
              fontWeight: banner.styles.subtitleWeight,
              opacity: 0.9,
            }}
            data-testid="text-hero-subtitle"
          >
            {banner.subtitle}
          </p>
        </div>

        {/* Mobile Cards - with expand/collapse button for non-off modes */}
        {cards.length > 0 && heroCards.mode !== "off" && (
          <div className="px-4 pb-4">
            <Button
              variant="secondary"
              size="default"
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="w-full rounded-xl vtuber-glass border-0 gap-2"
              data-testid="button-toggle-cards"
            >
              {mobileExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>收起信息</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>展开信息</span>
                </>
              )}
            </Button>
            
            <div
              className="overflow-hidden"
              style={{
                maxHeight: mobileExpanded ? `${cards.length * 250}px` : "0px",
                opacity: mobileExpanded ? 1 : 0,
                ...animationStyle,
              }}
            >
              <div className="flex flex-col gap-4 mt-4">
                {cards.map((card) => (
                  <HoverCard key={card.id} card={card} textColor={textColor} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Off mode - always show cards without toggle */}
        {cards.length > 0 && heroCards.mode === "off" && (
          <div className="px-4 pb-4">
            <div className="flex flex-col gap-4">
              {cards.map((card) => (
                <HoverCard key={card.id} card={card} textColor={textColor} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout with hero shift animation
  // When revealed: hero shifts LEFT, cards slide in FROM THE RIGHT
  const hasCards = cards.length > 0;
  const isOffMode = heroCards.mode === "off";
  
  // Determine if cards should be visible
  // For "off" mode: always visible
  // For other modes: based on isRevealed state
  const cardsVisible = isOffMode || isRevealed;

  return (
    <div 
      ref={heroRef}
      className="w-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="hero-section"
      style={{ minHeight: "280px" }}
    >
      <div 
        className="w-full flex items-center justify-center py-12 px-8 relative"
        style={{ minHeight: "280px" }}
      >
        {/* Hero Content - shifts LEFT when cards are visible (except in off mode where it's always shifted) */}
        <div 
          className="flex flex-col items-center text-center flex-shrink-0 relative z-10"
          style={{
            ...animationStyle,
            // In "off" mode: always shifted left if cards exist
            // In other modes: shift left only when revealed
            transform: hasCards && cardsVisible 
              ? `translateX(-${heroShiftAmount}px)` 
              : "translateX(0)",
          }}
        >
          <div 
            className="w-28 h-28 rounded-full overflow-hidden mb-6 flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.22)",
              border: "2px solid rgba(255,255,255,0.35)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {banner.avatar ? (
              <img src={banner.avatar} alt="头像" className="w-full h-full object-cover" data-testid="img-avatar" />
            ) : (
              <Music className="w-12 h-12" style={{ color: textColor, opacity: 0.6 }} />
            )}
          </div>

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

          {/* Hint - only show when cards are hidden and mode is not "off" */}
          {!isOffMode && hasCards && (
            <p 
              style={{
                color: textColor,
                fontSize: banner.styles.hintSize,
                opacity: isRevealed ? 0 : 0.6,
                ...animationStyle,
              }}
              data-testid="text-hero-hint"
            >
              {banner.hint}
            </p>
          )}
        </div>

        {/* Cards Container - positioned to the RIGHT of hero, slides in from right */}
        {hasCards && (
          <div 
            className="flex flex-col gap-4 flex-shrink-0 absolute"
            style={{
              ...animationStyle,
              left: "50%",
              // In "off" mode or when revealed: cards at final position
              // Otherwise: cards pushed off to the right
              marginLeft: cardsVisible 
                ? `${heroCards.gapPx / 2}px` 
                : `${cardContainerWidth + heroCards.gapPx}px`,
              opacity: cardsVisible ? 1 : 0,
              pointerEvents: cardsVisible ? "auto" : "none",
              minWidth: "280px",
              maxWidth: "360px",
            }}
          >
            {cards.map((card) => (
              <HoverCard key={card.id} card={card} textColor={textColor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
