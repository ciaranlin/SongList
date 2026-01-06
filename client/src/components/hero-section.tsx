import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { Rnd } from "react-rnd";
import { type SiteConfig, type Card as CardType } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Music, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalIcon } from "./local-icon";

interface HeroSectionProps {
  config: SiteConfig;
  isMobile: boolean;
  onCardDragEnd?: (cardId: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  onHeaderDragEnd?: (position: { x: number; y: number }, size: { width: number; height: number }) => void;
  canDrag?: boolean; // 是否允许拖动浮层，默认false
}

function CardLinkItem({ link, textColor }: { link: CardType["links"][0]; textColor: string }) {
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
      <LocalIcon name={link.icon || "external-link-line"} className="w-4 h-4" />
      <span>{link.label}</span>
    </a>
  );
}

function HoverCard({ card, textColor, isDragging }: { card: CardType; textColor: string; isDragging?: boolean }) {
  return (
    <div
      className="flex flex-col gap-3"
      style={{
        padding: card.styles.padding,
        borderRadius: card.styles.borderRadius,
        background: card.styles.background,
        border: card.styles.border,
        boxShadow: card.styles.shadow,
        // 拖拽过程中禁用模糊效果，提高性能
        backdropFilter: isDragging ? "none" : "blur(12px)",
        WebkitBackdropFilter: isDragging ? "none" : "blur(12px)",
      }}
      data-testid={`card-${card.id}`}
    >
      {card.image && (
        <div
          className="relative w-full"
          style={{
            width: card.imageConfig?.boxWidth || '100%',
            height: card.imageConfig?.boxHeight || '128px',
            borderRadius: card.imageConfig?.borderRadius || '8px',
            padding: card.imageConfig?.padding || '0px',
            backgroundColor: card.imageConfig?.backgroundColor || 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img 
            src={card.image} 
            alt={card.title} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: card.imageConfig?.fit || 'cover',
              objectPosition: `${card.imageConfig?.posX || 50}% ${card.imageConfig?.posY || 50}%`,
              transform: `scale(${card.imageConfig?.scale || 1})`,
              borderRadius: card.imageConfig?.borderRadius || '8px',
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

// 简化动画效果，只保留淡入淡出
function getSimpleFadeStyle(visible: boolean, isDragging: boolean, isHeader: boolean = false) {
  // 拖拽过程中禁用过渡效果，提高性能
  // 头图淡出时间较短（200ms），卡片淡入时间正常（400ms）
  const duration = isHeader ? "200ms" : "400ms";
  return {
    transitionProperty: isDragging ? "none" : "opacity",
    transitionDuration: isDragging ? "0ms" : duration,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: visible ? 1 : 0,
    transform: "none", // 移除所有transform效果，只保留淡入淡出
  } as CSSProperties;
}

// Types for layout conversion
export interface MobileLayoutCard {
  card: CardType;
  gridPosition: {
    row: number;
    col: number;
    width: number; // percentage width
    height: number; // percentage height or auto
  };
  percentageSize: {
    width: number;
    height: number;
  };
}

// Layout conversion logic: converts desktop absolute layout to mobile grid layout
const convertDesktopToMobileLayout = (cards: CardType[], containerWidth: number, mobileConfig: any): MobileLayoutCard[] => {
  // Calculate container width with safe insets
  const safeContainerWidth = containerWidth - (mobileConfig.safeInsets * 2);
  const columnCount = mobileConfig.columnCount;
  const cardGap = mobileConfig.cardGap;
  
  // Calculate base card width for grid layout
  const cardWidth = (safeContainerWidth - (cardGap * (columnCount - 1))) / columnCount;
  const cardWidthPercent = (cardWidth / safeContainerWidth) * 100;
  
  // Create mobile layout cards with grid positioning
  return cards.map((card, index) => {
    // For auto-grid, calculate row and column based on index
    const col = index % columnCount;
    const row = Math.floor(index / columnCount);
    
    // Calculate height as percentage based on aspect ratio
    const aspectRatio = card.height / card.width;
    const cardHeightPercent = cardWidthPercent * aspectRatio;
    
    return {
      card,
      gridPosition: {
        row,
        col,
        width: cardWidthPercent,
        height: cardHeightPercent,
      },
      percentageSize: {
        width: cardWidthPercent,
        height: cardHeightPercent,
      },
    };
  });
}

export function HeroSection({ config, isMobile, onCardDragEnd, onHeaderDragEnd, canDrag = false }: HeroSectionProps) {
  const { banner, theme, cards, headerImage, displayMode: incomingMode, responsiveLayout } = config;
  const boundsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [mobileLayoutCards, setMobileLayoutCards] = useState<MobileLayoutCard[]>([]);

  // Get responsive layout config with defaults
  const mobileConfig = responsiveLayout?.mobile || {
    columnCount: 1,
    cardGap: 16,
    safeInsets: 16,
    layoutMode: "auto-grid",
  };

  const contentMaxWidth = config.layout?.contentMaxWidth || "1200px";
  const displayMode = isMobile ? "always" : (incomingMode ?? "always");
  const isHoverMode = displayMode === "hoverReveal";
  const [expanded, setExpanded] = useState(displayMode === "always");
  const [shouldRender, setShouldRender] = useState(displayMode === "always");
  const [isDragging, setIsDragging] = useState(false); // 跟踪是否正在拖拽

  // Update container width for layout calculations
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

  // Convert desktop layout to mobile layout when cards or container width changes
  useEffect(() => {
    if (isMobile && cards.length > 0) {
      const mobileCards = convertDesktopToMobileLayout(cards, containerWidth, mobileConfig);
      setMobileLayoutCards(mobileCards);
    }
  }, [isMobile, cards, containerWidth, mobileConfig]);

  // 拖拽开始时禁用过渡效果
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // 拖拽结束后恢复过渡效果
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加全局鼠标释放事件监听，确保拖拽状态能正确结束
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    // 添加全局事件监听器作为安全措施
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      // 移除全局事件监听器
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  useEffect(() => {
    if (displayMode === "always") {
      setExpanded(true);
      setShouldRender(true);
    }
  }, [displayMode]);

  const textColor = theme.textColorMode === "auto" 
    ? getAutoTextColor(theme.background) 
    : theme.manualTextColor;

  // 可见性逻辑：
  // - always模式：头图和卡片都始终显示
  // - hoverReveal模式：非悬停时显示头图，悬停时头图淡出隐藏，卡片显示
  const cardsVisible = displayMode === "always" ? true : expanded;
  const headerVisible = displayMode === "always" ? true : !expanded; // 悬停触发模式下，悬停时头图淡出隐藏

  // banner区域固定高度，设置为固定值，确保筛选区不会向上移动
  const bannerHeight = 450; // 固定高度，确保头图和卡片都有足够空间

  const handleHeaderEnter = useCallback(() => {
    if (!isHoverMode) return;
    setShouldRender(true);
    requestAnimationFrame(() => setExpanded(true));
  }, [isHoverMode]);

  const handleHeaderLeave = useCallback(() => {
    if (!isHoverMode) return;
    setExpanded(false);
    // 不要隐藏整个组件，只通过透明度控制可见性
    // 这样可以确保悬停检测始终有效，不会出现都不显示的情况
  }, [isHoverMode]);

  // 修复shouldRender逻辑，确保在hoverReveal模式下组件始终渲染
  useEffect(() => {
    if (displayMode === "hoverReveal") {
      setShouldRender(true); // 悬停模式下始终渲染，只通过透明度控制可见性
    }
  }, [displayMode]);

  if (isMobile) {
    return (
      <div ref={containerRef} className="w-full" data-testid="hero-section">
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

        {cards.length > 0 && (
          <div 
            className="px-4 pb-4"
            style={{
              padding: `${mobileConfig.safeInsets}px`,
            }}
          >
            {/* Mobile grid layout - auto-generated from desktop layout */}
            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${mobileConfig.columnCount}, 1fr)`,
                gap: `${mobileConfig.cardGap}px`,
              }}
            >
              {mobileLayoutCards.map(({ card }) => (
                <div key={card.id} className="w-full">
                  <HoverCard card={card} textColor={textColor} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div
        className="w-full"
        style={{
          maxWidth: contentMaxWidth,
          boxSizing: "border-box",
        }}
      >
        <div
          ref={boundsRef}
          className="relative"
          data-testid="hero-section"
          style={{
            width: "100%",
            height: `${bannerHeight}px`,
            position: "relative",
            background: theme.background,
            padding: 0,
            minHeight: `${bannerHeight}px`, // 确保高度不会收缩
            maxHeight: `${bannerHeight}px`, // 确保高度不会扩展
          }}
          onMouseEnter={handleHeaderEnter} // 将悬停检测转移到父容器
          onMouseLeave={handleHeaderLeave} // 将悬停检测转移到父容器
        >
          {/* 恢复使用Rnd组件，移除调试代码 */}
          <Rnd
            size={{ 
              width: headerImage?.width || 600, 
              height: headerImage?.height || 200,
            }}
            position={{ 
              x: headerImage?.x || 0, 
              y: headerImage?.y || 0 
            }}
            // 头图左右各缩小三分之一，总宽度变为原来的一半
            minWidth={250}
            minHeight={150}
            maxWidth={500}
            maxHeight={250}
            bounds="parent"
            draggable={canDrag}
            resizable={canDrag && !isMobile}
            enableResizing={canDrag && !isMobile}
            cancel=""
            enableUserSelectHack={true}
            allowAnyClick={true}
            style={{
              zIndex: headerImage?.zIndex || 1,
              cursor: canDrag ? "grab" : "default",
              borderRadius: "12px",
              userSelect: "none",
              overflow: "visible",
              ...getSimpleFadeStyle(headerVisible, isDragging, true),
            }}
            onDragStart={handleDragStart}
            onDrag={(_, data) => {
              // 实时更新位置，确保拖拽流畅
              if (canDrag) {
                onHeaderDragEnd?.({ x: data.x, y: data.y }, {
                  width: headerImage?.width || 600,
                  height: headerImage?.height || 200
                });
              }
            }}
            onDragStop={(_, data) => {
              if (canDrag) {
                onHeaderDragEnd?.({ x: data.x, y: data.y }, {
                  width: headerImage?.width || 600,
                  height: headerImage?.height || 200
                });
              }
              handleDragEnd();
            }}
            onResizeStart={handleDragStart}
            onResize={(_event, _direction, ref, _delta, position) => {
              // 实时更新大小和位置
              if (canDrag) {
                onHeaderDragEnd?.({ x: position.x, y: position.y }, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight
                });
              }
            }}
            onResizeStop={(_event, _direction, ref, _delta, position) => {
              if (canDrag) {
                onHeaderDragEnd?.({ x: position.x, y: position.y }, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight
                });
              }
              handleDragEnd();
            }}
          >
            {headerImage?.src && (
              <img 
                src={headerImage.src} 
                alt="Banner 头图" 
                className="w-full h-full object-contain absolute inset-0"
                style={{ pointerEvents: "none", borderRadius: "12px" }}
              />
            )}
            <div 
              className="w-full h-full flex items-center justify-center py-4 px-6 relative z-10"
              style={{ 
                userSelect: "none", 
                backdropFilter: headerImage?.src ? "none" : "blur(12px)",
                pointerEvents: canDrag ? "none" : "auto"
              }}
            >
              <div className="flex flex-col items-center text-center flex-shrink-0">
                <div 
                  className="w-28 h-28 rounded-full overflow-hidden mb-3 flex items-center justify-center relative"
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
                  className="tracking-tight"
                  style={{
                    color: textColor,
                    fontSize: banner.styles.titleSize,
                    fontWeight: banner.styles.titleWeight,
                    textShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    whiteSpace: "nowrap",
                  }}
                  data-testid="text-hero-title"
                >
                  {banner.title}
                </h1>

                <p 
                  className="mt-1"
                  style={{
                    color: textColor,
                    fontSize: banner.styles.subtitleSize,
                    fontWeight: banner.styles.subtitleWeight,
                    opacity: 0.9,
                    whiteSpace: "nowrap",
                  }}
                  data-testid="text-hero-subtitle"
                >
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </Rnd>

          {cards.length > 0 && (shouldRender || displayMode === "always") && cards.map((card) => {
    const visible = cardsVisible && (card.visible ?? true);
    return (
      <Rnd
        key={card.id}
        size={{ width: card.width || 280, height: card.height || 200 }}
        position={{ x: card.x || 0, y: card.y || 0 }}
        bounds={boundsRef.current || undefined}
        draggable={canDrag}
        resizable={canDrag && !isMobile}
        enableResizing={canDrag && !isMobile}
        cancel=""
        enableUserSelectHack={false}
        allowAnyClick={true}
        style={{
          zIndex: card.zIndex || 10,
          cursor: canDrag ? "grab" : "default",
          userSelect: "none",
          pointerEvents: visible ? "auto" : "none",
          overflow: "visible",
          ...getSimpleFadeStyle(visible, isDragging, false),
        }}
        onDragStart={handleDragStart}
        onDrag={(_, data) => {
          // 实时更新位置，确保拖拽流畅
          if (canDrag) {
            onCardDragEnd?.(card.id, { x: data.x, y: data.y }, { width: card.width || 280, height: card.height || 200 });
          }
        }}
        onDragStop={(_, data) => {
          if (canDrag) {
            onCardDragEnd?.(card.id, { x: data.x, y: data.y }, { width: card.width || 280, height: card.height || 200 });
          }
          handleDragEnd();
        }}
        onResizeStart={handleDragStart}
        onResize={(_event, _direction, ref, _delta, position) => {
          // 实时更新大小和位置
          if (canDrag) {
            const newWidth = ref.offsetWidth;
            const newHeight = ref.offsetHeight;
            onCardDragEnd?.(card.id, { x: position.x, y: position.y }, { width: newWidth, height: newHeight });
          }
        }}
        onResizeStop={(_event, _direction, ref, _delta, position) => {
          if (canDrag) {
            const newWidth = ref.offsetWidth;
            const newHeight = ref.offsetHeight;
            onCardDragEnd?.(card.id, { x: position.x, y: position.y }, { width: newWidth, height: newHeight });
          }
          handleDragEnd();
        }}
              >
                <HoverCard card={card} textColor={textColor} isDragging={isDragging} />
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
