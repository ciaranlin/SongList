import { useState, useEffect, useRef, useCallback } from "react";
import { type SiteConfig, type Card as CardType, cardImageConfigSchema } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Music, ExternalLink, Twitter, Youtube, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { SiBilibili } from "react-icons/si";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  config: SiteConfig;
  isMobile: boolean;
  onCapacityChange?: (isFull: boolean, maxCards: number) => void;
}

function getIconComponent(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case "twitter":
      return Twitter;
    case "youtube":
      return Youtube;
    case "bilibili":
      return SiBilibili;
    case "github":
      return () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;
    case "mail":
      return () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
    case "link":
      return () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
    case "share":
      return () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.469 9 12c0-3.318-2.686-6-6-6s-6 2.682-6 6 2.686 6 6 6c.469 0 .938-.114 1.342-.216m9.958-4.6c.092.166.159.345.159.534 0 1.102-.898 2-2 2s-2-.898-2-2 .898-2 2-2c.189 0 .368.067.534.159M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case "phone":
      return () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 4.493a1 1 0 00.502.756l2.048 1.029a2.42 2.42 0 010 4.316l-2.048 1.029a1 1 0 00-.502.756l-1.498 4.493a1 1 0 00-.948.684H5a2 2 0 01-2-2V5z" /></svg>;
    case "mappin":
      return () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case "facebook":
      return () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case "instagram":
      return () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m5.521 17.500c-.5.71-1.235 1.35-2.021 1.85-.786.5-1.626.873-2.51 1.122-.884.248-1.802.373-2.74.373-.938 0-1.856-.125-2.74-.373-.884-.249-1.724-.622-2.51-1.122-.786-.5-1.521-1.14-2.021-1.85-.5-.71-.873-1.526-1.122-2.41-.248-.884-.373-1.802-.373-2.74 0-.938.125-1.856.373-2.74.249-.884.622-1.724 1.122-2.51.5-.786 1.14-1.521 1.85-2.021.71-.5 1.526-.873 2.41-1.122.884-.248 1.802-.373 2.74-.373.938 0 1.856.125 2.74.373.884.249 1.724.622 2.51 1.122.786.5 1.521 1.14 2.021 1.85.5.71.873 1.526 1.122 2.41.248.884.373 1.802.373 2.74 0 .938-.125 1.856-.373 2.74-.249.884-.622 1.724-1.122 2.51z"/></svg>;
    case "linkedin":
      return () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>;
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

function HoverCard({ card, textColor, config }: { card: CardType; textColor: string; config: SiteConfig }) {
  const imageConfig = config.cardImageConfig ?? cardImageConfigSchema.parse({});
  
  return (
    <div
      className="flex flex-col gap-3 break-inside-avoid-column"
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
      {card.image && (
        <div 
          style={{
            width: imageConfig.boxWidth,
            height: imageConfig.boxHeight,
            padding: imageConfig.padding,
            backgroundColor: imageConfig.backgroundColor,
            borderRadius: imageConfig.borderRadius,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img 
            src={card.image} 
            alt={card.title} 
            style={{
              width: "100%",
              height: "100%",
              objectFit: imageConfig.fit,
              objectPosition: `${imageConfig.posX}% ${imageConfig.posY}%`,
              transform: `scale(${imageConfig.scale})`,
            }}
          />
        </div>
      )}

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

export function HeroSection({ config, isMobile, onCapacityChange }: HeroSectionProps) {
  const banner = config.banner ?? {
    avatar: "",
    title: "歌单列表",
    subtitle: "欢迎来到我的歌单",
    hint: "移入查看更多",
    styles: {
      titleSize: "44px",
      titleWeight: "700",
      subtitleSize: "28px",
      subtitleWeight: "500",
      hintSize: "13px",
    },
  };
  const theme = config.theme ?? {
    background: "#A9BAC4",
    textColorMode: "auto" as const,
    manualTextColor: "#1B1B1B",
  };
  const cards = config.cards ?? [];
  const cardLayout = config.cardLayout ?? {
    mode: "columns" as const,
    areaHeight: "600px",
    columnCount: 1,
    cardWidth: "300px", // 调整卡片宽度，确保三列时充满卡片区域
    cardGap: 12, // 保持合理间距
    mobileColumnCount: 1
  };
  const avatarConfig = config.avatarConfig ?? {
    size: 160,
    borderWidth: "2px",
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: "50%"
  };
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

  // Calculate hero shift amount based on card width and gap
  const cardContainerWidth = cardLayout.cardWidth.includes("%") 
    ? 320 // default for percentage width
    : parseInt(cardLayout.cardWidth) || 320;
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
                  <HoverCard key={card.id} card={card} textColor={textColor} config={config} />
                ))}
              </div>
            </div>
          </div>
        )}

        {hasCards && isOffMode && (
          <div className="px-4 pb-4">
            <div className="flex flex-col gap-4">
              {cards.map((card) => (
                <HoverCard key={card.id} card={card} textColor={textColor} config={config} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fix hover hotspot to only trigger on visible area of avatar
  const handleAvatarHover = useCallback((event: React.MouseEvent) => {
    if (!isHoverMode || isMobile) return;
    
    // Only trigger if hover is actually on the avatar image, not on empty space
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG' || target === avatarRef.current) {
      handleHotspotEnter();
    }
  }, [isHoverMode, isMobile, handleHotspotEnter]);

  const hotspotHandlers = heroHotspot.enabled && isHoverMode
    ? { onMouseEnter: handleAvatarHover }
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


  // Calculate the number of card columns
  const [cardColumns, setCardColumns] = useState(1);
  const [cards3plus, setCards3plus] = useState(false);
  const [maxCards, setMaxCards] = useState(0);
  const [isCapacityFull, setIsCapacityFull] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update cardRefs array when cards change
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length);
  }, [cards.length]);

  // Calculate columns and capacity using ResizeObserver for accurate DOM measurements
  useEffect(() => {
    if (!cardsContainerRef.current || !hasCards) return;

    const container = cardsContainerRef.current;
    let resizeObserver: ResizeObserver | null = null;

    // Combined function to calculate both columns and capacity
    const calculateLayout = () => {
      // Get cardsInner element
      const cardsInner = container.querySelector('.cardsInner');
      if (!cardsInner) return;

      // Get actual DOM dimensions using getBoundingClientRect for more accurate measurements
      const cardsInnerRect = cardsInner.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const cardsInnerWidth = cardsInnerRect.width;
      const containerHeight = containerRect.height;
      
      const cardWidth = parseInt(cardLayout.cardWidth) || 260;
      const columnGap = cardLayout.cardGap || 12;
      
      // Calculate number of columns based on actual width, but cap at 3
      const columnWidthWithGap = cardWidth + columnGap;
      const numColumns = Math.min(3, Math.max(1, Math.floor((cardsInnerWidth + columnGap) / columnWidthWithGap)));
      
      setCardColumns(numColumns);
      setCards3plus(numColumns > 2);

      // Evaluate capacity based on actual CSS Multi-Column layout and real DOM measurements
      const evaluateCapacity = () => {
        // Get all card elements
        const cardElements = Array.from(cardsInner.querySelectorAll('[data-testid^="card-"]'));
        if (cardElements.length === 0) return;

        // Get the actual margin bottom from the first card
        const firstCardStyle = window.getComputedStyle(cardElements[0].parentElement || cardElements[0]);
        const cardMarginBottom = parseFloat(firstCardStyle.marginBottom) || 0;
        
        // Calculate available height in each column
        const availableHeight = containerHeight;
        
        // Track the position of each card to determine column placement
        const cardPositions: { top: number; bottom: number; column: number }[] = [];
        
        // Get the actual position of each card in the DOM
        cardElements.forEach((cardEl, index) => {
          const cardRect = cardEl.getBoundingClientRect();
          const cardsInnerRect = cardsInner.getBoundingClientRect();
          
          // Calculate relative position within cardsInner
          const top = cardRect.top - cardsInnerRect.top;
          const bottom = cardRect.bottom - cardsInnerRect.top;
          
          // Determine which column the card is in
          let column = 0;
          if (index > 0) {
            // Find the previous card that is in a different column (more than cardWidth to the left)
            for (let i = index - 1; i >= 0; i--) {
              const prevCardEl = cardElements[i];
              const prevCardRect = prevCardEl.getBoundingClientRect();
              
              if (Math.abs(prevCardRect.left - cardRect.left) > cardWidth / 2) {
                // This is likely the first card in a new column
                column = cardPositions[i].column + 1;
                break;
              }
            }
          }
          
          cardPositions.push({ top, bottom, column });
        });
        
        // Group cards by column
        const columns: { cards: typeof cardPositions[]; maxBottom: number }[] = [];
        cardPositions.forEach(pos => {
          if (!columns[pos.column]) {
            columns[pos.column] = { cards: [], maxBottom: 0 };
          }
          columns[pos.column].cards.push(pos);
          columns[pos.column].maxBottom = Math.max(columns[pos.column].maxBottom, pos.bottom + cardMarginBottom);
        });
        
        // Calculate maximum cards by checking if all current cards fit within the container
        let maxCapacity = cards.length;
        let isFull = false;
        
        // Check if any column exceeds the container height
        const anyColumnExceeds = columns.some(col => col.maxBottom > availableHeight);
        
        if (anyColumnExceeds) {
          // If any column exceeds, we need to reduce capacity
          // Find the first card that causes overflow
          for (let i = cardPositions.length - 1; i >= 0; i--) {
            const pos = cardPositions[i];
            const column = columns[pos.column];
            
            // Remove this card and see if column fits
            const newColumnCards = column.cards.filter(c => c !== pos);
            const newColumnMaxBottom = newColumnCards.length > 0 
              ? Math.max(...newColumnCards.map(c => c.bottom + cardMarginBottom)) 
              : 0;
            
            if (newColumnMaxBottom <= availableHeight) {
              // This is the first card that causes overflow
              maxCapacity = i;
              break;
            }
          }
          
          isFull = true;
        } else {
          // Check if we can fit one more card
          const firstCardHeight = cardElements[0].getBoundingClientRect().height + cardMarginBottom;
          const shortestColumn = columns.reduce((prev, curr) => 
            prev.maxBottom < curr.maxBottom ? prev : curr
          );
          
          if (shortestColumn.maxBottom + firstCardHeight > availableHeight) {
            // Cannot fit another card
            isFull = true;
          }
        }
        
        // Ensure maxCapacity is at least 0
        maxCapacity = Math.max(0, maxCapacity);
        
        setMaxCards(maxCapacity);
        setIsCapacityFull(isFull);
        
        // Notify parent component about capacity change
        if (onCapacityChange) {
          onCapacityChange(isFull, maxCapacity);
        }
      };

      evaluateCapacity();
    };

    // Initial calculation
    calculateLayout();

    // Use ResizeObserver to monitor real DOM size changes
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateLayout);
    });

    // Observe multiple elements that can affect the layout
    const elementsToObserve: HTMLElement[] = [container];
    const cardsInner = container.querySelector('.cardsInner');
    if (cardsInner) elementsToObserve.push(cardsInner as HTMLElement);
    
    // Also observe all card elements for changes in content size
    const cardElements = container.querySelectorAll('[data-testid^="card-"]');
    cardElements.forEach(cardEl => elementsToObserve.push(cardEl as HTMLElement));
    
    // Observe all elements
    elementsToObserve.forEach(el => resizeObserver!.observe(el));

    // Also observe window resize for viewport changes
    const handleWindowResize = () => {
      requestAnimationFrame(calculateLayout);
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [cards, cardLayout.cardWidth, cardLayout.cardGap, hasCards, onCapacityChange, cardLayout.mode]);

  return (
    <div 
      ref={heroRef}
      className={`topBand flex-shrink-0 ${cards3plus ? 'cards3plus' : ''}`}
      data-testid="hero-section"
      style={{
        display: 'grid',
        gridTemplateColumns: cards3plus 
          ? 'minmax(240px, 0.9fr) minmax(520px, 2.1fr)' 
          : 'minmax(320px, 1fr) minmax(360px, 2fr)',
        gap: '12px',
        alignItems: 'center', // 垂直居中
        justifyContent: 'center', // 始终水平居中
        padding: '16px 0',
        height: 'min(400px, calc(100vh - 380px))', // 进一步缩小上半区高度，留出更多空间给表格
        maxWidth: config.layout?.contentMaxWidth || '1200px', // 与表格外框对齐
        margin: '0 auto', // 水平居中基础
      }}
    >
      {/* Hero Area (Left Column) */}
      <div 
        className="hero-area flex flex-col items-center text-center py-4 px-6"
        {...legacyHoverHandlers}
        {...panelHoverHandlers}
      >
        <div 
          className="flex flex-col items-center text-center flex-shrink-0 relative z-10"
          style={{
            ...animationStyle,
          }}
        >
          <div 
            ref={avatarRef}
            className="rounded-full overflow-hidden mb-6 flex items-center justify-center relative"
            style={{
              width: `${avatarConfig.size}px`,
              height: `${avatarConfig.size}px`,
              background: "rgba(255,255,255,0.22)",
              border: `${avatarConfig.borderWidth}px solid ${avatarConfig.borderColor}`,
              borderRadius: `${avatarConfig.borderRadius}px`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
            {...hotspotHandlers}
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

      </div>

      {/* Cards Area (Right Column) */}
      {hasCards && (shouldRender || isOffMode) && (
        <div 
          ref={cardsContainerRef}
          className="cardColumnWrap flex-shrink-0 relative h-full flex flex-col justify-center" // 垂直居中容器
          style={{
            ...animationStyle,
            opacity: cardsVisible ? 1 : 0,
            pointerEvents: cardsVisible ? "auto" : "none",
            height: "100%", // 与头图区域同高
            width: "100%",
            overflow: "hidden", // 确保无滚动条
            padding: "8px 0",
          }}
          onMouseEnter={handleCardsEnter}
        >
          <div 
            className="cardsInner" // 使用CSS多列布局
            style={{
              height: "100%",
              columns: `3 ${cardLayout.cardWidth}`, // 最多3列，每列宽度
              columnFill: "auto", // 从上到下填充
              columnGap: `${cardLayout.cardGap}px`, // 列间距
              gap: `${cardLayout.cardGap}px`, // 同时设置gap确保兼容性
              padding: "0 4px",
            }}
          >
            {cards.map((card, index) => (
              <div 
                key={card.id} 
                ref={el => cardRefs.current[index] = el}
                style={{ 
                  marginBottom: "16px",
                  breakInside: "avoid", // 避免卡片被拆分到不同列
                }}
              >
                <HoverCard card={card} textColor={textColor} config={config} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
