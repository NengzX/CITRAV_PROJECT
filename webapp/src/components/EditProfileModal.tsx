import { useState } from "react";
import { Check, X } from "lucide-react";
import { AVATAR_COLORS, getCurrentUser, saveCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface EditProfileModalProps {
  onClose: () => void;
  onSave: (nickname: string, avatarColor: string) => void;
}

export function EditProfileModal({ onClose, onSave }: EditProfileModalProps) {
  const user = getCurrentUser();
  const [nickname, setNickname] = useState(user.nickname);
  const [color, setColor] = useState(user.avatarColor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.patch(`/api/profiles/${user.userId}`, {
        nickname: nickname.trim(),
        avatarColor: color,
      });
      saveCurrentUser(nickname.trim(), color);
      onSave(nickname.trim(), color);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground font-display">Edit Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white transition-colors duration-200"
            style={{ backgroundColor: color }}
          >
            {nickname ? nickname[0].toUpperCase() : "?"}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Display Name</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={30}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary/60 placeholder:text-muted-foreground transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Avatar Color</label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-9 h-9 rounded-full transition-all duration-150",
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-surface scale-110" : "hover:scale-105 opacity-70 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!nickname.trim() || loading}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={14} />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
