import { useState } from "react";
import { AVATAR_COLORS, saveCurrentUser, getOrCreateUserId } from "@/lib/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [nickname, setNickname] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      const userId = getOrCreateUserId();
      await api.post("/api/profiles", {
        userId,
        nickname: nickname.trim(),
        avatarColor: color,
      });
      saveCurrentUser(nickname.trim(), color);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white transition-colors duration-200"
            style={{ backgroundColor: color }}
          >
            {nickname ? nickname[0].toUpperCase() : "?"}
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">Welcome</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Choose your display name to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your name</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={30}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary/60 placeholder:text-muted-foreground transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-3 block">Pick a color</label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-150",
                    color === c
                      ? "ring-2 ring-white ring-offset-2 ring-offset-surface scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!nickname.trim() || loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? "Setting up..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
