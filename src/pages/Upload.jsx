import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { Upload as UploadIcon, ArrowLeft, FileVideo, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Upload() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        if (me?.role !== "creator") {
          navigate("/", { replace: true });
          return;
        }
        setUser(me);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight font-heading">Upload</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="border-2 border-dashed border-border rounded-2xl p-16 flex flex-col items-center text-center hover:border-primary/40 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <FileVideo className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold font-heading mb-2">Upload your content</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">
            Drag and drop your files here, or click below to browse. Upload functionality will be expanded soon.
          </p>
          <Button size="lg" className="gap-2">
            <UploadIcon className="w-4 h-4" />
            Choose Files
          </Button>
        </div>
      </main>
    </div>
  );
}