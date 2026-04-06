"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  ClipboardCheck,
  FileText,
  Radar,
  UserCog,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  KanbanSquare,
  ClipboardCheck,
  FileText,
  Radar,
  UserCog,
} as const;

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" as const },
  { href: "/tracker", label: "Tracker", icon: "KanbanSquare" as const },
  { href: "/evaluate", label: "Evaluate", icon: "ClipboardCheck" as const },
  { href: "/cv", label: "CV Editor", icon: "FileText" as const },
  { href: "/scanner", label: "Scanner", icon: "Radar" as const },
  { href: "/profile", label: "Profile", icon: "UserCog" as const },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-[#1e1e2e]">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Briefcase className="h-5 w-5 text-[#89b4fa]" />
        <span className="text-lg font-semibold text-[#cdd6f4]">CareerOps</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = icons[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#313244] text-[#89b4fa]"
                  : "text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <p className="text-xs text-[#a6adc8]">
          Career Search Pipeline
        </p>
      </div>
    </aside>
  );
}
