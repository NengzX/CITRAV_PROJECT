import { Message } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { userId } = getCurrentUser();
  const isOwn = message.senderId === userId;
  const [playing, setPlaying] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioToggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = () => setPlaying(false);
    }
  }, []);

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

  return (
    <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isOwn
              ? "bg-primary text-white rounded-br-sm"
              : "bg-surface border border-border text-foreground rounded-bl-sm"
          )}
        >
          {message.type === "text" && (
            <p className="leading-relaxed">{message.text}</p>
          )}

          {message.type === "image" && message.mediaUrl && (
            <div>
              <img
                src={message.mediaUrl}
                alt="Image"
                className="rounded-xl max-w-full cursor-zoom-in"
                style={{ maxHeight: 240 }}
                onClick={() => setZoomed(true)}
              />
              {zoomed && (
                <div
                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                  onClick={() => setZoomed(false)}
                >
                  <img
                    src={message.mediaUrl}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {message.type === "audio" && message.mediaUrl && (
            <div className="flex items-center gap-3 min-w-[160px]">
              <button
                onClick={handleAudioToggle}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  isOwn
                    ? "bg-white/20 hover:bg-white/30"
                    : "bg-primary/20 hover:bg-primary/30"
                )}
              >
                {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <div className="flex-1">
                <div className={cn("h-1 rounded-full", isOwn ? "bg-white/30" : "bg-border")}>
                  <div className="h-full w-0 bg-primary rounded-full" />
                </div>
                {message.durationMs && (
                  <p className={cn("text-xs mt-1", isOwn ? "text-white/60" : "text-muted-foreground")}>
                    {Math.round(message.durationMs / 1000)}s
                  </p>
                )}
              </div>
              <audio ref={audioRef} src={message.mediaUrl} />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">{timeAgo}</p>
      </div>
    </div>
  );
}
