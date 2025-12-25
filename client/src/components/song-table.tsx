import { type SiteConfig, type Song } from "@shared/schema";
import { getAutoTextColor } from "@/lib/config-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Anchor, Music2 } from "lucide-react";

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
                <TableCell className="font-medium text-sm py-4" data-testid={`text-songname-${song.id}`}>
                  {song.songName}
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
              <h3 className="font-semibold text-base text-foreground">
                {song.songName}
              </h3>
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
