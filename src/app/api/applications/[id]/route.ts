import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = await prisma.jobApplication.findUnique({
    where: { id },
    include: { evaluation: true },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(app);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const app = await prisma.jobApplication.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(app);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.jobApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
