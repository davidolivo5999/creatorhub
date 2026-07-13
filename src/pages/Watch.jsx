import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactionButtons from "@/components/watch/ReactionButtons";
import CommentSection from "@/components/watch/CommentSection";
import SubscribeButton from "@/components/watch/SubscribeButton";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [me, vid] = await Promise.all([base44.auth.me(), base44.entities.Video.get(id)]);
      setUser(me);
      setVideo(vid);
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!video) return;
    const recordView = async () => {
      await base44.entities.Video.update(video.id, { view_count: (video.view_count || 0) + 1 });
      if (user) {
        await base44.entities.WatchHistory.create({
          user_id: user.id,
          video_id: video.id,
          category: video.category || "Other",
        });
      }
    };
    recordView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Video not found.</p>
      </div>
    );
  }

  const isCreatorOrAdmin = !!user && (user.id === video.created_by_id || user.role === "admin");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight font-heading truncate">{video.title}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="rounded-2xl overflow-hidden bg-black aspect-video">
          {video.playback_id ? (
            <mux-player
              playback-id={video.playback_id}
              style={{ width: "100%", height: "100%" }}
              metadata-video-title={video.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
              Video is still processing...
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold font-heading">{video.title}</h2>
          <div className="flex items-center justify-between mt-1">
            {video.creator_name && <p className="text-sm text-muted-foreground">{video.creator_name}</p>}
            <SubscribeButton user={user} creatorId={video.created_by_id} creatorName={video.creator_name} />
          </div>
          {video.description && <p className="text-sm mt-3 whitespace-pre-wrap">{video.description}</p>}
        </div>

        <ReactionButtons videoId={video.id} user={user} canSeeDislikes={isCreatorOrAdmin} />

        <CommentSection videoId={video.id} user={user} isCreatorOrAdmin={isCreatorOrAdmin} />
      </main>
    </div>
  );
}