"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STEPS = ["Personal Info", "CV", "Target Roles", "Compensation"];

interface Archetype {
  name: string;
  level: string;
  fit: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolioUrl: string;
  timezone: string;
  cvMarkdown: string;
  targetRoles: string[];
  archetypes: Archetype[];
  targetRange: string;
  minimum: string;
  currency: string;
  locationFlexibility: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState("");

  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolioUrl: "",
    timezone: "",
    cvMarkdown: "",
    targetRoles: [],
    archetypes: [],
    targetRange: "",
    minimum: "",
    currency: "USD",
    locationFlexibility: "",
  });

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addRole() {
    const trimmed = newRole.trim();
    if (!trimmed) return;
    updateField("targetRoles", [...form.targetRoles, trimmed]);
    setNewRole("");
  }

  function removeRole(index: number) {
    updateField(
      "targetRoles",
      form.targetRoles.filter((_, i) => i !== index)
    );
  }

  function addArchetype() {
    updateField("archetypes", [
      ...form.archetypes,
      { name: "", level: "Mid", fit: "primary" },
    ]);
  }

  function updateArchetype(index: number, field: keyof Archetype, value: string) {
    const updated = form.archetypes.map((a, i) =>
      i === index ? { ...a, [field]: value } : a
    );
    updateField("archetypes", updated);
  }

  function removeArchetype(index: number) {
    updateField(
      "archetypes",
      form.archetypes.filter((_, i) => i !== index)
    );
  }

  async function handleComplete() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isOnboarded: true }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      router.push("/");
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#1e1e2e" }}>
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between px-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: i <= step ? "#89b4fa" : "#45475a",
                  color: i <= step ? "#1e1e2e" : "#a6adc8",
                }}
              >
                {i + 1}
              </div>
              <span
                className="text-sm hidden sm:inline"
                style={{ color: i <= step ? "#cdd6f4" : "#a6adc8" }}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className="hidden sm:block w-8 h-0.5 mx-1"
                  style={{ backgroundColor: i < step ? "#89b4fa" : "#45475a" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card style={{ backgroundColor: "#313244", borderColor: "#45475a" }}>
          <CardHeader>
            <CardTitle style={{ color: "#cdd6f4" }}>
              {STEPS[step]}
            </CardTitle>
            <CardDescription style={{ color: "#a6adc8" }}>
              {step === 0 && "Tell us about yourself"}
              {step === 1 && "Paste or write your CV in markdown format"}
              {step === 2 && "Define the roles and archetypes you are targeting"}
              {step === 3 && "Set your compensation expectations"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1 - Personal Info */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>Full Name</Label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Jane Doe"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="jane@example.com"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1 555-0123"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>Location</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="San Francisco, CA"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>LinkedIn</Label>
                    <Input
                      value={form.linkedin}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/janedoe"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>Portfolio URL</Label>
                    <Input
                      value={form.portfolioUrl}
                      onChange={(e) => updateField("portfolioUrl", e.target.value)}
                      placeholder="https://janedoe.dev"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#cdd6f4" }}>Timezone</Label>
                  <Input
                    value={form.timezone}
                    onChange={(e) => updateField("timezone", e.target.value)}
                    placeholder="America/Los_Angeles"
                    style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                  />
                </div>
              </>
            )}

            {/* Step 2 - CV */}
            {step === 1 && (
              <div className="space-y-2">
                <Label style={{ color: "#cdd6f4" }}>Your CV (Markdown)</Label>
                <p className="text-sm" style={{ color: "#a6adc8" }}>
                  Paste your resume text here. Include sections: Summary, Experience, Projects, Education, Skills
                </p>
                <Textarea
                  value={form.cvMarkdown}
                  onChange={(e) => updateField("cvMarkdown", e.target.value)}
                  placeholder={"# Summary\n\nExperienced software engineer...\n\n# Experience\n\n## Company Name — Role\n..."}
                  rows={16}
                  style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                />
              </div>
            )}

            {/* Step 3 - Target Roles */}
            {step === 2 && (
              <>
                {/* Target Roles List */}
                <div className="space-y-3">
                  <Label style={{ color: "#cdd6f4" }}>Target Roles</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRole();
                        }
                      }}
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                    <Button
                      type="button"
                      onClick={addRole}
                      style={{ backgroundColor: "#89b4fa", color: "#1e1e2e" }}
                    >
                      Add Role
                    </Button>
                  </div>
                  {form.targetRoles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.targetRoles.map((role, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: "#45475a", color: "#cdd6f4" }}
                        >
                          {role}
                          <button
                            type="button"
                            onClick={() => removeRole(i)}
                            className="ml-1 hover:opacity-70"
                            style={{ color: "#a6adc8" }}
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Archetypes */}
                <div className="space-y-3 pt-4" style={{ borderTopColor: "#45475a", borderTopWidth: 1 }}>
                  <Label style={{ color: "#cdd6f4" }}>Archetypes</Label>
                  {form.archetypes.map((arch, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end p-3 rounded-lg"
                      style={{ backgroundColor: "#1e1e2e" }}
                    >
                      <div className="space-y-1">
                        <Label className="text-xs" style={{ color: "#a6adc8" }}>Name</Label>
                        <Input
                          value={arch.name}
                          onChange={(e) => updateArchetype(i, "name", e.target.value)}
                          placeholder="e.g. Full-Stack Builder"
                          style={{ backgroundColor: "#313244", borderColor: "#45475a", color: "#cdd6f4" }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs" style={{ color: "#a6adc8" }}>Level</Label>
                        <Select
                          value={arch.level}
                          onValueChange={(v) => updateArchetype(i, "level", v ?? "")}
                        >
                          <SelectTrigger
                            className="w-[120px]"
                            style={{ backgroundColor: "#313244", borderColor: "#45475a", color: "#cdd6f4" }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{ backgroundColor: "#313244", borderColor: "#45475a" }}>
                            {["Junior", "Mid", "Senior", "Staff", "Lead", "Director"].map((lvl) => (
                              <SelectItem key={lvl} value={lvl} style={{ color: "#cdd6f4" }}>
                                {lvl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs" style={{ color: "#a6adc8" }}>Fit</Label>
                        <Select
                          value={arch.fit}
                          onValueChange={(v) => updateArchetype(i, "fit", v ?? "")}
                        >
                          <SelectTrigger
                            className="w-[130px]"
                            style={{ backgroundColor: "#313244", borderColor: "#45475a", color: "#cdd6f4" }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{ backgroundColor: "#313244", borderColor: "#45475a" }}>
                            {["primary", "secondary", "adjacent"].map((f) => (
                              <SelectItem key={f} value={f} style={{ color: "#cdd6f4" }}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeArchetype(i)}
                        className="text-sm"
                        style={{ color: "#a6adc8" }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addArchetype}
                    style={{ borderColor: "#45475a", color: "#cdd6f4", backgroundColor: "transparent" }}
                  >
                    Add Archetype
                  </Button>
                </div>
              </>
            )}

            {/* Step 4 - Compensation */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>Target Range</Label>
                    <Input
                      value={form.targetRange}
                      onChange={(e) => updateField("targetRange", e.target.value)}
                      placeholder="$90K-130K"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: "#cdd6f4" }}>Minimum</Label>
                    <Input
                      value={form.minimum}
                      onChange={(e) => updateField("minimum", e.target.value)}
                      placeholder="$85K"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#cdd6f4" }}>Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(v) => updateField("currency", v ?? "")}
                  >
                    <SelectTrigger
                      className="w-[180px]"
                      style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: "#313244", borderColor: "#45475a" }}>
                      {["USD", "EUR", "GBP", "CAD"].map((c) => (
                        <SelectItem key={c} value={c} style={{ color: "#cdd6f4" }}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#cdd6f4" }}>Location Flexibility</Label>
                  <Textarea
                    value={form.locationFlexibility}
                    onChange={(e) => updateField("locationFlexibility", e.target.value)}
                    placeholder="Open to remote, hybrid in SF Bay Area, willing to relocate to NYC..."
                    rows={4}
                    style={{ backgroundColor: "#1e1e2e", borderColor: "#45475a", color: "#cdd6f4" }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={{ borderColor: "#45475a", color: "#cdd6f4", backgroundColor: "transparent" }}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              style={{ backgroundColor: "#89b4fa", color: "#1e1e2e" }}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={saving}
              style={{ backgroundColor: "#a6e3a1", color: "#1e1e2e" }}
            >
              {saving ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
