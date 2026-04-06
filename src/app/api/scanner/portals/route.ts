import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const portals = await prisma.portalConfig.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(portals);
}

export async function POST(request: Request) {
  const body = await request.json();
  const portal = await prisma.portalConfig.create({
    data: {
      name: body.name,
      careersUrl: body.careersUrl,
      apiUrl: body.apiUrl ?? "",
      scanMethod: body.scanMethod ?? "playwright",
      scanQuery: body.scanQuery ?? "",
      notes: body.notes ?? "",
      enabled: body.enabled ?? true,
    },
  });
  return NextResponse.json(portal, { status: 201 });
}
