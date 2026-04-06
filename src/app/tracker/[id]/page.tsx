"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ScoreDisplay } from "@/components/score-display";
import { STATUSES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface Evaluation {
  id: string;
  roleSummary: string;
  cvMatch: string;
  levelStrategy: string;
  compResearch: string;
  draftAnswers: string;
  dimensionScores: string;
  gaps: string;
  personalizationPlan: string;
  interviewPrep: string;
  keywords: string;
}

interface Application {
  id: string;
  number: number;
  date: string;
  company: string;
  role: string;
  score: number;
  scoreRaw: string;
  status: string;
  hasPdf: boolean;
  pdfPath: string;
  notes: string;
  jobUrl: string;
  jdText: string;
  archetype: string;
  evaluation: Evaluation | null;
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setApp(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!app) return;
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApp((prev) => (prev ? { ...prev, status: updated.status } : prev));
      }
    } finally {
      setStatusSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#a6adc8]">Loading...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[#a6adc8]">Application not found.</p>
        <Link href="/tracker" className="mt-3 text-sm text-[#89b4fa] hover:underline">
          Back to Tracker
        </Link>
      </div>
    );
  }

  const evaluation = app.evaluation;

  // Parse JSON fields safely
  function parseJson<T>(raw: string, fallback: T): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  const cvMatchItems = evaluation
    ? parseJson<{ skill: string; match: boolean; note?: string }[]>(evaluation.cvMatch, [])
    : [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/tracker"
        className="inline-flex items-center gap-1 text-sm text-[#a6adc8] hover:text-[#89b4fa]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tracker
      </Link>

      {/* Header card */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#a6adc8]">#{app.number} &middot; {app.date}</p>
              <CardTitle className="text-xl text-[#cdd6f4]">
                {app.company} &mdash; {app.role}
              </CardTitle>
              {app.archetype && (
                <p className="mt-1 text-sm text-[#a6adc8]">
                  Archetype: {app.archetype}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {app.score > 0 && <ScoreDisplay score={app.score} size="lg" />}
              <StatusBadge status={app.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status editor */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#a6adc8]">Status:</span>
              <Select
                value={app.status}
                onValueChange={(v) => v && updateStatus(v)}
                disabled={statusSaving}
              >
                <SelectTrigger
                  className="w-[180px]"
                  style={{
                    backgroundColor: "#1e1e2e",
                    borderColor: "#45475a",
                    color: "#cdd6f4",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "#313244",
                    borderColor: "#45475a",
                  }}
                >
                  {STATUSES.map((s) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      style={{ color: "#cdd6f4" }}
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusSaving && (
                <span className="text-xs text-[#a6adc8]">Saving...</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {app.jobUrl && (
                <a
                  href={app.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#89b4fa] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Job Listing
                </a>
              )}
              {app.hasPdf && (
                <Link
                  href={`/api/pdf/${app.id}`}
                  className="text-sm text-[#cba6f7] hover:underline"
                >
                  View PDF
                </Link>
              )}
            </div>
          </div>

          {app.notes && (
            <div className="mt-4 rounded-md border border-[#45475a] bg-[#1e1e2e] p-3">
              <p className="text-xs font-medium text-[#a6adc8] mb-1">Notes</p>
              <p className="text-sm text-[#cdd6f4] whitespace-pre-wrap">
                {app.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation report sections */}
      {evaluation && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#cdd6f4]">
            Evaluation Report
          </h2>

          {/* Role Summary */}
          {evaluation.roleSummary && (
            <Card className="bg-[#313244] border-[#45475a]">
              <CardHeader>
                <CardTitle className="text-[#cdd6f4] text-base">
                  Role Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#cdd6f4] whitespace-pre-wrap">
                  {evaluation.roleSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* CV Match */}
          {cvMatchItems.length > 0 && (
            <Card className="bg-[#313244] border-[#45475a]">
              <CardHeader>
                <CardTitle className="text-[#cdd6f4] text-base">
                  CV Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cvMatchItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span
                        className={
                          item.match ? "text-[#a6e3a1]" : "text-[#f38ba8]"
                        }
                      >
                        {item.match ? "+" : "-"}
                      </span>
                      <span className="text-[#cdd6f4]">
                        <strong>{item.skill}</strong>
                        {item.note && (
                          <span className="text-[#a6adc8]">
                            {" "}
                            &mdash; {item.note}
                          </span>
                        )}
                      </span>
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
                <CardTitle className="text-[#cdd6f4] text-base">
                  Level Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#cdd6f4] whitespace-pre-wrap">
                  {evaluation.levelStrategy}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Comp Research */}
          {evaluation.compResearch && (
            <Card className="bg-[#313244] border-[#45475a]">
              <CardHeader>
                <CardTitle className="text-[#cdd6f4] text-base">
                  Compensation Research
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#cdd6f4] whitespace-pre-wrap">
                  {evaluation.compResearch}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Draft Answers */}
          {evaluation.draftAnswers && (
            <Card className="bg-[#313244] border-[#45475a]">
              <CardHeader>
                <CardTitle className="text-[#cdd6f4] text-base">
                  Draft Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#cdd6f4] whitespace-pre-wrap">
                  {evaluation.draftAnswers}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
