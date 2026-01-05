import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { Rnd } from "react-rnd";
import { type SiteConfig, type Card as CardType } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { Music, ExternalLink, Twitter, Youtube, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { SiBilibili } from "react-icons/si";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  config: SiteConfig;
  isMobile: boolean;
  onCardDragEnd?: (cardId: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  onHeaderDragEnd?: (position: { x: number; y: number }, size: { width: number; height: number }) => void;
  canDrag?: boolean; // 是否允许拖动浮层，默认false
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
        <img 
          src={card.image} 
          alt={card.title} 
          className="w-full h-32 rounded-lg object-cover"
          style={{ borderRadius: "8px" }}
        />
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

export function HeroSection({ config, isMobile, onCardDragEnd, onHeaderDragEnd, canDrag = false }: HeroSectionProps) {
  const { banner, theme, cards, headerImage, displayMode: incomingMode } = config;
  const boundsRef = useRef<HTMLDivElement>(null);

  const contentMaxWidth = config.layout?.contentMaxWidth || "1200px";
  const displayMode = isMobile ? "always" : (incomingMode ?? "always");
  const isHoverMode = displayMode === "hoverReveal";
  const [expanded, setExpanded] = useState(displayMode === "always");
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [shouldRender, setShouldRender] = useState(displayMode === "always");
  const [isDragging, setIsDragging] = useState(false); // 跟踪是否正在拖拽

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
      <div className="w-full" data-testid="hero-section">
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
                transition: `all 400ms cubic-bezier(0.4, 0, 0.2, 1)`,
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
          <Rnd
            size={{ 
              width: headerImage?.width || 600, 
              height: headerImage?.height || 200,
            }}
            position={{ 
              x: headerImage?.x || 0, 
              y: headerImage?.y || 0 
            }}
            // 添加min和max尺寸限制，确保头图不会被过度压缩
            minWidth={300}
            minHeight={150}
            maxWidth={1200}
            maxHeight={450}
            bounds={boundsRef.current || undefined}
            draggable={canDrag}
            resizable={canDrag && !isMobile}
            enableResizing={canDrag && !isMobile}
            cancel=""
            enableUserSelectHack={false}
            allowAnyClick={true}
            style={{
              zIndex: headerImage?.zIndex || 1,
              cursor: canDrag ? (isHoverMode ? "pointer" : "grab") : "default",
              borderRadius: "12px",
              userSelect: "none",
              overflow: "visible",
              ...getSimpleFadeStyle(headerVisible, isDragging, true),
            }}
            onDragStart={handleDragStart}
            onDrag={(_, data) => {
              // 实时更新位置，确保拖拽流畅
              if (canDrag) {
                onHeaderDragEnd?.({
                  x: data.x,
                  y: data.y
                }, {
                  width: headerImage?.width || 600,
                  height: headerImage?.height || 200
                });
              }
            }}
            onDragStop={(_, data) => {
              if (canDrag) {
                onHeaderDragEnd?.({
                  x: data.x,
                  y: data.y
                }, {
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
                onHeaderDragEnd?.({
                  x: position.x,
                  y: position.y
                }, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight
                });
              }
            }}
            onResizeStop={(_event, _direction, ref, _delta, position) => {
              if (canDrag) {
                onHeaderDragEnd?.({ 
                  x: position.x,
                  y: position.y 
                }, {
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
              style={{ userSelect: "none", backdropFilter: headerImage?.src ? "none" : "blur(12px)" }}
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
