import { type SiteConfig, type Song } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Anchor, Music2, Copy } from "lucide-react";

interface SongTableProps {
  config: SiteConfig;
  songs: Song[];
  isLoading?: boolean;
}

const LANGUAGE_LABELS: Record<Song["language"], string> = {
  Mandarin: "国语",
  Japanese: "日语",
  English: "英语",
  Other: "其他",
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: "rgba(0,0,0,0.05)" }}
      >
        <Music2 className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-foreground mb-1">暂无歌曲</p>
      <p className="text-sm text-muted-foreground">尝试调整筛选条件</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function SongTable({ config, songs, isLoading }: SongTableProps) {
  const { toast } = useToast();
  
  // Defensive defaults for copyConfig
  const copyConfig = config.copyConfig ?? {
    enabled: true,
    template: "点歌 {songName}",
    toastEnabled: true,
  };

  // Copy song name to clipboard
  const handleCopySong = async (songName: string) => {
    if (!copyConfig.enabled) return;

    const copyText = copyConfig.template.replace("{songName}", songName);
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyText);
      } else {
        // Fallback to execCommand
        const textArea = document.createElement("textarea");
        textArea.value = copyText;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      if (copyConfig.toastEnabled) {
        toast({
          title: "已复制",
          description: copyText,
        });
      }
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制歌名",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div 
        className="w-full rounded-2xl overflow-hidden"
        style={{ 
          maxWidth: config.layout.contentMaxWidth,
          background: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <LoadingSkeleton />
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div 
        className="w-full rounded-2xl overflow-hidden"
        style={{ 
          maxWidth: config.layout.contentMaxWidth,
          background: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      className="w-full rounded-2xl overflow-hidden"
      style={{ 
        maxWidth: config.layout.contentMaxWidth,
        background: "#FFFFFF",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
      data-testid="song-table"
    >
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <TableHead className="text-sm font-semibold text-foreground w-[35%]">歌曲名</TableHead>
              <TableHead className="text-sm font-semibold text-foreground w-[25%]">歌手</TableHead>
              <TableHead className="text-sm font-semibold text-foreground w-[15%]">语言</TableHead>
              <TableHead className="text-sm font-semibold text-foreground w-[20%]">备注</TableHead>
              <TableHead className="text-sm font-semibold text-foreground w-[5%] text-center">
                <Anchor className="w-4 h-4 inline-block" aria-label="舰长可点" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song, index) => (
              <TableRow 
                key={song.id}
                className="border-b transition-colors hover-elevate"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
                data-testid={`row-song-${song.id}`}
              >
                <TableCell className="py-4" data-testid={`text-songname-${song.id}`}>
                  <button
                    onClick={() => handleCopySong(song.songName)}
                    className="font-medium text-sm text-left group flex items-center gap-2 cursor-pointer transition-colors hover:text-primary"
                    disabled={!copyConfig.enabled}
                    data-testid={`button-copy-${song.id}`}
                  >
                    <span>{song.songName}</span>
                    {copyConfig.enabled && (
                      <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground py-4" data-testid={`text-singer-${song.id}`}>
                  {song.singer}
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="secondary" 
                    className="rounded-full text-xs"
                    data-testid={`badge-language-${song.id}`}
                  >
                    {LANGUAGE_LABELS[song.language]}
                    {song.language === "Mandarin" && song.pinyinInitial && (
                      <span className="ml-1 opacity-60">({song.pinyinInitial})</span>
                    )}
                  </Badge>
                </TableCell>
                <TableCell 
                  className="text-sm text-muted-foreground py-4"
                  data-testid={`text-remark-${song.id}`}
                >
                  {song.remark || "-"}
                </TableCell>
                <TableCell className="text-center py-4">
                  {song.captainRequestable && (
                    <Anchor 
                      className="w-4 h-4 inline-block text-primary" 
                      data-testid={`icon-captain-${song.id}`}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden p-3 space-y-3">
        {songs.map((song) => (
          <div
            key={song.id}
            className="p-4 rounded-xl border"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
            data-testid={`card-song-${song.id}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <button
                onClick={() => handleCopySong(song.songName)}
                className="font-semibold text-base text-foreground text-left flex items-center gap-2"
                disabled={!copyConfig.enabled}
                data-testid={`button-copy-mobile-${song.id}`}
              >
                <span>{song.songName}</span>
                {copyConfig.enabled && (
                  <Copy className="w-3.5 h-3.5 opacity-40" />
                )}
              </button>
              {song.captainRequestable && (
                <Anchor className="w-4 h-4 flex-shrink-0 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {song.singer}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="rounded-full text-xs">
                {LANGUAGE_LABELS[song.language]}
                {song.language === "Mandarin" && song.pinyinInitial && (
                  <span className="ml-1 opacity-60">({song.pinyinInitial})</span>
                )}
              </Badge>
              {song.remark && (
                <span className="text-xs text-muted-foreground">
                  {song.remark}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
