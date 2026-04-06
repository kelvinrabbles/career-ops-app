import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const results = await prisma.scanResult.findMany({
    where: { portal: { userId } },
    orderBy: { firstSeen: "desc" },
    take: 100,
  });
  return NextResponse.json(results);
}
