"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, ChefHat, UserPlus } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/admin/setup");
        const data = await res.json();
        setHasUsers(Boolean(data.hasUsers));
      } catch {
        setHasUsers(true);
      }
    };
    checkSetup();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#121404] via-[#1d2002] to-[#2b1003] px-4 py-12 relative overflow-hidden font-instrument-regular">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DDB789]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#481904]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
            <img
              src="/logo/sukoon.svg"
              alt="Sukoon"
              className="h-8 md:h-9 mx-auto filter drop-shadow-md"
            />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs tracking-widest uppercase text-[#DDB789] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#DDB789]" />
            <span>Management & Editorial Portal</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-charman-serif-light text-[#F4EDE2]">
            Admin Sign In
          </h1>
          <p className="mt-1 text-xs text-[#F4EDE2]/60">
            Publish stories, curate menu updates, and manage the Sukoon journal.
          </p>
        </div>

        {/* First-time setup banner if database has 0 users */}
        {hasUsers === false && (
          <div className="mb-6 p-4 bg-[#282a06] border border-[#DDB789]/40 rounded-2xl text-xs space-y-2 shadow-lg">
            <div className="flex items-center gap-2 text-[#DDB789] font-semibold">
              <UserPlus className="w-4 h-4" />
              <span>Initial Setup Required</span>
            </div>
            <p className="text-[#F4EDE2]/80 leading-relaxed">
              No administrator account exists in the database yet. Create your administrator account to get started.
            </p>
            <Link
              href="/admin/setup"
              className="inline-flex items-center gap-1.5 text-xs text-[#141604] bg-[#DDB789] font-semibold px-4 py-1.5 rounded-full hover:bg-[#e8c99e] transition-colors mt-1"
            >
              <span>Create Admin Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Card */}
        <div className="bg-[#181a05]/90 border border-[#DDB789]/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
              <span className="text-red-400 font-bold shrink-0">✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] mb-1.5 font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sukoon.com.au"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1002] border border-[#DDB789]/30 rounded-xl text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789] focus:ring-1 focus:ring-[#DDB789] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1002] border border-[#DDB789]/30 rounded-xl text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789] focus:ring-1 focus:ring-[#DDB789] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#DDB789] to-[#c9a06e] hover:from-[#e5c49b] hover:to-[#dbb27e] text-[#1d2002] font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#1d2002] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Public Site link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#F4EDE2]/60 hover:text-[#DDB789] transition-colors inline-flex items-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Return to Public Restaurant Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
