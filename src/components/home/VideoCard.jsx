import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

export default function VideoCard({ video }) {
  const [hovering, setHovering] = useState(false);
  const thumbnailUrl = video.playback_id
    ? `https://image.mux.com/${video.playback_id}/thumbnail.jpg?width=640`
    : null;

  return (
    <Link
      to={`/watch/${video.id}`}
      className="group block"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 relative">
        {hovering && video.playback_id ? (
          <div className="w-full h-full pointer-events-none">
            <mux-player
              playback-id={video.playback_id}
              style={{ width: "100%", height: "100%" }}
              muted
              autoPlay
              loop
            />
          </div>
        ) : thumbnailUrl ? (
          <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No preview</div>
        )}
      </div>
      <div className="mt-2">
        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{video.title}</p>
        {video.creator_name && <p className="text-xs text-muted-foreground truncate">{video.creator_name}</p>}
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Eye className="w-3 h-3" />
          {video.view_count || 0} views
        </p>
      </div>
    </Link>
  );
}