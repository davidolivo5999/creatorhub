import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setChannelName(me?.channel_name || "");
        setAvatar(me?.avatar || "");
        setBio(me?.bio || "");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isCreator = user?.role === "creator" || user?.role === "admin";
  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatar(file_url);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ channel_name: channelName, avatar, bio });
      toast({ title: "Profile updated" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold tracking-tight font-heading">Profile</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <Avatar className="w-24 h-24 ring-4 ring-border">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-2xl font-medium">{initials}</AvatarFallback>
            </Avatar>
            {isCreator && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>
          <h2 className="text-xl font-semibold mt-4 font-heading">{user?.full_name || "User"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            isCreator ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {isCreator ? "Creator" : "Viewer"}
          </span>
        </div>

        {/* Creator-only fields */}
        {isCreator && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="channel_name">Channel Name</Label>
              <Input
                id="channel_name"
                placeholder="My Awesome Channel"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell viewers about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full h-12 font-medium">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}