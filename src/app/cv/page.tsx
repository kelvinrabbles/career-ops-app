"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Application = {
  id: string;
  number: number;
  company: string;
  role: string;
};

export default function CVEditorPage() {
  const [cvMarkdown, setCvMarkdown] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [pdfMessage, setPdfMessage] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch profile CV markdown
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data?.cvMarkdown) {
          setCvMarkdown(data.cvMarkdown);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Fetch applications for PDF dropdown
  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data: Application[]) => {
        setApplications(data ?? []);
      })
      .catch(() => {});
  }, []);

  const saveCv = useCallback(async (content: string) => {
    setSaveStatus("saving");
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvMarkdown: content }),
      });
      setSaveStatus("saved");
      // Reset to idle after 2 seconds
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, []);

  function handleBlur() {
    saveCv(cvMarkdown);
  }

  async function handleGeneratePdf() {
    if (!selectedAppId) return;
    setPdfMessage("");
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: selectedAppId }),
      });
      if (res.ok) {
        setPdfMessage("PDF generation queued. Check the tracker for download.");
      } else {
        setPdfMessage("PDF generation is not yet implemented (Phase 5).");
      }
    } catch {
      setPdfMessage("PDF generation is not yet implemented (Phase 5).");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">CV Editor</h1>
          <p className="text-sm text-[#a6adc8] mt-1">
            Edit your master CV in markdown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              saveStatus === "saving"
                ? "bg-[#f9e2af]/15 text-[#f9e2af]"
                : saveStatus === "saved"
                  ? "bg-[#a6e3a1]/15 text-[#a6e3a1]"
                  : "bg-[#45475a]/30 text-[#a6adc8]"
            }`}
          >
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved"
                : ""}
          </span>
        </div>
      </div>

      {/* Split-pane editor */}
      <div className="grid grid-cols-2 gap-4 min-h-[60vh]">
        {/* Left pane - Editor */}
        <Card className="bg-[#313244] border-[#45475a] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#a6adc8]">
              Markdown Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Textarea
              value={cvMarkdown}
              onChange={(e) => setCvMarkdown(e.target.value)}
              onBlur={handleBlur}
              placeholder={
                loaded
                  ? "Start writing your CV in markdown..."
                  : "Loading..."
              }
              className="flex-1 min-h-[50vh] bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] placeholder:text-[#a6adc8]/50 font-mono text-sm resize-none"
            />
          </CardContent>
        </Card>

        {/* Right pane - Preview */}
        <Card className="bg-[#313244] border-[#45475a] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#a6adc8]">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="bg-[#1e1e2e] border border-[#45475a] rounded-lg p-4 min-h-[50vh]">
              {cvMarkdown ? (
                <pre className="text-sm text-[#cdd6f4] whitespace-pre-wrap font-[family-name:var(--font-geist-sans)] leading-relaxed cv-preview">
                  {cvMarkdown.split("\n").map((line, i) => {
                    // Basic markdown styling
                    if (line.startsWith("# ")) {
                      return (
                        <div
                          key={i}
                          className="text-xl font-bold text-[#cdd6f4] mb-2 mt-4 first:mt-0"
                        >
                          {line.slice(2)}
                        </div>
                      );
                    }
                    if (line.startsWith("## ")) {
                      return (
                        <div
                          key={i}
                          className="text-lg font-semibold text-[#89b4fa] mb-1.5 mt-3"
                        >
                          {line.slice(3)}
                        </div>
                      );
                    }
                    if (line.startsWith("### ")) {
                      return (
                        <div
                          key={i}
                          className="text-base font-medium text-[#cba6f7] mb-1 mt-2"
                        >
                          {line.slice(4)}
                        </div>
                      );
                    }
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                      return (
                        <div
                          key={i}
                          className="pl-4 text-[#cdd6f4]/90 before:content-['•'] before:mr-2 before:text-[#a6adc8]"
                        >
                          {line.slice(2)}
                        </div>
                      );
                    }
                    if (line.startsWith("---")) {
                      return (
                        <hr
                          key={i}
                          className="border-[#45475a] my-3"
                        />
                      );
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <div key={i} className="font-bold text-[#cdd6f4]">
                          {line.slice(2, -2)}
                        </div>
                      );
                    }
                    if (line.trim() === "") {
                      return <div key={i} className="h-2" />;
                    }
                    return (
                      <div key={i} className="text-[#cdd6f4]/90">
                        {line}
                      </div>
                    );
                  })}
                </pre>
              ) : (
                <p className="text-sm text-[#a6adc8]/50 italic">
                  {loaded
                    ? "Your CV preview will appear here..."
                    : "Loading..."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-[#45475a]" />

      {/* Generate PDF section */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <CardTitle className="text-[#cdd6f4]">Generate PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-[#cdd6f4]">
                Select Application
              </Label>
              <Select
                value={selectedAppId}
                onValueChange={(val) => setSelectedAppId(val ?? "")}
              >
                <SelectTrigger className="w-full bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4]">
                  <SelectValue placeholder="Choose an application..." />
                </SelectTrigger>
                <SelectContent className="bg-[#313244] border-[#45475a]">
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      #{app.number} - {app.company} / {app.role}
                    </SelectItem>
                  ))}
                  {applications.length === 0 && (
                    <SelectItem value="__none" disabled>
                      No applications found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGeneratePdf}
              disabled={!selectedAppId}
              className="bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#cba6f7]/80"
            >
              Generate PDF
            </Button>
          </div>
          {pdfMessage && (
            <p className="text-sm text-[#f9e2af]">{pdfMessage}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
