export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TRACKER_TABS } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import { ScoreDisplay } from "@/components/score-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TrackerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const activeTab = (params.tab as string) ?? "all";

  // Build filter based on active tab
  const tabDef = TRACKER_TABS.find((t) => t.id === activeTab);
  const where: Record<string, unknown> = {
    userId: session.user.id,
  };

  if (tabDef && "status" in tabDef && tabDef.status) {
    where.status = tabDef.status;
  }
  if (tabDef && "minScore" in tabDef && tabDef.minScore) {
    where.score = { gte: tabDef.minScore };
  }

  const apps = await prisma.jobApplication.findMany({
    where,
    orderBy: { score: "desc" },
    include: { evaluation: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Tracker</h1>
          <p className="text-[#a6adc8]">
            {apps.length} application{apps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/evaluate">
          <Button style={{ backgroundColor: "#89b4fa", color: "#1e1e2e" }}>
            <Plus className="mr-2 h-4 w-4" />
            Evaluate New
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-[#45475a] bg-[#313244] p-1">
        {TRACKER_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={tab.id === "all" ? "/tracker" : `/tracker?tab=${tab.id}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#89b4fa] text-[#1e1e2e]"
                  : "text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#45475a]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#45475a] bg-[#313244] py-16">
          <p className="text-[#a6adc8]">No applications yet. Start by evaluating a job listing.</p>
          <Link
            href="/evaluate"
            className="mt-3 text-sm text-[#89b4fa] hover:underline"
          >
            Go to Evaluate
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-[#45475a] bg-[#313244]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#45475a] hover:bg-transparent">
                <TableHead className="text-[#a6adc8]">#</TableHead>
                <TableHead className="text-[#a6adc8]">Date</TableHead>
                <TableHead className="text-[#a6adc8]">Company</TableHead>
                <TableHead className="text-[#a6adc8]">Role</TableHead>
                <TableHead className="text-[#a6adc8] text-right">Score</TableHead>
                <TableHead className="text-[#a6adc8]">Status</TableHead>
                <TableHead className="text-[#a6adc8]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow
                  key={app.id}
                  className="border-b border-[#45475a] hover:bg-[#45475a]/30"
                >
                  <TableCell className="text-[#a6adc8]">
                    <Link
                      href={`/tracker/${app.id}`}
                      className="hover:text-[#89b4fa]"
                    >
                      {app.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#cdd6f4]">
                    <Link href={`/tracker/${app.id}`}>{app.date}</Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/tracker/${app.id}`}
                      className="font-medium text-[#cdd6f4] hover:text-[#89b4fa]"
                    >
                      {app.company}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#a6adc8]">
                    <Link href={`/tracker/${app.id}`}>{app.role}</Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/tracker/${app.id}`}>
                      {app.score > 0 ? (
                        <ScoreDisplay score={app.score} size="sm" />
                      ) : (
                        <span className="text-[#a6adc8]">--</span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/tracker/${app.id}`}>
                      <StatusBadge status={app.status} />
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-[#a6adc8]">
                    <Link href={`/tracker/${app.id}`}>
                      {app.notes || "--"}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
