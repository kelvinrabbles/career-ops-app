"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Save } from "lucide-react";

interface Archetype {
  name: string;
  level: string;
  fit: string;
}

interface Compensation {
  targetRange: string;
  minimum: string;
  currency: string;
  locationFlexibility: string;
}

interface ProfileForm {
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
  compensation: Compensation;
}

const DEFAULT_COMP: Compensation = {
  targetRange: "",
  minimum: "",
  currency: "USD",
  locationFlexibility: "",
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
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
    compensation: { ...DEFAULT_COMP },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const roles = safeParse<string[]>(data.targetRoles, []);
          const archetypes = safeParse<Archetype[]>(data.archetypes, []);
          const comp = safeParse<Compensation>(data.compensation, {
            ...DEFAULT_COMP,
          });
          setForm({
            fullName: data.fullName ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            location: data.location ?? "",
            linkedin: data.linkedin ?? "",
            portfolioUrl: data.portfolioUrl ?? "",
            timezone: data.timezone ?? "",
            cvMarkdown: data.cvMarkdown ?? "",
            targetRoles: roles,
            archetypes,
            compensation: comp,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function safeParse<T>(raw: unknown, fallback: T): T {
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    }
    if (raw && typeof raw === "object") return raw as T;
    return fallback;
  }

  function updateField<K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateComp<K extends keyof Compensation>(
    key: K,
    value: Compensation[K]
  ) {
    setForm((prev) => ({
      ...prev,
      compensation: { ...prev.compensation, [key]: value },
    }));
    setSaved(false);
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

  function updateArchetype(
    index: number,
    field: keyof Archetype,
    value: string
  ) {
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

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
          linkedin: form.linkedin,
          portfolioUrl: form.portfolioUrl,
          timezone: form.timezone,
          cvMarkdown: form.cvMarkdown,
          targetRoles: form.targetRoles,
          archetypes: form.archetypes,
          compensation: form.compensation,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#a6adc8]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Profile</h1>
          <p className="text-[#a6adc8]">Manage your candidate information</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: "#a6e3a1", color: "#1e1e2e" }}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Personal Info */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <CardTitle className="text-[#cdd6f4]">Personal Info</CardTitle>
          <CardDescription className="text-[#a6adc8]">
            Basic contact and identification details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Jane Doe"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="jane@example.com"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 555-0123"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="San Francisco, CA"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>LinkedIn</Label>
              <Input
                value={form.linkedin}
                onChange={(e) => updateField("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/janedoe"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>Portfolio URL</Label>
              <Input
                value={form.portfolioUrl}
                onChange={(e) => updateField("portfolioUrl", e.target.value)}
                placeholder="https://janedoe.dev"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label style={{ color: "#cdd6f4" }}>Timezone</Label>
            <Input
              value={form.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
              placeholder="America/Los_Angeles"
              style={{
                backgroundColor: "#1e1e2e",
                borderColor: "#45475a",
                color: "#cdd6f4",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* CV */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <CardTitle className="text-[#cdd6f4]">CV / Resume</CardTitle>
          <CardDescription className="text-[#a6adc8]">
            Your resume in Markdown format. Include Summary, Experience,
            Projects, Education, and Skills sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.cvMarkdown}
            onChange={(e) => updateField("cvMarkdown", e.target.value)}
            placeholder={
              "# Summary\n\nExperienced software engineer...\n\n# Experience\n\n## Company Name - Role\n..."
            }
            rows={16}
            style={{
              backgroundColor: "#1e1e2e",
              borderColor: "#45475a",
              color: "#cdd6f4",
            }}
          />
        </CardContent>
      </Card>

      {/* Target Roles & Archetypes */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <CardTitle className="text-[#cdd6f4]">
            Target Roles & Archetypes
          </CardTitle>
          <CardDescription className="text-[#a6adc8]">
            The roles and professional archetypes you are targeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Roles */}
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
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
              <Button
                type="button"
                onClick={addRole}
                style={{ backgroundColor: "#89b4fa", color: "#1e1e2e" }}
              >
                Add
              </Button>
            </div>
            {form.targetRoles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.targetRoles.map((role, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                    style={{
                      backgroundColor: "#45475a",
                      color: "#cdd6f4",
                    }}
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
          <div
            className="space-y-3 pt-4"
            style={{ borderTopColor: "#45475a", borderTopWidth: 1 }}
          >
            <Label style={{ color: "#cdd6f4" }}>Archetypes</Label>
            {form.archetypes.map((arch, i) => (
              <div
                key={i}
                className="grid grid-cols-1 items-end gap-2 rounded-lg p-3 sm:grid-cols-[1fr_auto_auto_auto]"
                style={{ backgroundColor: "#1e1e2e" }}
              >
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: "#a6adc8" }}>
                    Name
                  </Label>
                  <Input
                    value={arch.name}
                    onChange={(e) =>
                      updateArchetype(i, "name", e.target.value)
                    }
                    placeholder="e.g. Full-Stack Builder"
                    style={{
                      backgroundColor: "#313244",
                      borderColor: "#45475a",
                      color: "#cdd6f4",
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: "#a6adc8" }}>
                    Level
                  </Label>
                  <Select
                    value={arch.level}
                    onValueChange={(v) => updateArchetype(i, "level", v ?? "")}
                  >
                    <SelectTrigger
                      className="w-[120px]"
                      style={{
                        backgroundColor: "#313244",
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
                      {[
                        "Junior",
                        "Mid",
                        "Senior",
                        "Staff",
                        "Lead",
                        "Director",
                      ].map((lvl) => (
                        <SelectItem
                          key={lvl}
                          value={lvl}
                          style={{ color: "#cdd6f4" }}
                        >
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: "#a6adc8" }}>
                    Fit
                  </Label>
                  <Select
                    value={arch.fit}
                    onValueChange={(v) => updateArchetype(i, "fit", v ?? "")}
                  >
                    <SelectTrigger
                      className="w-[130px]"
                      style={{
                        backgroundColor: "#313244",
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
                      {["primary", "secondary", "adjacent"].map((f) => (
                        <SelectItem
                          key={f}
                          value={f}
                          style={{ color: "#cdd6f4" }}
                        >
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
              style={{
                borderColor: "#45475a",
                color: "#cdd6f4",
                backgroundColor: "transparent",
              }}
            >
              Add Archetype
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card className="bg-[#313244] border-[#45475a]">
        <CardHeader>
          <CardTitle className="text-[#cdd6f4]">Compensation</CardTitle>
          <CardDescription className="text-[#a6adc8]">
            Set your compensation expectations and flexibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>Target Range</Label>
              <Input
                value={form.compensation.targetRange}
                onChange={(e) => updateComp("targetRange", e.target.value)}
                placeholder="$90K-130K"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#cdd6f4" }}>Minimum</Label>
              <Input
                value={form.compensation.minimum}
                onChange={(e) => updateComp("minimum", e.target.value)}
                placeholder="$85K"
                style={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#45475a",
                  color: "#cdd6f4",
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label style={{ color: "#cdd6f4" }}>Currency</Label>
            <Select
              value={form.compensation.currency}
              onValueChange={(v) => updateComp("currency", v ?? "")}
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
              value={form.compensation.locationFlexibility}
              onChange={(e) =>
                updateComp("locationFlexibility", e.target.value)
              }
              placeholder="Open to remote, hybrid in SF Bay Area, willing to relocate to NYC..."
              rows={4}
              style={{
                backgroundColor: "#1e1e2e",
                borderColor: "#45475a",
                color: "#cdd6f4",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-end pb-8">
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: "#a6e3a1", color: "#1e1e2e" }}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
