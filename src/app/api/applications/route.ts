import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const minScore = searchParams.get("minScore");
  const sortBy = searchParams.get("sortBy") ?? "date";
  const order = searchParams.get("order") ?? "desc";
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;
  if (minScore) where.score = { gte: parseFloat(minScore) };
  if (search) {
    where.OR = [
      { company: { contains: search } },
      { role: { contains: search } },
    ];
  }

  const orderBy: Record<string, string> = {};
  if (sortBy === "date") orderBy.date = order;
  else if (sortBy === "score") orderBy.score = order;
  else if (sortBy === "company") orderBy.company = order;
  else if (sortBy === "status") orderBy.status = order;
  else orderBy.createdAt = order;

  const apps = await prisma.jobApplication.findMany({
    where,
    orderBy,
    include: { evaluation: true },
  });

  return NextResponse.json(apps);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json();

  const app = await prisma.jobApplication.create({
    data: {
      userId,
      date: body.date ?? new Date().toISOString().slice(0, 10),
      company: body.company,
      role: body.role,
      score: body.score ?? 0,
      scoreRaw: body.scoreRaw ?? "",
      status: body.status ?? "Evaluated",
      hasPdf: body.hasPdf ?? false,
      pdfPath: body.pdfPath ?? "",
      notes: body.notes ?? "",
      jobUrl: body.jobUrl ?? "",
      jdText: body.jdText ?? "",
      archetype: body.archetype ?? "",
    },
  });

  return NextResponse.json(app, { status: 201 });
}
