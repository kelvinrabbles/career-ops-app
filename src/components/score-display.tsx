import { cn } from "@/lib/utils";
import { getScoreColor, formatScore } from "@/lib/scoring";

export function ScoreDisplay({
  score,
  size = "default",
  className,
}: {
  score: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-sm",
    default: "text-base font-semibold",
    lg: "text-2xl font-bold",
  };

  return (
    <span className={cn(sizeClasses[size], getScoreColor(score), className)}>
      {formatScore(score)}
    </span>
  );
}
