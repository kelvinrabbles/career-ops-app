import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const evaluation = await prisma.evaluationReport.findUnique({
    where: { id },
    include: { application: true },
  });
  if (!evaluation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(evaluation);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.dimensionScores !== undefined) data.dimensionScores = JSON.stringify(body.dimensionScores);
  if (body.globalScore !== undefined) data.globalScore = body.globalScore;
  if (body.roleSummary !== undefined) data.roleSummary = body.roleSummary;
  if (body.cvMatch !== undefined) data.cvMatch = JSON.stringify(body.cvMatch);
  if (body.gaps !== undefined) data.gaps = JSON.stringify(body.gaps);
  if (body.levelStrategy !== undefined) data.levelStrategy = body.levelStrategy;
  if (body.compResearch !== undefined) data.compResearch = body.compResearch;
  if (body.personalizationPlan !== undefined) data.personalizationPlan = JSON.stringify(body.personalizationPlan);
  if (body.interviewPrep !== undefined) data.interviewPrep = JSON.stringify(body.interviewPrep);
  if (body.keywords !== undefined) data.keywords = JSON.stringify(body.keywords);
  if (body.draftAnswers !== undefined) data.draftAnswers = body.draftAnswers;

  const evaluation = await prisma.evaluationReport.update({
    where: { id },
    data,
  });

  // Sync score back to application
  if (body.globalScore !== undefined) {
    await prisma.jobApplication.update({
      where: { id: evaluation.applicationId },
      data: {
        score: body.globalScore,
        scoreRaw: `${body.globalScore.toFixed(1)}/5`,
      },
    });
  }

  return NextResponse.json(evaluation);
}
