import React from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  processing: { icon: Loader2, label: "Processing", className: "text-amber-600 bg-amber-50", spin: true },
  ready: { icon: CheckCircle2, label: "Ready", className: "text-emerald-600 bg-emerald-50" },
  error: { icon: XCircle, label: "Error", className: "text-red-600 bg-red-50" },
};

export default function VideoStatusList({ videos }) {
  if (!videos?.length) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Your Uploads
      </h2>
      <div className="space-y-3">
        {videos.map((video) => {
          const config = STATUS_CONFIG[video.status] || STATUS_CONFIG.processing;
          const Icon = config.icon;
          return (
            <Link
              key={video.id}
              to={`/watch/${video.id}`}
              className="flex items-center justify-between gap-4 border border-border rounded-xl p-4 bg-card hover:border-primary/40 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{video.title}</p>
                {video.description && (
                  <p className="text-sm text-muted-foreground truncate">{video.description}</p>
                )}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.className}`}>
                <Icon className={`w-3 h-3 ${config.spin ? "animate-spin" : ""}`} />
                {config.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}