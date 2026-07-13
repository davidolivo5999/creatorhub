import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileVideo, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import VideoStatusList from "@/components/upload/VideoStatusList";

export default function Upload() {
  const [checking, setChecking] = useState(true);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  const loadVideos = useCallback(async () => {
    const me = await base44.auth.me();
    const list = await base44.entities.Video.filter({ created_by_id: me.id }, "-created_date", 20);
    setVideos(list);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        if (me?.role !== "creator") {
          navigate("/", { replace: true });
          return;
        }
        await loadVideos();
      } finally {
        setChecking(false);
      }
    };
    load();
  }, [navigate, loadVideos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    setSubmitting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.functions.invoke("muxCreateUpload", { title, description, file_url });
      toast({ title: "Upload started", description: "Processing your video now." });
      setFile(null);
      setTitle("");
      setDescription("");
      e.target.reset?.();
      await loadVideos();
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight font-heading">Upload</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        <form onSubmit={handleSubmit} className="space-y-5">
          <label
            htmlFor="file"
            className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center text-center hover:border-primary/40 transition-colors cursor-pointer block"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              {file ? <FileVideo className="w-7 h-7 text-primary" /> : <UploadCloud className="w-7 h-7 text-primary" />}
            </div>
            <p className="text-sm font-medium">
              {file ? file.name : "Click to choose a video file"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">MP4, MOV, or other video formats</p>
            <Input
              id="file"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this video about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting || !file || !title}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload Video
              </>
            )}
          </Button>
        </form>

        <VideoStatusList videos={videos} />
      </main>
    </div>
  );
}