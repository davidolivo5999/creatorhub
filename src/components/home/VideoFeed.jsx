import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import VideoCard from "@/components/home/VideoCard";

export default function VideoFeed({ user }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const readyVideos = await base44.entities.Video.filter({ status: "ready" }, "-created_date", 200);

      let subscriptions = [];
      let history = [];
      if (user) {
        [subscriptions, history] = await Promise.all([
          base44.entities.Subscription.filter({ subscriber_id: user.id }),
          base44.entities.WatchHistory.filter({ user_id: user.id }, "-created_date", 100),
        ]);
      }

      const creatorIds = new Set(subscriptions.map((s) => s.creator_id));
      const categories = new Set(history.map((h) => h.category).filter(Boolean));

      let feed;
      if (creatorIds.size === 0 && categories.size === 0) {
        feed = readyVideos.slice(0, 24);
      } else {
        const subscribed = readyVideos.filter((v) => creatorIds.has(v.created_by_id));
        const byCategory = readyVideos.filter((v) => categories.has(v.category) && !creatorIds.has(v.created_by_id));
        const seen = new Set();
        feed = [...subscribed, ...byCategory].filter((v) => {
          if (seen.has(v.id)) return false;
          seen.add(v.id);
          return true;
        });
      }

      setVideos(feed);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (videos.length === 0) {
    return <p className="text-sm text-muted-foreground">No videos to show yet.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}