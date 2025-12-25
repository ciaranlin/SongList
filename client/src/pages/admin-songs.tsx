import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Song, type SiteConfig, type InsertSong, defaultConfig, defaultSongs, insertSongSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PasswordGate } from "@/components/password-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, Save, Plus, Trash2, Pencil, Music, 
  Anchor, Settings, ListMusic
} from "lucide-react";

const LANGUAGES = ["Mandarin", "Japanese", "English", "Other"] as const;
const LANGUAGE_LABELS: Record<typeof LANGUAGES[number], string> = {
  Mandarin: "国语",
  Japanese: "日语",
  English: "英语",
  Other: "其他",
};
const PINYIN_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AdminSongsPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [newSong, setNewSong] = useState<InsertSong>({
    songName: "",
    singer: "",
    language: "Mandarin",
    remark: "",
    captainRequestable: false,
    pinyinInitial: "",
  });
  const { toast } = useToast();

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch config for password
  const { data: config = defaultConfig } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  // Fetch songs
  const { data: savedSongs = defaultSongs, isLoading } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  // Initialize local songs state
  useEffect(() => {
    if (savedSongs) {
      setSongs(savedSongs);
    }
  }, [savedSongs]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (songsToSave: Song[]) => {
      return apiRequest("PUT", "/api/songs", songsToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "保存成功",
        description: "歌单已保存",
      });
    },
    onError: () => {
      toast({
        title: "保存失败",
        description: "保存歌单时出错",
        variant: "destructive",
      });
    },
  });

  // Add song
  const handleAddSong = () => {
    const id = `song-${Date.now()}`;
    const song: Song = {
      ...newSong,
      id,
      pinyinInitial: newSong.language === "Mandarin" ? newSong.pinyinInitial : undefined,
    };
    setSongs(prev => [...prev, song]);
    setNewSong({
      songName: "",
      singer: "",
      language: "Mandarin",
      remark: "",
      captainRequestable: false,
      pinyinInitial: "",
    });
    setIsAddDialogOpen(false);
    toast({
      title: "添加成功",
      description: "别忘了点击保存",
    });
  };

  // Update song
  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    setEditingSong(null);
    toast({
      title: "更新成功",
      description: "别忘了点击保存",
    });
  };

  // Delete song
  const handleDeleteSong = (songId: string) => {
    setSongs(prev => prev.filter(s => s.id !== songId));
    toast({
      title: "删除成功",
      description: "别忘了点击保存",
    });
  };

  // Check for unsaved changes
  const hasUnsavedChanges = JSON.stringify(songs) !== JSON.stringify(savedSongs);

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} correctPassword={config.adminPassword} />;
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: config.theme.background }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-20 border-b"
        style={{ 
          background: "rgba(255,255,255,0.7)", 
          backdropFilter: "blur(12px)",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <ListMusic className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <h1 className="text-base sm:text-xl font-semibold truncate">歌单管理</h1>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="rounded-full text-xs flex-shrink-0">
                未保存
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl" data-testid="link-home">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/config">
              <Button variant="ghost" size="icon" className="rounded-xl" data-testid="link-config">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="secondary"
              size={isMobileView ? "icon" : "default"}
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl gap-2"
              data-testid="button-add-song"
            >
              <Plus className="w-4 h-4" />
              {!isMobileView && "添加歌曲"}
            </Button>
            <Button 
              onClick={() => saveMutation.mutate(songs)}
              disabled={saveMutation.isPending || !hasUnsavedChanges}
              size={isMobileView ? "icon" : "default"}
              className="rounded-xl gap-2"
              data-testid="button-save-songs"
            >
              <Save className="w-4 h-4" />
              {!isMobileView && (saveMutation.isPending ? "保存中..." : "保存")}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div 
          className="rounded-2xl overflow-hidden"
          style={{ 
            background: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(0,0,0,0.05)" }}
              >
                <Music className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-1">暂无歌曲</p>
              <p className="text-muted-foreground mb-4">添加第一首歌曲开始</p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                添加歌曲
              </Button>
            </div>
          ) : isMobileView ? (
            // Mobile card view
            <div className="p-3 space-y-3">
              {songs.map((song) => (
                <div 
                  key={song.id}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  data-testid={`card-admin-song-${song.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base">{song.songName}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {song.captainRequestable && (
                        <Anchor className="w-4 h-4 text-primary" />
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingSong(song)}
                        className="rounded-lg h-8 w-8"
                        data-testid={`button-edit-${song.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteSong(song.id)}
                        className="rounded-lg text-destructive h-8 w-8"
                        data-testid={`button-delete-${song.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{song.singer}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {LANGUAGE_LABELS[song.language]}
                    </Badge>
                    {song.language === "Mandarin" && song.pinyinInitial && (
                      <Badge variant="outline" className="rounded-full text-xs">
                        {song.pinyinInitial}
                      </Badge>
                    )}
                    {song.remark && (
                      <span className="text-xs text-muted-foreground">{song.remark}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop table view
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <TableHead className="w-[30%]">歌曲名</TableHead>
                    <TableHead className="w-[20%]">歌手</TableHead>
                    <TableHead className="w-[12%]">语言</TableHead>
                    <TableHead className="w-[5%] text-center">首字母</TableHead>
                    <TableHead className="w-[18%]">备注</TableHead>
                    <TableHead className="w-[5%] text-center">
                      <Anchor className="w-4 h-4 inline-block" aria-label="舰长可点" />
                    </TableHead>
                    <TableHead className="w-[10%] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {songs.map((song) => (
                    <TableRow 
                      key={song.id}
                      className="hover-elevate"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                      data-testid={`row-admin-song-${song.id}`}
                    >
                      <TableCell className="font-medium">{song.songName}</TableCell>
                      <TableCell className="text-muted-foreground">{song.singer}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {LANGUAGE_LABELS[song.language]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {song.language === "Mandarin" ? (song.pinyinInitial || "-") : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{song.remark || "-"}</TableCell>
                      <TableCell className="text-center">
                        {song.captainRequestable && (
                          <Anchor className="w-4 h-4 inline-block text-primary" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingSong(song)}
                            className="rounded-lg"
                            data-testid={`button-edit-${song.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteSong(song.id)}
                            className="rounded-lg text-destructive"
                            data-testid={`button-delete-${song.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          共 {songs.length} 首歌曲
        </p>
      </div>

      {/* Add Song Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-2xl max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加歌曲</DialogTitle>
            <DialogDescription>
              填写歌曲信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm mb-2 block">歌曲名 *</Label>
              <Input
                value={newSong.songName}
                onChange={(e) => setNewSong(prev => ({ ...prev, songName: e.target.value }))}
                className="rounded-lg"
                placeholder="输入歌曲名"
                data-testid="input-new-song-name"
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">歌手 *</Label>
              <Input
                value={newSong.singer}
                onChange={(e) => setNewSong(prev => ({ ...prev, singer: e.target.value }))}
                className="rounded-lg"
                placeholder="输入歌手名"
                data-testid="input-new-singer"
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">语言 *</Label>
              <Select
                value={newSong.language}
                onValueChange={(value) => setNewSong(prev => ({ 
                  ...prev, 
                  language: value as typeof LANGUAGES[number],
                  pinyinInitial: value !== "Mandarin" ? "" : prev.pinyinInitial,
                }))}
              >
                <SelectTrigger className="rounded-lg" data-testid="select-new-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newSong.language === "Mandarin" && (
              <div>
                <Label className="text-sm mb-2 block">拼音首字母</Label>
                <Select
                  value={newSong.pinyinInitial || ""}
                  onValueChange={(value) => setNewSong(prev => ({ ...prev, pinyinInitial: value }))}
                >
                  <SelectTrigger className="rounded-lg" data-testid="select-new-pinyin">
                    <SelectValue placeholder="选择首字母" />
                  </SelectTrigger>
                  <SelectContent>
                    {PINYIN_INITIALS.map((initial) => (
                      <SelectItem key={initial} value={initial}>{initial}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-sm mb-2 block">备注</Label>
              <Input
                value={newSong.remark || ""}
                onChange={(e) => setNewSong(prev => ({ ...prev, remark: e.target.value }))}
                className="rounded-lg"
                placeholder="可选备注"
                data-testid="input-new-remark"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">舰长可点</Label>
              <Switch
                checked={newSong.captainRequestable}
                onCheckedChange={(checked) => setNewSong(prev => ({ ...prev, captainRequestable: checked }))}
                data-testid="switch-new-captain"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="secondary" 
              onClick={() => setIsAddDialogOpen(false)}
              className="rounded-lg"
            >
              取消
            </Button>
            <Button 
              onClick={handleAddSong}
              disabled={!newSong.songName || !newSong.singer}
              className="rounded-lg"
              data-testid="button-confirm-add"
            >
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Song Dialog */}
      <Dialog open={!!editingSong} onOpenChange={() => setEditingSong(null)}>
        <DialogContent className="rounded-2xl max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑歌曲</DialogTitle>
            <DialogDescription>
              修改歌曲信息
            </DialogDescription>
          </DialogHeader>
          {editingSong && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm mb-2 block">歌曲名 *</Label>
                <Input
                  value={editingSong.songName}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, songName: e.target.value } : null)}
                  className="rounded-lg"
                  data-testid="input-edit-song-name"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">歌手 *</Label>
                <Input
                  value={editingSong.singer}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, singer: e.target.value } : null)}
                  className="rounded-lg"
                  data-testid="input-edit-singer"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">语言 *</Label>
                <Select
                  value={editingSong.language}
                  onValueChange={(value) => setEditingSong(prev => prev ? { 
                    ...prev, 
                    language: value as typeof LANGUAGES[number],
                    pinyinInitial: value !== "Mandarin" ? undefined : prev.pinyinInitial,
                  } : null)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingSong.language === "Mandarin" && (
                <div>
                  <Label className="text-sm mb-2 block">拼音首字母</Label>
                  <Select
                    value={editingSong.pinyinInitial || ""}
                    onValueChange={(value) => setEditingSong(prev => prev ? { ...prev, pinyinInitial: value } : null)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="选择首字母" />
                    </SelectTrigger>
                    <SelectContent>
                      {PINYIN_INITIALS.map((initial) => (
                        <SelectItem key={initial} value={initial}>{initial}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-sm mb-2 block">备注</Label>
                <Input
                  value={editingSong.remark || ""}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, remark: e.target.value } : null)}
                  className="rounded-lg"
                  data-testid="input-edit-remark"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">舰长可点</Label>
                <Switch
                  checked={editingSong.captainRequestable}
                  onCheckedChange={(checked) => setEditingSong(prev => prev ? { ...prev, captainRequestable: checked } : null)}
                  data-testid="switch-edit-captain"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="secondary" 
              onClick={() => setEditingSong(null)}
              className="rounded-lg"
            >
              取消
            </Button>
            <Button 
              onClick={() => editingSong && handleUpdateSong(editingSong)}
              disabled={!editingSong?.songName || !editingSong?.singer}
              className="rounded-lg"
              data-testid="button-confirm-edit"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
