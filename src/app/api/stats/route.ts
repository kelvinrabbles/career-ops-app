import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const apps = await prisma.jobApplication.findMany();

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

  const avgScore = scoredCount > 0 ? Math.round((scoreSum / scoredCount) * 10) / 10 : 0;

  const recent = await prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    total,
    byStatus,
    avgScore,
    topScore,
    withPdf,
    scoredCount,
    recent,
  });
}
