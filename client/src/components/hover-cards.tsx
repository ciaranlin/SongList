import { type SiteConfig, type Card as CardType } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { ExternalLink, Twitter, Youtube, Globe } from "lucide-react";
import { SiBilibili } from "react-icons/si";

interface HoverCardsProps {
  config: SiteConfig;
  isVisible: boolean;
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
      {/* Card Title */}
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

      {/* Card Body */}
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

      {/* Card Links */}
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

export function HoverCards({ config, isVisible }: HoverCardsProps) {
  const { cards, theme, hoverBehavior } = config;
  const textColor = theme.textColorMode === "auto" 
    ? getAutoTextColor(theme.background) 
    : theme.manualTextColor;

  if (cards.length === 0) return null;

  return (
    <div
      className="w-full px-6 pb-6 hover-card-container"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        "--hover-fade-in": `${hoverBehavior.fadeInDuration}ms`,
        "--hover-fade-out": `${hoverBehavior.fadeOutDuration}ms`,
        pointerEvents: isVisible ? "auto" : "none",
      } as React.CSSProperties}
      data-testid="hover-cards-container"
    >
      <div 
        className="flex flex-wrap justify-center gap-4"
        style={{ maxWidth: config.layout.contentMaxWidth, margin: "0 auto" }}
      >
        {cards.map((card) => (
          <div key={card.id} className="flex-shrink-0 w-full sm:w-auto sm:min-w-[280px] sm:max-w-[360px]">
            <HoverCard card={card} textColor={textColor} />
          </div>
        ))}
      </div>
    </div>
  );
}
