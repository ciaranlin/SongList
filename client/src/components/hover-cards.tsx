import { useState, useEffect } from "react";
import { type SiteConfig, type Card as CardType } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { ExternalLink, Twitter, Youtube, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { SiBilibili } from "react-icons/si";
import { Button } from "@/components/ui/button";

interface HoverCardsProps {
  config: SiteConfig;
  isVisible: boolean;
  isMobile?: boolean;
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

function getAnimationStyles(
  animationType: string, 
  isVisible: boolean, 
  durationMs: number
): React.CSSProperties {
  const baseTransition = `all ${durationMs}ms ease-out`;
  
  switch (animationType) {
    case "none":
      return {
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
      };
    case "fade":
      return {
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transition: baseTransition,
      };
    case "slide":
      return {
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transform: isVisible ? "translateY(0)" : "translateY(-20px)",
        transition: baseTransition,
      };
    case "scale":
      return {
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transform: isVisible ? "scale(1)" : "scale(0.95)",
        transition: baseTransition,
      };
    case "fadeSlide":
      return {
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transform: isVisible ? "translateY(0)" : "translateY(-16px)",
        transition: baseTransition,
      };
    default:
      return {
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transition: baseTransition,
      };
  }
}

export function HoverCards({ config, isVisible, isMobile = false }: HoverCardsProps) {
  const { cards, theme } = config;
  const [clickExpanded, setClickExpanded] = useState(false);
  
  // Defensive defaults for cardAnimation
  const cardAnimation = config.cardAnimation ?? {
    type: "fade" as const,
    durationMs: 200,
    delayMs: 0,
    trigger: "hover" as const,
    mobileTrigger: "always" as const,
  };
  
  const textColor = theme.textColorMode === "auto" 
    ? getAutoTextColor(theme.background) 
    : theme.manualTextColor;

  if (cards.length === 0) return null;

  // Determine if cards should be shown based on trigger mode
  const trigger = isMobile ? cardAnimation.mobileTrigger : cardAnimation.trigger;
  
  let shouldShow = false;
  if (trigger === "always") {
    shouldShow = true;
  } else if (trigger === "click") {
    shouldShow = clickExpanded;
  } else {
    shouldShow = isVisible;
  }

  const animationStyles = getAnimationStyles(
    cardAnimation.type,
    shouldShow,
    cardAnimation.durationMs
  );

  // For click trigger on mobile, show toggle button
  if (isMobile && trigger === "click") {
    return (
      <div className="w-full px-4 pb-4">
        <Button
          variant="secondary"
          size="default"
          onClick={() => setClickExpanded(!clickExpanded)}
          className="w-full rounded-xl vtuber-glass border-0 gap-2"
          data-testid="button-toggle-cards"
        >
          {clickExpanded ? (
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
          className="w-full mt-4"
          style={{
            ...animationStyles,
            pointerEvents: shouldShow ? "auto" : "none",
            transitionDelay: `${cardAnimation.delayMs}ms`,
          }}
          data-testid="hover-cards-container"
        >
          <div className="flex flex-col gap-4">
            {cards.map((card) => (
              <HoverCard key={card.id} card={card} textColor={textColor} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full px-4 sm:px-6 pb-4 sm:pb-6"
      style={{
        ...animationStyles,
        pointerEvents: shouldShow ? "auto" : "none",
        transitionDelay: `${cardAnimation.delayMs}ms`,
      }}
      data-testid="hover-cards-container"
    >
      <div 
        className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-4"
        style={{ maxWidth: config.layout.contentMaxWidth, margin: "0 auto" }}
      >
        {cards.map((card) => (
          <div key={card.id} className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-[360px]">
            <HoverCard card={card} textColor={textColor} />
          </div>
        ))}
      </div>
    </div>
  );
}
