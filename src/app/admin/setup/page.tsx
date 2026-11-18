"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight, ShieldCheck, ChefHat } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyConfigured, setAlreadyConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/admin/setup");
        const data = await res.json();
        if (data.hasUsers) {
          setAlreadyConfigured(true);
        }
      } catch {
        // proceed
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create administrator account.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121404] text-[#F4EDE2] font-instrument-regular">
        <div className="w-8 h-8 border-2 border-[#DDB789]/30 border-t-[#DDB789] rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadyConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#121404] via-[#1d2002] to-[#2b1003] px-4 py-12 font-instrument-regular">
        <div className="w-full max-w-md bg-[#181a05] border border-[#DDB789]/20 rounded-2xl p-8 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#DDB789] mx-auto" />
          <h1 className="text-2xl font-charman-serif-light text-[#F4EDE2]">
            Admin Account Already Exists
          </h1>
          <p className="text-xs text-[#F4EDE2]/70 leading-relaxed">
            The database already has an administrator user configured. Please sign in using your existing credentials.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#DDB789] text-[#141604] font-semibold text-xs rounded-full uppercase tracking-wider"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#121404] via-[#1d2002] to-[#2b1003] px-4 py-12 relative overflow-hidden font-instrument-regular">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DDB789]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#481904]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
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
            <span>Admin Setup</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-charman-serif-light text-[#F4EDE2]">
            Create Admin Account
          </h1>
          <p className="mt-1 text-xs text-[#F4EDE2]/60">
            Set up your administrator credentials to manage Sukoon.
          </p>
        </div>

        <div className="bg-[#181a05]/95 border border-[#DDB789]/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
              <span className="text-red-400 font-bold shrink-0">✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] mb-1.5 font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sukoon Administrator"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1002] border border-[#DDB789]/30 rounded-xl text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] mb-1.5 font-medium">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@sukoon.com.au"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1002] border border-[#DDB789]/30 rounded-xl text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
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
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1002] border border-[#DDB789]/30 rounded-xl text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] mb-1.5 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1002] border border-[#DDB789]/30 rounded-xl text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
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
                  <span>Creating Administrator Account...</span>
                </>
              ) : (
                <>
                  <span>Create Admin & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/admin/login"
              className="text-xs text-[#F4EDE2]/60 hover:text-[#DDB789] transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#F4EDE2]/60 hover:text-[#DDB789] transition-colors inline-flex items-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Return to Restaurant Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
