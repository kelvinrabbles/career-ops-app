"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScoreDisplay } from "@/components/score-display";
import {
  SCORING_DIMENSIONS,
  type DimensionKey,
} from "@/lib/constants";
import {
  calculateGlobalScore,
  getScoreRecommendation,
  type DimensionScores,
} from "@/lib/scoring";

const STEPS = ["Job Details", "Score", "Report", "Review & Save"] as const;

function initialScores(): DimensionScores {
  const scores: Partial<DimensionScores> = {};
  for (const dim of SCORING_DIMENSIONS) {
    scores[dim.key] = 3;
  }
  return scores as DimensionScores;
}

export default function EvaluatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1 - Job Details
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jdText, setJdText] = useState("");

  // Step 2 - Scores
  const [scores, setScores] = useState<DimensionScores>(initialScores());

  // Step 3 - Report
  const [roleSummary, setRoleSummary] = useState("");
  const [levelStrategy, setLevelStrategy] = useState("");
  const [compResearch, setCompResearch] = useState("");
  const [draftAnswers, setDraftAnswers] = useState("");
  const [keywords, setKeywords] = useState("");

  const globalScore = calculateGlobalScore(scores);
  const recommendation = getScoreRecommendation(globalScore);

  function updateScore(key: DimensionKey, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // 1. Create the JobApplication
      const appRes = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          jobUrl,
          jdText,
          score: globalScore,
          scoreRaw: `${globalScore.toFixed(1)}/5`,
          status: "Evaluated",
        }),
      });
      if (!appRes.ok) throw new Error("Failed to create application");
      const app = await appRes.json();

      // 2. Create the EvaluationReport
      const keywordsArr = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const evalRes = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          dimensionScores: scores,
          globalScore,
          roleSummary,
          levelStrategy,
          compResearch,
          draftAnswers,
          keywords: keywordsArr,
        }),
      });
      if (!evalRes.ok) throw new Error("Failed to create evaluation");

      // 3. Redirect to tracker detail
      router.push(`/tracker/${app.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  const canProceed = () => {
    if (step === 0) return company.trim() !== "" && role.trim() !== "";
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#cdd6f4]">
          Evaluate Opportunity
        </h1>
        <p className="text-sm text-[#a6adc8] mt-1">
          Score and assess a new job opportunity
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                i === step
                  ? "bg-[#89b4fa]/15 text-[#89b4fa] font-medium"
                  : i < step
                    ? "text-[#a6e3a1] cursor-pointer hover:bg-[#313244]"
                    : "text-[#a6adc8]/50"
              }`}
              disabled={i > step}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  i === step
                    ? "bg-[#89b4fa] text-[#1e1e2e]"
                    : i < step
                      ? "bg-[#a6e3a1] text-[#1e1e2e]"
                      : "bg-[#45475a] text-[#a6adc8]"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-px ${
                  i < step ? "bg-[#a6e3a1]" : "bg-[#45475a]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 - Job Details */}
      {step === 0 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#cdd6f4]">Company *</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#cdd6f4]">Role *</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Project Manager"
                  className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#cdd6f4]">Job URL</Label>
              <Input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#cdd6f4]">Job Description</Label>
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={8}
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50 resize-y"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Score */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Live score display */}
          <Card className="bg-[#313244] border-[#45475a]">
            <CardContent className="py-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a6adc8]">Global Score</p>
                <ScoreDisplay score={globalScore} size="lg" />
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${recommendation.color}`}>
                  {recommendation.label}
                </p>
                <p className="text-xs text-[#a6adc8] max-w-[220px]">
                  {recommendation.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dimension sliders */}
          <Card className="bg-[#313244] border-[#45475a]">
            <CardHeader>
              <CardTitle className="text-[#cdd6f4]">
                Dimension Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {SCORING_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#cdd6f4]">
                        {dim.label}
                      </span>
                      <span className="text-xs text-[#a6adc8]">
                        ({Math.round(dim.weight * 100)}%)
                      </span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-[#89b4fa] min-w-[2.5rem] text-right">
                      {scores[dim.key].toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={0.5}
                    value={[scores[dim.key]]}
                    onValueChange={(val) => {
                      const arr = Array.isArray(val) ? val : [val];
                      updateScore(dim.key, arr[0]);
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-[#a6adc8]/70">
                    <span>{dim.helpLow}</span>
                    <span>{dim.helpHigh}</span>
                  </div>
                  <Separator className="bg-[#45475a]/50 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3 - Report */}
      {step === 2 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">
              Report Details{" "}
              <span className="text-xs font-normal text-[#a6adc8]">
                (optional)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#cdd6f4]">Role Summary</Label>
              <Textarea
                value={roleSummary}
                onChange={(e) => setRoleSummary(e.target.value)}
                placeholder="Brief summary of the role and why it matters..."
                rows={3}
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50 resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#cdd6f4]">Level Strategy</Label>
              <Textarea
                value={levelStrategy}
                onChange={(e) => setLevelStrategy(e.target.value)}
                placeholder="How to position yourself for the seniority level..."
                rows={3}
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50 resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#cdd6f4]">Comp Research</Label>
              <Textarea
                value={compResearch}
                onChange={(e) => setCompResearch(e.target.value)}
                placeholder="Salary bands, equity info, total comp research..."
                rows={3}
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50 resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#cdd6f4]">Draft Answers</Label>
              <Textarea
                value={draftAnswers}
                onChange={(e) => setDraftAnswers(e.target.value)}
                placeholder="Draft responses to common application questions (markdown)..."
                rows={5}
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50 resize-y font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#cdd6f4]">Keywords</Label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Comma-separated: agile, stakeholder management, ..."
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 - Review & Save */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="bg-[#313244] border-[#45475a]">
            <CardHeader>
              <CardTitle className="text-[#cdd6f4]">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a6adc8]">Company</span>
                <span className="text-[#cdd6f4] font-medium">{company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a6adc8]">Role</span>
                <span className="text-[#cdd6f4] font-medium">{role}</span>
              </div>
              {jobUrl && (
                <div className="flex justify-between">
                  <span className="text-[#a6adc8]">URL</span>
                  <a
                    href={jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#89b4fa] hover:underline truncate max-w-[300px]"
                  >
                    {jobUrl}
                  </a>
                </div>
              )}
              {jdText && (
                <div className="pt-2">
                  <span className="text-[#a6adc8]">Job Description</span>
                  <p className="text-[#cdd6f4]/80 mt-1 text-xs whitespace-pre-wrap line-clamp-4">
                    {jdText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#313244] border-[#45475a]">
            <CardHeader>
              <CardTitle className="text-[#cdd6f4] flex items-center justify-between">
                <span>Scores</span>
                <ScoreDisplay score={globalScore} size="lg" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {SCORING_DIMENSIONS.map((dim) => (
                  <div key={dim.key} className="flex justify-between">
                    <span className="text-[#a6adc8]">{dim.label}</span>
                    <span className="text-[#cdd6f4] font-mono">
                      {scores[dim.key].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="bg-[#45475a]/50 my-3" />
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${recommendation.color}`}>
                  {recommendation.label}
                </span>
                <span className="text-xs text-[#a6adc8]">
                  {recommendation.description}
                </span>
              </div>
            </CardContent>
          </Card>

          {(roleSummary || levelStrategy || compResearch || draftAnswers || keywords) && (
            <Card className="bg-[#313244] border-[#45475a]">
              <CardHeader>
                <CardTitle className="text-[#cdd6f4]">Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {roleSummary && (
                  <div>
                    <span className="text-[#a6adc8] text-xs">Role Summary</span>
                    <p className="text-[#cdd6f4]/90 mt-0.5">{roleSummary}</p>
                  </div>
                )}
                {levelStrategy && (
                  <div>
                    <span className="text-[#a6adc8] text-xs">Level Strategy</span>
                    <p className="text-[#cdd6f4]/90 mt-0.5">{levelStrategy}</p>
                  </div>
                )}
                {compResearch && (
                  <div>
                    <span className="text-[#a6adc8] text-xs">Comp Research</span>
                    <p className="text-[#cdd6f4]/90 mt-0.5">{compResearch}</p>
                  </div>
                )}
                {draftAnswers && (
                  <div>
                    <span className="text-[#a6adc8] text-xs">Draft Answers</span>
                    <p className="text-[#cdd6f4]/90 mt-0.5 whitespace-pre-wrap font-mono text-xs">
                      {draftAnswers}
                    </p>
                  </div>
                )}
                {keywords && (
                  <div>
                    <span className="text-[#a6adc8] text-xs">Keywords</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {keywords
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded-full bg-[#cba6f7]/15 text-[#cba6f7] text-xs border border-[#cba6f7]/30"
                          >
                            {kw}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="border-[#45475a] text-[#cdd6f4] hover:bg-[#45475a]/50"
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#89b4fa]/80"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80"
          >
            {saving ? "Saving..." : "Save Evaluation"}
          </Button>
        )}
      </div>
    </div>
  );
}
