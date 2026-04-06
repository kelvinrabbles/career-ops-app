import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const results = await prisma.scanResult.findMany({
    orderBy: { firstSeen: "desc" },
    take: 100,
  });
  return NextResponse.json(results);
}
