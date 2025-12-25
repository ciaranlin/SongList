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
const PINYIN_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AdminSongsPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSong, setNewSong] = useState<InsertSong>({
    songName: "",
    singer: "",
    language: "Mandarin",
    remark: "",
    captainRequestable: false,
    pinyinInitial: "",
  });
  const { toast } = useToast();

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
        title: "Songs saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to save",
        description: "There was an error saving the songs.",
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
      title: "Song added",
      description: "Don't forget to save your changes.",
    });
  };

  // Update song
  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    setEditingSong(null);
    toast({
      title: "Song updated",
      description: "Don't forget to save your changes.",
    });
  };

  // Delete song
  const handleDeleteSong = (songId: string) => {
    setSongs(prev => prev.filter(s => s.id !== songId));
    toast({
      title: "Song deleted",
      description: "Don't forget to save your changes.",
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ListMusic className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Song Manager</h1>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="rounded-full">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl gap-2"
              data-testid="button-add-song"
            >
              <Plus className="w-4 h-4" />
              Add Song
            </Button>
            <Button 
              onClick={() => saveMutation.mutate(songs)}
              disabled={saveMutation.isPending || !hasUnsavedChanges}
              className="rounded-xl gap-2"
              data-testid="button-save-songs"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
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
              <p className="text-muted-foreground">Loading songs...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="p-16 text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(0,0,0,0.05)" }}
              >
                <Music className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-1">No songs yet</p>
              <p className="text-muted-foreground mb-4">Add your first song to get started</p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Song
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <TableHead className="w-[30%]">Song Name</TableHead>
                  <TableHead className="w-[20%]">Singer</TableHead>
                  <TableHead className="w-[12%]">Language</TableHead>
                  <TableHead className="w-[5%] text-center">Initial</TableHead>
                  <TableHead className="w-[18%]">Remark</TableHead>
                  <TableHead className="w-[5%] text-center">
                    <Anchor className="w-4 h-4 inline-block" title="Captain" />
                  </TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
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
                        {song.language}
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
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {songs.length} song{songs.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Add Song Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Song</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new song to the list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm mb-2 block">Song Name *</Label>
              <Input
                value={newSong.songName}
                onChange={(e) => setNewSong(prev => ({ ...prev, songName: e.target.value }))}
                className="rounded-lg"
                placeholder="Enter song name"
                data-testid="input-new-song-name"
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Singer *</Label>
              <Input
                value={newSong.singer}
                onChange={(e) => setNewSong(prev => ({ ...prev, singer: e.target.value }))}
                className="rounded-lg"
                placeholder="Enter singer name"
                data-testid="input-new-singer"
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Language *</Label>
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
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newSong.language === "Mandarin" && (
              <div>
                <Label className="text-sm mb-2 block">Pinyin Initial</Label>
                <Select
                  value={newSong.pinyinInitial || ""}
                  onValueChange={(value) => setNewSong(prev => ({ ...prev, pinyinInitial: value }))}
                >
                  <SelectTrigger className="rounded-lg" data-testid="select-new-pinyin">
                    <SelectValue placeholder="Select initial" />
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
              <Label className="text-sm mb-2 block">Remark</Label>
              <Input
                value={newSong.remark || ""}
                onChange={(e) => setNewSong(prev => ({ ...prev, remark: e.target.value }))}
                className="rounded-lg"
                placeholder="Optional notes"
                data-testid="input-new-remark"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Captain Requestable</Label>
              <Switch
                checked={newSong.captainRequestable}
                onCheckedChange={(checked) => setNewSong(prev => ({ ...prev, captainRequestable: checked }))}
                data-testid="switch-new-captain"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => setIsAddDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSong}
              disabled={!newSong.songName || !newSong.singer}
              className="rounded-lg"
              data-testid="button-confirm-add"
            >
              Add Song
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Song Dialog */}
      <Dialog open={!!editingSong} onOpenChange={() => setEditingSong(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Song</DialogTitle>
            <DialogDescription>
              Update the song details below.
            </DialogDescription>
          </DialogHeader>
          {editingSong && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm mb-2 block">Song Name *</Label>
                <Input
                  value={editingSong.songName}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, songName: e.target.value } : null)}
                  className="rounded-lg"
                  data-testid="input-edit-song-name"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Singer *</Label>
                <Input
                  value={editingSong.singer}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, singer: e.target.value } : null)}
                  className="rounded-lg"
                  data-testid="input-edit-singer"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Language *</Label>
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
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingSong.language === "Mandarin" && (
                <div>
                  <Label className="text-sm mb-2 block">Pinyin Initial</Label>
                  <Select
                    value={editingSong.pinyinInitial || ""}
                    onValueChange={(value) => setEditingSong(prev => prev ? { ...prev, pinyinInitial: value } : null)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select initial" />
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
                <Label className="text-sm mb-2 block">Remark</Label>
                <Input
                  value={editingSong.remark || ""}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, remark: e.target.value } : null)}
                  className="rounded-lg"
                  data-testid="input-edit-remark"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Captain Requestable</Label>
                <Switch
                  checked={editingSong.captainRequestable}
                  onCheckedChange={(checked) => setEditingSong(prev => prev ? { ...prev, captainRequestable: checked } : null)}
                  data-testid="switch-edit-captain"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => setEditingSong(null)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => editingSong && handleUpdateSong(editingSong)}
              disabled={!editingSong?.songName || !editingSong?.singer}
              className="rounded-lg"
              data-testid="button-confirm-edit"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
