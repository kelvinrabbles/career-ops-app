export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ScoreDisplay } from "@/components/score-display";
import { Briefcase, TrendingUp, FileCheck, Target } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile?.isOnboarded) redirect("/onboarding");

  const apps = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const total = apps.length;
  const byStatus: Record<string, number> = {};
  let scoreSum = 0;
  let scoredCount = 0;
  let topScore = 0;
  let withPdf = 0;

  for (const app of apps) {
    byStatus[app.status] = (byStatus[app.status] ?? 0) + 1;
    if (app.score > 0) {
      scoreSum += app.score;
      scoredCount++;
      if (app.score > topScore) topScore = app.score;
    }
    if (app.hasPdf) withPdf++;
  }

  const avgScore =
    scoredCount > 0 ? Math.round((scoreSum / scoredCount) * 10) / 10 : 0;
  const recent = apps.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#cdd6f4]">Dashboard</h1>
        <p className="text-[#a6adc8]">
          Welcome back, {session.user.name || "there"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a6adc8]">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-[#89b4fa]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#cdd6f4]">{total}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a6adc8]">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#a6e3a1]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scoredCount > 0 ? <ScoreDisplay score={avgScore} size="lg" /> : <span className="text-[#a6adc8]">--</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a6adc8]">Top Score</CardTitle>
            <Target className="h-4 w-4 text-[#f9e2af]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {topScore > 0 ? <ScoreDisplay score={topScore} size="lg" /> : <span className="text-[#a6adc8]">--</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a6adc8]">PDFs Generated</CardTitle>
            <FileCheck className="h-4 w-4 text-[#cba6f7]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#cdd6f4]">{withPdf}</div>
          </CardContent>
        </Card>
      </div>

      {total > 0 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="text-sm font-semibold text-[#cdd6f4]">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <CardTitle className="text-[#cdd6f4]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[#a6adc8]">No applications yet.</p>
              <Link href="/evaluate" className="mt-2 inline-block text-sm text-[#89b4fa] hover:underline">
                Evaluate your first job listing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((app) => (
                <Link
                  key={app.id}
                  href={`/tracker/${app.id}`}
                  className="flex items-center justify-between rounded-md border border-[#45475a] bg-[#1e1e2e] px-4 py-3 transition-colors hover:bg-[#45475a]/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#a6adc8]">#{app.number}</span>
                    <div>
                      <p className="font-medium text-[#cdd6f4]">{app.company}</p>
                      <p className="text-sm text-[#a6adc8]">{app.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.score > 0 && <ScoreDisplay score={app.score} size="sm" />}
                    <StatusBadge status={app.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
