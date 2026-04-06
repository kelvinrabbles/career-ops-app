import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Phase 6 implementation: for now return a placeholder
  // Full implementation will add Playwright scraping + Greenhouse API + title filtering
  const portals = await prisma.portalConfig.findMany({
    where: { enabled: true, userId },
  });

  const results = await prisma.scanResult.findMany({
    where: { portal: { userId } },
    orderBy: { firstSeen: "desc" },
    take: 50,
  });

  return NextResponse.json({
    message: `Scanner checked ${portals.length} portals. Full scanning will be implemented with Playwright integration.`,
    portalsChecked: portals.length,
    results,
  });
}
