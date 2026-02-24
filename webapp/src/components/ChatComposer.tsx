import { useState, useRef } from "react";
import { Send, ImagePlus, Mic, X } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { compressImage } from "@/lib/imageUtils";

interface ChatComposerProps {
  onSendText: (text: string) => void;
  onSendImage: (dataUrl: string) => void;
  onSendAudio: (dataUrl: string, durationMs: number) => void;
  disabled?: boolean;
}

export function ChatComposer({
  onSendText,
  onSendImage,
  onSendAudio,
  disabled,
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const [showVoice, setShowVoice] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSendText = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
  };

  const handleFile = async (file: File) => {
    const compressed = await compressImage(file, 200);
    setImagePreview(compressed);
  };

  const handleSendImage = () => {
    if (!imagePreview) return;
    onSendImage(imagePreview);
    setImagePreview(null);
  };

  const handleVoiceSend = (dataUrl: string, durationMs: number) => {
    onSendAudio(dataUrl, durationMs);
    setShowVoice(false);
  };

  if (showVoice) {
    return <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setShowVoice(false)} />;
  }

  if (imagePreview) {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-h-48 object-contain rounded-xl bg-black/20"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
        <button
          onClick={handleSendImage}
          className="w-full py-2 bg-primary text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/80 transition-colors"
        >
          <Send size={14} /> Send Image
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => fileRef.current?.click()}
        className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary flex-shrink-0 transition-colors"
        disabled={disabled}
      >
        <ImagePlus size={20} />
      </button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
          }
        }}
        placeholder="Message..."
        className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-colors"
        disabled={disabled}
      />
      {text.trim() ? (
        <button
          onClick={handleSendText}
          disabled={disabled}
          className="p-2 rounded-full bg-primary text-white hover:bg-primary/80 flex-shrink-0 transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      ) : (
        <button
          onClick={() => setShowVoice(true)}
          disabled={disabled}
          className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary flex-shrink-0 transition-colors"
        >
          <Mic size={20} />
        </button>
      )}
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
