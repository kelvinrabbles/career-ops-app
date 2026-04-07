"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e2e]">
      <div className="w-full max-w-sm rounded-lg border border-[#45475a] bg-[#313244] p-8">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Briefcase className="h-8 w-8 text-[#89b4fa]" />
          <h1 className="text-2xl font-bold text-[#cdd6f4]">CareerOps</h1>
        </div>
        <p className="mb-6 text-center text-sm text-[#a6adc8]">Create your account</p>

        {error && (
          <div className="mb-4 rounded-md bg-[#f38ba8]/10 border border-[#f38ba8]/30 px-3 py-2 text-sm text-[#f38ba8]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a6adc8] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-[#45475a] bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#a6adc8]/50 focus:border-[#89b4fa] focus:outline-none"
              placeholder="Kelvin Rabbles"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a6adc8] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-[#45475a] bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#a6adc8]/50 focus:border-[#89b4fa] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a6adc8] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-md border border-[#45475a] bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#a6adc8]/50 focus:border-[#89b4fa] focus:outline-none"
              placeholder="At least 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#a6e3a1] px-4 py-2.5 text-sm font-medium text-[#1e1e2e] transition-colors hover:bg-[#a6e3a1]/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#a6adc8]/70">
          Limited to 4 users
        </p>

        <p className="mt-4 text-center text-sm text-[#a6adc8]">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#89b4fa] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
