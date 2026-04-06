import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Interview: "bg-[#a6e3a1]/15 text-[#a6e3a1] border-[#a6e3a1]/30",
  Offer: "bg-[#a6e3a1]/15 text-[#a6e3a1] border-[#a6e3a1]/30",
  Applied: "bg-[#89dceb]/15 text-[#89dceb] border-[#89dceb]/30",
  Responded: "bg-[#89b4fa]/15 text-[#89b4fa] border-[#89b4fa]/30",
  Evaluated: "bg-[#cdd6f4]/10 text-[#cdd6f4] border-[#cdd6f4]/20",
  SKIP: "bg-[#f38ba8]/15 text-[#f38ba8] border-[#f38ba8]/30",
  Rejected: "bg-[#a6adc8]/10 text-[#a6adc8] border-[#a6adc8]/20",
  Discarded: "bg-[#a6adc8]/10 text-[#a6adc8] border-[#a6adc8]/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        STATUS_STYLES[status] ?? STATUS_STYLES.Evaluated,
        className
      )}
    >
      {status}
    </Badge>
  );
}
