import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const portals = await prisma.portalConfig.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(portals);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json();
  const portal = await prisma.portalConfig.create({
    data: {
      userId,
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
