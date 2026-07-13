import React, { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

export default function ReactionButtons({ videoId, user, canSeeDislikes }) {
  const [reactions, setReactions] = useState([]);
  const [myReaction, setMyReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const list = await base44.entities.Reaction.filter({ video_id: videoId });
    setReactions(list);
    setMyReaction(user ? list.find((r) => r.user_id === user.id) || null : null);
  }, [videoId, user]);

  useEffect(() => {
    load();
  }, [load]);

  const likeCount = reactions.filter((r) => r.type === "like").length;
  const dislikeCount = reactions.filter((r) => r.type === "dislike").length;

  const handleReact = async (type) => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (myReaction && myReaction.type === type) {
        await base44.entities.Reaction.delete(myReaction.id);
      } else if (myReaction) {
        await base44.entities.Reaction.update(myReaction.id, { type });
      } else {
        await base44.entities.Reaction.create({ video_id: videoId, user_id: user.id, type });
      }
      await load();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/watch/${videoId}`;
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Video URL copied to clipboard." });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={myReaction?.type === "like" ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => handleReact("like")}
        disabled={loading}
      >
        <ThumbsUp className="w-4 h-4" />
        {likeCount}
      </Button>
      <Button
        variant={myReaction?.type === "dislike" ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => handleReact("dislike")}
        disabled={loading}
      >
        <ThumbsDown className="w-4 h-4" />
        {canSeeDislikes ? dislikeCount : ""}
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
}