import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const evaluation = await prisma.evaluationReport.create({
    data: {
      applicationId: body.applicationId,
      dimensionScores: JSON.stringify(body.dimensionScores ?? {}),
      globalScore: body.globalScore ?? 0,
      roleSummary: body.roleSummary ?? "",
      cvMatch: JSON.stringify(body.cvMatch ?? []),
      gaps: JSON.stringify(body.gaps ?? []),
      levelStrategy: body.levelStrategy ?? "",
      compResearch: body.compResearch ?? "",
      personalizationPlan: JSON.stringify(body.personalizationPlan ?? []),
      interviewPrep: JSON.stringify(body.interviewPrep ?? []),
      keywords: JSON.stringify(body.keywords ?? []),
      draftAnswers: body.draftAnswers ?? "",
    },
  });

  // Update the application score
  await prisma.jobApplication.update({
    where: { id: body.applicationId },
    data: {
      score: body.globalScore ?? 0,
      scoreRaw: `${(body.globalScore ?? 0).toFixed(1)}/5`,
    },
  });

  return NextResponse.json(evaluation, { status: 201 });
}
