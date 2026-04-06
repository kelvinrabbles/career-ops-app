"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Radar, Plus, ExternalLink } from "lucide-react";

interface Portal {
  id: string;
  name: string;
  careersUrl: string;
  scanMethod: string;
  notes: string;
  enabled: boolean;
}

interface ScanResult {
  id: string;
  title: string;
  url: string;
  company: string;
  firstSeen: string;
  status: string;
}

export default function ScannerPage() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPortal, setNewPortal] = useState({ name: "", careersUrl: "", notes: "" });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetch("/api/scanner/portals").then((r) => r.json()).then(setPortals);
    fetch("/api/scanner/results").then((r) => r.json()).then(setResults);
  }, []);

  async function addPortal() {
    if (!newPortal.name || !newPortal.careersUrl) return;
    const res = await fetch("/api/scanner/portals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPortal),
    });
    if (res.ok) {
      const portal = await res.json();
      setPortals([...portals, portal]);
      setNewPortal({ name: "", careersUrl: "", notes: "" });
      setShowAdd(false);
    }
  }

  async function runScan() {
    setLoading(true);
    try {
      const res = await fetch("/api/scanner/run", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Portal Scanner</h1>
          <p className="text-[#a6adc8]">Search company career pages for new job postings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdd(!showAdd)}
            className="border-[#45475a] text-[#cdd6f4] hover:bg-[#45475a]"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Portal
          </Button>
          <Button
            onClick={runScan}
            disabled={loading}
            className="bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#89b4fa]/80"
          >
            <Radar className="mr-2 h-4 w-4" />
            {loading ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Add Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#a6adc8]">Company Name</Label>
                <Input
                  value={newPortal.name}
                  onChange={(e) => setNewPortal({ ...newPortal, name: e.target.value })}
                  className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4]"
                  placeholder="e.g., Anthropic"
                />
              </div>
              <div>
                <Label className="text-[#a6adc8]">Careers URL</Label>
                <Input
                  value={newPortal.careersUrl}
                  onChange={(e) => setNewPortal({ ...newPortal, careersUrl: e.target.value })}
                  className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4]"
                  placeholder="e.g., https://job-boards.greenhouse.io/anthropic"
                />
              </div>
            </div>
            <div>
              <Label className="text-[#a6adc8]">Notes</Label>
              <Input
                value={newPortal.notes}
                onChange={(e) => setNewPortal({ ...newPortal, notes: e.target.value })}
                className="bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4]"
                placeholder="Optional notes about this company"
              />
            </div>
            <Button onClick={addPortal} className="bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80">
              Save Portal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Portals Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {portals.map((portal) => (
          <Card key={portal.id} className="bg-[#313244] border-[#45475a]">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#cdd6f4]">{portal.name}</h3>
                  <p className="text-xs text-[#a6adc8] truncate max-w-[200px]">{portal.careersUrl}</p>
                </div>
                <Badge
                  variant="outline"
                  className={portal.enabled ? "border-[#a6e3a1]/30 text-[#a6e3a1]" : "border-[#a6adc8]/30 text-[#a6adc8]"}
                >
                  {portal.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
              {portal.notes && <p className="mt-2 text-xs text-[#a6adc8]">{portal.notes}</p>}
              <Badge variant="outline" className="mt-2 border-[#89b4fa]/30 text-[#89b4fa] text-xs">
                {portal.scanMethod}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {portals.length === 0 && (
          <p className="col-span-full text-center text-[#a6adc8] py-8">
            No portals configured. Add some company career pages to start scanning.
          </p>
        )}
      </div>

      {/* Scan Results */}
      {results.length > 0 && (
        <Card className="bg-[#313244] border-[#45475a]">
          <CardHeader>
            <CardTitle className="text-[#cdd6f4]">Scan Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between rounded-md border border-[#45475a] bg-[#1e1e2e] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[#cdd6f4]">{result.title}</p>
                    <p className="text-sm text-[#a6adc8]">{result.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        result.status === "added"
                          ? "border-[#a6e3a1]/30 text-[#a6e3a1]"
                          : "border-[#a6adc8]/30 text-[#a6adc8]"
                      }
                    >
                      {result.status}
                    </Badge>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#89b4fa] hover:text-[#89b4fa]/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
