import { cn } from "@/lib/utils";

interface AvatarProps {
  nickname: string;
  avatarColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function Avatar({ nickname, avatarColor, size = "md", className }: AvatarProps) {
  const initial = (nickname || "?")[0].toUpperCase();
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        sizes[size],
        className
      )}
      style={{ backgroundColor: avatarColor }}
    >
      {initial}
    </div>
  );
}
