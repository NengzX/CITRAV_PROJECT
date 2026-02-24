import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

interface FeedPostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

export function FeedPostCard({ post, onDelete }: FeedPostCardProps) {
  const navigate = useNavigate();
  const { userId } = getCurrentUser();
  const [zoomed, setZoomed] = useState(false);
  const isOwn = post.userId === userId;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const handleMessage = async () => {
    const conv = await api.post<{ id: string }>("/api/conversations", {
      userId1: userId,
      userId2: post.userId,
    });
    navigate(`/chat/${conv.id}`);
  };

  const handleDelete = async () => {
    await api.delete(`/api/posts/${post.id}?userId=${userId}`);
    onDelete?.(post.id);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4 transition-all hover:border-border/80">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <button onClick={() => navigate(`/profile/${post.userId}`)}>
          <Avatar nickname={post.profile.nickname} avatarColor={post.profile.avatarColor} />
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/profile/${post.userId}`)}
            className="font-semibold text-foreground hover:underline text-sm block truncate"
          >
            {post.profile.nickname}
          </button>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        {isOwn && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Image */}
      <div
        className="relative bg-black/20 cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <img
          src={post.imageUrl}
          alt={post.caption ?? "Post"}
          className="w-full max-h-96 object-contain"
          loading="lazy"
        />
      </div>

      {/* Caption + Actions */}
      <div className="p-4 pt-3">
        {post.caption && (
          <p className="text-sm text-foreground mb-3 leading-relaxed">{post.caption}</p>
        )}
        {!isOwn && (
          <button
            onClick={handleMessage}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <MessageCircle size={16} />
            Message
          </button>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={post.imageUrl}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
