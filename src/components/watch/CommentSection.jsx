import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import CommentItem from "@/components/watch/CommentItem";

export default function CommentSection({ videoId, user, isCreatorOrAdmin }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const list = await base44.entities.Comment.filter({ video_id: videoId }, "-created_date", 200);
    setComments(list);
  }, [videoId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSubmitting(true);
    try {
      await base44.entities.Comment.create({
        video_id: videoId,
        user_id: user.id,
        user_name: user.full_name,
        text: text.trim(),
      });
      setText("");
      await load();
    } catch (err) {
      toast({ title: "Couldn't post comment", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const topLevel = comments
    .filter((c) => !c.parent_comment_id)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Comments ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <Textarea
          placeholder={user ? "Add a comment..." : "Log in to comment"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="resize-none"
          disabled={!user}
        />
        <Button type="submit" disabled={submitting || !text.trim() || !user}>
          Post
        </Button>
      </form>

      <div className="space-y-4">
        {topLevel.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            allComments={comments}
            videoId={videoId}
            user={user}
            isCreatorOrAdmin={isCreatorOrAdmin}
            onChanged={load}
          />
        ))}
        {topLevel.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
        )}
      </div>
    </div>
  );
}