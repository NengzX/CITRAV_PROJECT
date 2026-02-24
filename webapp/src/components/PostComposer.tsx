import { useState, useRef } from "react";
import { ImagePlus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "./Avatar";
import { compressImage } from "@/lib/imageUtils";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Post } from "@/types";

interface PostComposerProps {
  onPost: (post: Post) => void;
}

export function PostComposer({ onPost }: PostComposerProps) {
  const user = getCurrentUser();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setProgress(30);
    const compressed = await compressImage(file, 300);
    setProgress(80);
    setImage(compressed);
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const post = await api.post<Post>("/api/posts", {
        userId: user.userId,
        imageUrl: image,
        caption: caption.trim() || undefined,
      });
      onPost(post);
      setImage(null);
      setCaption("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
      <div className="flex gap-3">
        <Avatar nickname={user.nickname} avatarColor={user.avatarColor} />
        <div className="flex-1 min-w-0">
          {image ? (
            <div className="relative mb-3">
              <img
                src={image}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-xl bg-black/20"
              />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors mb-3"
            >
              <ImagePlus size={24} />
              <span className="text-sm">Add photo</span>
            </button>
          )}

          {progress > 0 && (
            <div className="h-1 bg-border rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <Textarea
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="resize-none bg-transparent border-border text-sm mb-3 min-h-[60px] text-foreground placeholder:text-muted-foreground"
            maxLength={500}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!image || loading}
              size="sm"
              className="gap-2"
            >
              <Send size={14} />
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
