import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const profile = await prisma.candidateProfile.findFirst();
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const existing = await prisma.candidateProfile.findFirst();

  if (existing) {
    const updated = await prisma.candidateProfile.update({
      where: { id: existing.id },
      data: {
        fullName: body.fullName ?? existing.fullName,
        email: body.email ?? existing.email,
        phone: body.phone ?? existing.phone,
        location: body.location ?? existing.location,
        linkedin: body.linkedin ?? existing.linkedin,
        portfolioUrl: body.portfolioUrl ?? existing.portfolioUrl,
        cvMarkdown: body.cvMarkdown ?? existing.cvMarkdown,
        targetRoles: body.targetRoles ? JSON.stringify(body.targetRoles) : existing.targetRoles,
        archetypes: body.archetypes ? JSON.stringify(body.archetypes) : existing.archetypes,
        narrative: body.narrative ? JSON.stringify(body.narrative) : existing.narrative,
        compensation: body.compensation ? JSON.stringify(body.compensation) : existing.compensation,
        timezone: body.timezone ?? existing.timezone,
        isOnboarded: body.isOnboarded ?? existing.isOnboarded,
      },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.candidateProfile.create({
    data: {
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
  });
  return NextResponse.json(created, { status: 201 });
}
