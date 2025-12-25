import { type SiteConfig, type Song } from "@shared/schema";
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: "rgba(0,0,0,0.05)" }}
      >
        <Music2 className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-foreground mb-1">No songs found</p>
      <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
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
      <Table>
        <TableHeader>
          <TableRow className="border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <TableHead className="text-sm font-semibold text-foreground w-[35%]">Song Name</TableHead>
            <TableHead className="text-sm font-semibold text-foreground w-[25%]">Singer</TableHead>
            <TableHead className="text-sm font-semibold text-foreground w-[15%]">Language</TableHead>
            <TableHead className="text-sm font-semibold text-foreground w-[20%]">Remark</TableHead>
            <TableHead className="text-sm font-semibold text-foreground w-[5%] text-center">
              <Anchor className="w-4 h-4 inline-block" title="Captain Requestable" />
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
                  {song.language}
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
  );
}
