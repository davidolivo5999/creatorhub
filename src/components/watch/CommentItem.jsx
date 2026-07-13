import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pin } from "lucide-react";

export default function CommentItem({ comment, allComments, videoId, user, isCreatorOrAdmin, onChanged }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const replies = allComments.filter((c) => c.parent_comment_id === comment.id);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    try {
      await base44.entities.Comment.create({
        video_id: videoId,
        user_id: user.id,
        user_name: user.full_name,
        text: replyText.trim(),
        parent_comment_id: comment.id,
      });
      setReplyText("");
      setReplying(false);
      await onChanged();
    } finally {
      setSubmitting(false);
    }
  };

  const togglePin = async () => {
    await base44.entities.Comment.update(comment.id, { pinned: !comment.pinned });
    await onChanged();
  };

  return (
    <div className="border-l-2 border-border pl-4">
      <p className="text-sm font-medium flex items-center gap-1.5">
        {comment.user_name || "User"}
        {comment.pinned && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
            <Pin className="w-3 h-3" /> Pinned
          </span>
        )}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">{comment.text}</p>

      <div className="flex items-center gap-3 mt-1">
        {user && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setReplying((r) => !r)}
          >
            Reply
          </button>
        )}
        {isCreatorOrAdmin && (
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={togglePin}>
            {comment.pinned ? "Unpin" : "Pin"}
          </button>
        )}
      </div>

      {replying && (
        <form onSubmit={handleReply} className="flex gap-2 mt-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="resize-none"
            placeholder="Write a reply..."
          />
          <Button type="submit" size="sm" disabled={submitting || !replyText.trim()}>
            Reply
          </Button>
        </form>
      )}

      {replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              videoId={videoId}
              user={user}
              isCreatorOrAdmin={isCreatorOrAdmin}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}