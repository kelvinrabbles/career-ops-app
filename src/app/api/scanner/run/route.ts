import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  // Phase 6 implementation: for now return a placeholder
  // Full implementation will add Playwright scraping + Greenhouse API + title filtering
  const portals = await prisma.portalConfig.findMany({
    where: { enabled: true },
  });

  const results = await prisma.scanResult.findMany({
    orderBy: { firstSeen: "desc" },
    take: 50,
  });

  return NextResponse.json({
    message: `Scanner checked ${portals.length} portals. Full scanning will be implemented with Playwright integration.`,
    portalsChecked: portals.length,
    results,
  });
}
