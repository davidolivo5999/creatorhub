import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Upload, Eye, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VideoFeed from "@/components/home/VideoFeed";
import SearchBar from "@/components/search/SearchBar";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const isCreator = user?.role === "creator" || user?.role === "admin";
  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight font-heading">Dashboard</h1>
          <SearchBar className="flex-1 max-w-md mx-6 hidden sm:block" />
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-border hover:ring-primary/30 transition-all">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isCreator
              ? "Manage your content and uploads from here."
              : "Browse and discover content from creators."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isCreator && (
            <Link to="/upload" className="group">
              <div className="border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all bg-card">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold font-heading mb-1">Upload Content</h3>
                <p className="text-sm text-muted-foreground">Upload and manage your videos and media.</p>
              </div>
            </Link>
          )}

          <Link to="/profile" className="group">
            <div className="border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all bg-card">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold font-heading mb-1">Your Profile</h3>
              <p className="text-sm text-muted-foreground">View and edit your profile settings.</p>
            </div>
          </Link>

        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold tracking-tight font-heading mb-5">For You</h3>
          <VideoFeed user={user} />
        </div>

        {/* Role badge */}
        <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
            isCreator ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {isCreator ? <Upload className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {isCreator ? "Creator" : "Viewer"}
          </span>
          <span>·</span>
          <span>{user?.email}</span>
        </div>
      </main>
    </div>
  );
}