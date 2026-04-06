import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
  });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json();

  const updated = await prisma.candidateProfile.upsert({
    where: { userId },
    create: {
      userId,
      fullName: body.fullName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      location: body.location ?? "",
      linkedin: body.linkedin ?? "",
      portfolioUrl: body.portfolioUrl ?? "",
      cvMarkdown: body.cvMarkdown ?? "",
      targetRoles: JSON.stringify(body.targetRoles ?? []),
      archetypes: JSON.stringify(body.archetypes ?? []),
      narrative: JSON.stringify(body.narrative ?? {}),
      compensation: JSON.stringify(body.compensation ?? {}),
      timezone: body.timezone ?? "",
      isOnboarded: body.isOnboarded ?? false,
    },
    update: {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      location: body.location,
      linkedin: body.linkedin,
      portfolioUrl: body.portfolioUrl,
      cvMarkdown: body.cvMarkdown,
      targetRoles: body.targetRoles ? JSON.stringify(body.targetRoles) : undefined,
      archetypes: body.archetypes ? JSON.stringify(body.archetypes) : undefined,
      narrative: body.narrative ? JSON.stringify(body.narrative) : undefined,
      compensation: body.compensation ? JSON.stringify(body.compensation) : undefined,
      timezone: body.timezone,
      isOnboarded: body.isOnboarded,
    },
  });

  return NextResponse.json(updated);
}
