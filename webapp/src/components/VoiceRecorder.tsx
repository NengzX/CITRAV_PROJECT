import { useState, useRef } from "react";
import { Mic, Square, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSend: (audioDataUrl: string, durationMs: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const elapsed = Date.now() - startTimeRef.current;
      setDurationMs(elapsed);
      const reader = new FileReader();
      reader.onload = (e) => setAudioUrl(e.target!.result as string);
      reader.readAsDataURL(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    mr.start();
    setRecording(true);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSend = () => {
    if (audioUrl) onSend(audioUrl, durationMs);
  };

  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3">
      {!audioUrl ? (
        <>
          <div
            className={cn(
              "w-3 h-3 rounded-full flex-shrink-0",
              recording ? "bg-red-500 animate-pulse" : "bg-muted"
            )}
          />
          <span className="text-sm text-foreground flex-1">
            {recording ? `Recording... ${duration}s` : "Tap mic to record"}
          </span>
          {recording ? (
            <button
              onClick={stopRecording}
              className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              <Mic size={16} />
            </button>
          )}
        </>
      ) : (
        <>
          <audio src={audioUrl} controls className="flex-1 h-8" />
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors"
          >
            <Send size={16} />
          </button>
          <button
            onClick={() => {
              setAudioUrl(null);
              setDuration(0);
            }}
            className="p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </>
      )}
      <button
        onClick={onCancel}
        className="p-2 rounded-full hover:bg-white/5 text-muted-foreground ml-auto transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
