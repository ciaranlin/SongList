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
  onAreaResizeEnd?: (size: { width: number; height: number }) => void;
  onCardImageChange?: (cardId: string, updates: Partial<CardType["imageConfig"]>) => void;
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

function HoverCard({ card, textColor, isDragging, editable, onImageChange }: { card: CardType; textColor: string; isDragging?: boolean; editable?: boolean; onImageChange?: (updates: Partial<CardType["imageConfig"]>) => void }) {
  const imageDrag = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const heightDrag = useRef<{ y: number; height: number } | null>(null);
  const widthDrag = useRef<{ x: number; width: number } | null>(null);
  const imageConfig = card.imageConfig;
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  return (
    <div
      className="flex flex-col gap-3 w-full h-full"
      style={{
        padding: card.styles.padding,
        borderRadius: card.styles.borderRadius,
        background: card.styles.background,
        border: card.styles.border,
        boxShadow: card.styles.shadow,
        // 拖拽过程中禁用模糊效果，提高性能
        backdropFilter: isDragging ? "none" : "blur(12px)",
        WebkitBackdropFilter: isDragging ? "none" : "blur(12px)",
        boxSizing: "border-box",
        overflow: "auto",
      }}
      data-testid={`card-${card.id}`}
    >
      {card.image && (
        <div
          className={`relative w-full group/image ${editable ? "card-image-editor" : ""}`}
          style={{
            width: card.imageConfig?.boxWidth || '100%',
            maxWidth: '100%',
            alignSelf: 'center',
            height: card.imageConfig?.boxHeight || '128px',
            borderRadius: card.imageConfig?.borderRadius || '8px',
            padding: card.imageConfig?.padding || '0px',
            backgroundColor: card.imageConfig?.backgroundColor || 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            touchAction: editable ? 'none' : undefined,
            cursor: editable ? 'grab' : undefined,
          }}
          onPointerDown={(event) => {
            if (!editable) return;
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            imageDrag.current = { x: event.clientX, y: event.clientY, posX: imageConfig?.posX ?? 50, posY: imageConfig?.posY ?? 50 };
          }}
          onPointerMove={(event) => {
            if (!editable || !imageDrag.current) return;
            event.stopPropagation();
            const rect = event.currentTarget.getBoundingClientRect();
            onImageChange?.({
              posX: clamp(imageDrag.current.posX + ((event.clientX - imageDrag.current.x) / Math.max(rect.width, 1)) * 100, 0, 100),
              posY: clamp(imageDrag.current.posY + ((event.clientY - imageDrag.current.y) / Math.max(rect.height, 1)) * 100, 0, 100),
            });
          }}
          onPointerUp={(event) => {
            if (!editable) return;
            event.stopPropagation();
            imageDrag.current = null;
          }}
          onPointerCancel={() => { imageDrag.current = null; }}
          onWheel={(event) => {
            if (!editable) return;
            event.preventDefault();
            event.stopPropagation();
            onImageChange?.({ scale: clamp((imageConfig?.scale ?? 1) + (event.deltaY < 0 ? 0.05 : -0.05), 0.5, 2) });
          }}
          onDoubleClick={(event) => {
            if (!editable) return;
            event.stopPropagation();
            onImageChange?.({ posX: 50, posY: 50, scale: 1, fit: 'contain' });
          }}
        >
          <img 
            src={card.image} 
            alt={card.title} 
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              transform: `translate(${(card.imageConfig?.posX ?? 50) - 50}%, ${(card.imageConfig?.posY ?? 50) - 50}%) scale(${card.imageConfig?.scale ?? 1})`,
              transformOrigin: 'center',
              borderRadius: card.imageConfig?.borderRadius || '8px',
            }}
          />
          {editable && (
            <>
              <div className="absolute inset-x-0 top-2 text-center opacity-0 group-hover/image:opacity-100 pointer-events-none transition-opacity">
                <span className="text-[11px] px-2 py-1 rounded-full bg-black/60 text-white">拖动定位 · 滚轮缩放 · 双击复原</span>
              </div>
              <div
                className="absolute inset-x-0 bottom-0 h-3 cursor-ns-resize bg-primary/0 hover:bg-primary/25"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  heightDrag.current = { y: event.clientY, height: parseInt(imageConfig?.boxHeight || "128", 10) || 128 };
                }}
                onPointerMove={(event) => {
                  if (!heightDrag.current) return;
                  event.stopPropagation();
                  onImageChange?.({ boxHeight: `${clamp(heightDrag.current.height + event.clientY - heightDrag.current.y, 60, 400)}px` });
                }}
                onPointerUp={(event) => { event.stopPropagation(); heightDrag.current = null; }}
                onPointerCancel={() => { heightDrag.current = null; }}
                title="拖动调整图片高度"
              />
              <div
                className="absolute inset-y-0 right-0 w-3 cursor-ew-resize bg-primary/0 hover:bg-primary/25"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  widthDrag.current = { x: event.clientX, width: event.currentTarget.parentElement?.getBoundingClientRect().width || 160 };
                }}
                onPointerMove={(event) => {
                  if (!widthDrag.current) return;
                  event.stopPropagation();
                  onImageChange?.({ boxWidth: `${clamp(widthDrag.current.width + event.clientX - widthDrag.current.x, 80, 800)}px` });
                }}
                onPointerUp={(event) => { event.stopPropagation(); widthDrag.current = null; }}
                onPointerCancel={() => { widthDrag.current = null; }}
                title="拖动调整图片宽度"
              />
            </>
          )}
        </div>
      )}

      {card.title?.trim() && (
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
      )}

      {card.body?.trim() && (
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
function getSimpleFadeStyle(visible: boolean, isDragging: boolean, isHeader: boolean = false, customDurationMs?: number) {
  // 拖拽过程中禁用过渡效果，提高性能
  // 头图淡出时间较短（200ms），卡片淡入时间正常（400ms）
  const duration = `${customDurationMs ?? (isHeader ? 200 : 400)}ms`;
  return {
    transitionProperty: isDragging ? "none" : "opacity",
    transitionDuration: isDragging ? "0ms" : duration,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: visible ? 1 : 0,
    transform: "none", // 移除所有transform效果，只保留淡入淡出
    willChange: "opacity",
  } as CSSProperties;
}

type LayerAnimationEffect = "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scale" | "zoomOut" | "rotate" | "flip" | "blur";

function getLayerAnimationStyle(visible: boolean, effect: LayerAnimationEffect, durationMs: number, easing: string, isDragging: boolean) {
  const hiddenTransforms: Record<LayerAnimationEffect, string> = {
    fade: "none",
    slideUp: "translate3d(0, -28px, 0)",
    slideDown: "translate3d(0, 28px, 0)",
    slideLeft: "translate3d(-36px, 0, 0)",
    slideRight: "translate3d(36px, 0, 0)",
    scale: "scale(0.82)",
    zoomOut: "scale(1.16)",
    rotate: "rotate(-7deg) scale(0.9)",
    flip: "perspective(800px) rotateY(70deg)",
    blur: "scale(0.98)",
  };
  const hiddenTransform = hiddenTransforms[effect] ?? "none";
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0) scale(1)" : hiddenTransform,
    filter: !visible && effect === "blur" ? "blur(14px)" : "blur(0px)",
    transformOrigin: effect === "flip" ? "center" : undefined,
    transition: isDragging ? "none" : `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}, filter ${durationMs}ms ${easing}`,
    willChange: "opacity, transform, filter",
    backfaceVisibility: "hidden",
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

export function HeroSection({ config, isMobile, onCardDragEnd, onHeaderDragEnd, canDrag = false, onAreaResizeEnd, onCardImageChange }: HeroSectionProps) {
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
  const isDraggingRef = useRef(false);
  const [layerActive, setLayerActive] = useState(false);
  const layerHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layerAnimation = config.layerAnimation ?? { enabled: false, triggerLayer: 1, targetLayer: 2, effect: "fade" as const, durationMs: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };

  // Update container width for layout calculations
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const updateContainerWidth = () => setContainerWidth(element.clientWidth);
    updateContainerWidth();
    const observer = new ResizeObserver(updateContainerWidth);
    observer.observe(element);
    return () => observer.disconnect();
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
    isDraggingRef.current = true;
    setIsDragging(true);
    setLayerActive(true);
  }, []);

  // 拖拽结束后恢复过渡效果
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

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
  const legacyCardsVisible = displayMode === "always" ? true : expanded;
  const legacyHeaderVisible = displayMode === "always" ? true : !expanded;
  const cardsVisible = layerAnimation.enabled ? layerActive : legacyCardsVisible;
  const headerVisible = layerAnimation.enabled ? !layerActive : legacyHeaderVisible;
  const activateLayer = () => {
    if (layerHideTimer.current) clearTimeout(layerHideTimer.current);
    setLayerActive(true);
  };
  const scheduleLayerHide = () => {
    if (isDraggingRef.current) return;
    if (layerHideTimer.current) clearTimeout(layerHideTimer.current);
    layerHideTimer.current = setTimeout(() => {
      if (!isDraggingRef.current) setLayerActive(false);
    }, 80);
  };
  const layerTriggerProps = layerAnimation.enabled ? {
    onMouseEnter: activateLayer,
    onMouseLeave: scheduleLayerHide,
    onFocus: activateLayer,
    onBlur: scheduleLayerHide,
  } : {};

  useEffect(() => () => {
    if (layerHideTimer.current) clearTimeout(layerHideTimer.current);
  }, []);

  // banner区域固定高度，设置为固定值，确保筛选区不会向上移动
  const bannerHeight = config.layout?.functionalAreaHeight ?? 450;
  const functionalAreaWidth = config.layout?.functionalAreaWidth ?? 1200;

  const commitAreaSize = useCallback(() => {
    if (!canDrag || !boundsRef.current || !onAreaResizeEnd) return;
    onAreaResizeEnd({
      width: Math.round(boundsRef.current.getBoundingClientRect().width),
      height: Math.round(boundsRef.current.getBoundingClientRect().height),
    });
  }, [canDrag, onAreaResizeEnd]);

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
        className="flex justify-center"
        style={{
          width: "100%",
          maxWidth: canDrag ? "none" : contentMaxWidth,
          boxSizing: "border-box",
        }}
      >
        <div
          ref={boundsRef}
          className="relative"
          data-testid="hero-section"
          style={{
            width: `${functionalAreaWidth}px`,
            maxWidth: canDrag ? "none" : "100%",
            height: `${bannerHeight}px`,
            position: "relative",
            background: theme.background,
            padding: 0,
            maxHeight: canDrag ? "1400px" : `${bannerHeight}px`,
            minWidth: canDrag ? "240px" : undefined,
            minHeight: canDrag ? "280px" : `${bannerHeight}px`,
            resize: canDrag ? "both" : "none",
            overflow: "hidden",
            outline: canDrag ? "2px dashed rgba(37, 99, 235, 0.45)" : undefined,
            outlineOffset: canDrag ? "-2px" : undefined,
          }}
          onPointerUp={commitAreaSize}
          onMouseEnter={layerAnimation.enabled ? undefined : handleHeaderEnter}
          onMouseLeave={layerAnimation.enabled ? undefined : handleHeaderLeave}
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
            disableDragging={!canDrag}
            enableResizing={canDrag && !isMobile}
            cancel=""
            enableUserSelectHack={true}
            allowAnyClick={true}
            style={{
              zIndex: layerAnimation.enabled && layerActive ? 1000 : (headerImage?.zIndex || 1),
              cursor: canDrag ? "grab" : "default",
              borderRadius: "12px",
              userSelect: "none",
              overflow: "visible",
            }}
            {...layerTriggerProps}
            onDragStart={handleDragStart}
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
            <div
              className="relative w-full h-full"
              style={layerAnimation.enabled
                ? getLayerAnimationStyle(headerVisible, layerAnimation.effect, layerAnimation.durationMs, layerAnimation.easing, isDragging)
                : getSimpleFadeStyle(headerVisible, isDragging, true)}
            >
            {headerImage?.src && (
              <img 
                src={headerImage.src} 
                alt="Banner 头图" 
                className="w-full h-full object-contain absolute inset-0"
                draggable={false}
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
                    <img src={banner.avatar} alt="头像" className="w-full h-full object-cover" draggable={false} data-testid="img-avatar" />
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
            </div>
          </Rnd>

          {cards.length > 0 && (shouldRender || displayMode === "always") && cards.map((card) => {
    const visible = cardsVisible && (card.visible ?? true);
    return (
      <Rnd
        key={card.id}
        size={{ width: card.width || 280, height: card.height || 200 }}
        position={{ x: card.x || 0, y: card.y || 0 }}
        bounds="parent"
        disableDragging={!canDrag}
        enableResizing={canDrag && !isMobile}
        minWidth={80}
        minHeight={60}
        resizeHandleStyles={canDrag ? {
          top: { height: "8px", top: "-4px" },
          right: { width: "8px", right: "-4px" },
          bottom: { height: "8px", bottom: "-4px" },
          left: { width: "8px", left: "-4px" },
          topRight: { width: "14px", height: "14px", right: "-7px", top: "-7px" },
          bottomRight: { width: "14px", height: "14px", right: "-7px", bottom: "-7px", borderRight: "2px solid rgba(37,99,235,.8)", borderBottom: "2px solid rgba(37,99,235,.8)" },
          bottomLeft: { width: "14px", height: "14px", left: "-7px", bottom: "-7px" },
          topLeft: { width: "14px", height: "14px", left: "-7px", top: "-7px" },
        } : undefined}
        cancel=".card-image-editor"
        enableUserSelectHack={true}
        allowAnyClick={true}
        style={{
          zIndex: card.zIndex || 10,
          cursor: canDrag ? "grab" : "default",
          userSelect: "none",
          pointerEvents: visible ? "auto" : "none",
          overflow: "visible",
        }}
        onDragStart={handleDragStart}
        onDragStop={(_, data) => {
          if (canDrag) {
            onCardDragEnd?.(card.id, { x: data.x, y: data.y }, { width: card.width || 280, height: card.height || 200 });
          }
          handleDragEnd();
        }}
        onResizeStart={handleDragStart}
        onResizeStop={(_event, _direction, ref, _delta, position) => {
          if (canDrag) {
            const newWidth = ref.offsetWidth;
            const newHeight = ref.offsetHeight;
            onCardDragEnd?.(card.id, { x: position.x, y: position.y }, { width: newWidth, height: newHeight });
          }
          handleDragEnd();
        }}
              >
                <div
                  className="w-full h-full"
                  style={getSimpleFadeStyle(visible, isDragging, false, layerAnimation.enabled ? Math.min(Math.max(layerAnimation.durationMs * 0.65, 180), 280) : undefined)}
                >
                  <HoverCard card={card} textColor={textColor} isDragging={isDragging} editable={canDrag} onImageChange={(updates) => onCardImageChange?.(card.id, updates)} />
                </div>
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
