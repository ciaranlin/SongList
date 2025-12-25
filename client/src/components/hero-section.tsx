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
  const avatarRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  const [expanded, setExpanded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const heroCards = config.heroCards ?? {
    mode: "scrollReveal" as const,
    heroShiftPx: 0,
    gapPx: 32,
    animationDurationMs: 400,
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const heroHotspot = config.heroHotspot ?? {
    enabled: true,
    target: "avatar" as const,
    sizePx: 80,
    showHint: true,
    hintText: "移入展开",
    debounceMs: 120,
  };

  const textColor = theme.textColorMode === "auto" 
    ? getAutoTextColor(theme.background) 
    : theme.manualTextColor;

  const isOffMode = heroCards.mode === "off";
  const isHoverMode = heroCards.mode === "hoverReveal";
  const isScrollMode = heroCards.mode === "scrollReveal";
  const hasCards = cards.length > 0;

  useEffect(() => {
    if (isOffMode) {
      setExpanded(true);
      setShouldRender(true);
    }
  }, [isOffMode]);

  useEffect(() => {
    if (isScrollMode && !isMobile) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldRender(true);
            requestAnimationFrame(() => setExpanded(true));
          } else {
            setExpanded(false);
          }
        },
        { threshold: 0.5, rootMargin: "0px" }
      );

      if (heroRef.current) {
        observer.observe(heroRef.current);
      }

      return () => observer.disconnect();
    }
  }, [isScrollMode, isMobile]);

  useEffect(() => {
    if (!expanded && shouldRender && !isOffMode) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, heroCards.animationDurationMs + 50);
      return () => clearTimeout(timer);
    }
  }, [expanded, shouldRender, heroCards.animationDurationMs, isOffMode]);

  const handleHotspotEnter = useCallback(() => {
    if (!isHoverMode || isMobile) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    setShouldRender(true);
    requestAnimationFrame(() => setExpanded(true));
  }, [isHoverMode, isMobile]);

  const handleHotspotLeave = useCallback(() => {
    if (!isHoverMode || isMobile) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setExpanded(false);
      debounceTimerRef.current = null;
    }, heroHotspot.debounceMs);
  }, [isHoverMode, isMobile, heroHotspot.debounceMs]);

  const handleCardsEnter = useCallback(() => {
    if (!isHoverMode || isMobile) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [isHoverMode, isMobile]);

  const handleCardsLeave = useCallback(() => {
    // Intentionally no-op: closing is handled by leaving the whole panel area.
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const cardContainerWidth = 320;
  const autoShift = hasCards ? (cardContainerWidth / 2) + (heroCards.gapPx / 2) : 0;
  const heroShiftAmount = heroCards.heroShiftPx > 0 ? heroCards.heroShiftPx : autoShift;

  const animationStyle = {
    transitionProperty: "transform, opacity, margin-left",
    transitionDuration: `${heroCards.animationDurationMs}ms`,
    transitionTimingFunction: heroCards.animationEasing,
  };

  const cardsVisible = isOffMode || expanded;

  if (isMobile) {
    return (
      <div 
        ref={heroRef}
        className="w-full"
        data-testid="hero-section"
      >
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

          {/* small hover hint under subtitle */}
          {isHoverMode && heroHotspot.enabled && hasCards && (
            <p
              style={{
                color: textColor,
                fontSize: "11px",
                opacity: 0.6,
                marginTop: "-8px",
                marginBottom: "12px",
              }}
            >
              {heroHotspot.hintText || "移入显示更多"}
            </p>
          )}

        </div>

        {hasCards && !isOffMode && (
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

        {hasCards && isOffMode && (
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

  const hotspotHandlers = heroHotspot.enabled && isHoverMode
    ? { onMouseEnter: handleHotspotEnter }
    : {};

  const legacyHoverHandlers = !heroHotspot.enabled && isHoverMode
    ? { onMouseEnter: handleHotspotEnter, onMouseLeave: handleHotspotLeave }
    : {};

  // When using a small hotspot to open, keep the panel open while the mouse stays within
  // the whole hero+cards area (including the gap), and only close when leaving this area.
  const handlePanelEnter = useCallback(() => {
    if (!isHoverMode || isMobile) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [isHoverMode, isMobile]);

  const handlePanelLeave = useCallback(() => {
    if (!isHoverMode || isMobile) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setExpanded(false);
      debounceTimerRef.current = null;
    }, heroHotspot.debounceMs);
  }, [isHoverMode, isMobile, heroHotspot.debounceMs]);

  const panelHoverHandlers = heroHotspot.enabled && isHoverMode
    ? { onMouseEnter: handlePanelEnter, onMouseLeave: handlePanelLeave }
    : {};


  return (
    <div 
      ref={heroRef}
      className="w-full overflow-hidden"
      {...legacyHoverHandlers}
      data-testid="hero-section"
      style={{ minHeight: "280px" }}
    >
      <div 
        className="w-full flex items-center justify-center py-12 px-8 relative"
        {...panelHoverHandlers}
        style={{ minHeight: "280px" }}
      >
        <div 
          className="flex flex-col items-center text-center flex-shrink-0 relative z-10"
          style={{
            ...animationStyle,
            transform: hasCards && cardsVisible 
              ? `translateX(-${heroShiftAmount}px)` 
              : "translateX(0)",
          }}
        >
          <div 
            ref={avatarRef}
            className="w-40 h-40 rounded-full overflow-hidden mb-6 flex items-center justify-center relative"
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
            
            {heroHotspot.enabled && isHoverMode && heroHotspot.target === "avatar" && hasCards && (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
                <div
                  className="rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    width: `${heroHotspot.sizePx}px`,
                    height: `${heroHotspot.sizePx}px`,
                    background: expanded ? "transparent" : "rgba(0,0,0,0.25)",
                    backdropFilter: expanded ? "none" : "blur(2px)",
                    transition: "all 200ms ease",
                    pointerEvents: "auto",
                  }}
                  {...hotspotHandlers}
                  data-testid="hotspot-avatar"
                >
                  {heroHotspot.showHint && !expanded && (
                    <span style={{ color: "#fff", fontSize: "10px", fontWeight: 500, textAlign: "center", padding: "4px" }}>
                      {heroHotspot.hintText}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative mb-3">
            <h1 
              ref={titleRef}
              className="tracking-tight"
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
            
            {heroHotspot.enabled && isHoverMode && heroHotspot.target === "title" && hasCards && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-lg"
                style={{
                  background: expanded ? "transparent" : "rgba(0,0,0,0.08)",
                  transition: "all 200ms ease",
                }}
                {...hotspotHandlers}
                data-testid="hotspot-title"
              >
                {heroHotspot.showHint && !expanded && (
                  <span 
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    style={{ color: textColor, fontSize: "11px", opacity: 0.6 }}
                  >
                    {heroHotspot.hintText}
                  </span>
                )}
              </div>
            )}
          </div>

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

          {!isOffMode && hasCards && !heroHotspot.enabled && (
            <p 
              style={{
                color: textColor,
                fontSize: banner.styles.hintSize,
                opacity: expanded ? 0 : 0.6,
                ...animationStyle,
              }}
              data-testid="text-hero-hint"
            >
              {banner.hint}
            </p>
          )}
        </div>

        {hasCards && (shouldRender || isOffMode) && (
          <div 
            ref={cardsContainerRef}
            className="flex flex-col gap-4 flex-shrink-0 absolute"
            style={{
              ...animationStyle,
              left: "50%",
              marginLeft: cardsVisible 
                ? `${heroCards.gapPx / 2}px` 
                : `${cardContainerWidth + heroCards.gapPx}px`,
              opacity: cardsVisible ? 1 : 0,
              pointerEvents: cardsVisible ? "auto" : "none",
              minWidth: "280px",
              maxWidth: "360px",
            }}
            onMouseEnter={handleCardsEnter}
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
