export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScoreDisplay } from "@/components/score-display";
import { StatusBadge } from "@/components/status-badge";
import {
  SCORING_DIMENSIONS,
  type DimensionKey,
} from "@/lib/constants";
import { getScoreRecommendation, getScoreColor } from "@/lib/scoring";

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const { id } = await params;

  const evaluation = await prisma.evaluationReport.findFirst({
    where: { applicationId: id },
    include: { application: true },
  });

  if (!evaluation) notFound();

  // Verify the evaluation belongs to the authenticated user
  if (evaluation.application.userId !== session.user.id) notFound();

  const app = evaluation.application;
  const dimensionScores: Record<string, number> = JSON.parse(
    evaluation.dimensionScores
  );
  const cvMatch: string[] = (() => {
    try {
      return JSON.parse(evaluation.cvMatch);
    } catch {
      return [];
    }
  })();
  const gaps: string[] = (() => {
    try {
      return JSON.parse(evaluation.gaps);
    } catch {
      return [];
    }
  })();
  const keywordsArr: string[] = (() => {
    try {
      return JSON.parse(evaluation.keywords);
    } catch {
      return [];
    }
  })();
  const interviewPrep: string[] = (() => {
    try {
      return JSON.parse(evaluation.interviewPrep);
    } catch {
      return [];
    }
  })();

  const recommendation = getScoreRecommendation(evaluation.globalScore);

  // Find max score for bar chart scaling
  const maxScore = 5;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#cdd6f4]">
              {app.role}
            </h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-[#a6adc8]">{app.company}</p>
          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#89b4fa] hover:underline"
            >
              View job posting
            </a>
          )}
        </div>
        <Link href={`/tracker/${app.id}`}>
          <Button
            variant="outline"
            className="border-[#45475a] text-[#cdd6f4] hover:bg-[#45475a]/50"
          >
            Back to Tracker
          </Button>
        </Link>
      </div>

      {/* Score overview */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardContent className="py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-[#a6adc8] mb-1">Global Score</p>
              <ScoreDisplay score={evaluation.globalScore} size="lg" />
            </div>
            <Separator
              orientation="vertical"
              className="h-10 bg-[#45475a]"
            />
            <div>
              <p className={`text-sm font-semibold ${recommendation.color}`}>
                {recommendation.label}
              </p>
              <p className="text-xs text-[#a6adc8]">
                {recommendation.description}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-[#a6adc8]">
            <p>
              Evaluated{" "}
              {new Date(evaluation.createdAt).toLocaleDateString()}
            </p>
            <p>Application #{app.number}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dimension scores bar chart */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <CardTitle className="text-[#cdd6f4]">Dimension Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SCORING_DIMENSIONS.map((dim) => {
            const score = dimensionScores[dim.key] ?? 0;
            const pct = (score / maxScore) * 100;
            const colorClass = getScoreColor(score);
            // Map tailwind text colors to bar bg colors
            const barColor =
              score >= 4.2
                ? "bg-[#a6e3a1]"
                : score >= 3.8
                  ? "bg-[#f9e2af]"
                  : score >= 3.0
                    ? "bg-[#89b4fa]"
                    : "bg-[#f38ba8]";

            return (
              <div key={dim.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#cdd6f4]">
                    {dim.label}{" "}
                    <span className="text-[#a6adc8] text-xs">
                      ({Math.round(dim.weight * 100)}%)
                    </span>
                  </span>
                  <span className={`font-mono font-semibold ${colorClass}`}>
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1e1e2e]">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Role Summary */}
      {evaluation.roleSummary && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Role Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#cdd6f4]/90 whitespace-pre-wrap">
              {evaluation.roleSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CV Match */}
      {cvMatch.length > 0 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">CV Match</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {cvMatch.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[#cdd6f4]/90"
                >
                  <span className="text-[#a6e3a1] mt-0.5">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {gaps.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[#cdd6f4]/90"
                >
                  <span className="text-[#f38ba8] mt-0.5">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Level Strategy */}
      {evaluation.levelStrategy && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Level Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#cdd6f4]/90 whitespace-pre-wrap">
              {evaluation.levelStrategy}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comp Research */}
      {evaluation.compResearch && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">
              Compensation Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#cdd6f4]/90 whitespace-pre-wrap">
              {evaluation.compResearch}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Interview Prep */}
      {interviewPrep.length > 0 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Interview Prep</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {interviewPrep.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-[#cdd6f4]/90 pl-4 border-l-2 border-[#cba6f7]/50"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Keywords */}
      {keywordsArr.length > 0 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywordsArr.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-full bg-[#cba6f7]/15 text-[#cba6f7] text-xs border border-[#cba6f7]/30"
                >
                  {kw}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Answers */}
      {evaluation.draftAnswers && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Draft Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-[#cdd6f4]/90 whitespace-pre-wrap font-mono bg-[#1e1e2e] rounded-lg p-4 border border-[#45475a]/50">
              {evaluation.draftAnswers}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
