import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const POLL_INTERVAL_MS = 4000;

export default function LiveChatPanel({ videoId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const list = await base44.entities.ChatMessage.filter({ video_id: videoId }, "created_date", 200);
      if (!cancelled) setMessages(list);
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [videoId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      const newMessage = await base44.entities.ChatMessage.create({
        video_id: videoId,
        user_id: user.id,
        user_name: user.full_name || "Anonymous",
        text: text.trim(),
      });
      setMessages((prev) => [...prev, newMessage]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold font-heading text-sm">Live Chat</h3>
      </div>

      <div ref={scrollRef} className="h-64 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Say something!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium">{m.user_name || "Anonymous"}: </span>
              <span className="text-foreground/90">{m.text}</span>
            </div>
          ))
        )}
      </div>

      {user && (
        <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-border">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a message..."
            maxLength={200}
            className="h-9"
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={sending || !text.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}