"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (data.email) {
          setCurrentEmail(data.email);
        }
      } catch {
        // ignore
      }
    };
    fetchMe();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to change password.");
        setLoading(false);
        return;
      }

      setSuccess("Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-instrument-regular">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDB789]/15">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-[#141604] border border-[#DDB789]/20 text-[#F4EDE2]/70 hover:text-[#DDB789] hover:border-[#DDB789] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-charman-serif-light text-[#F4EDE2]">
              Account & Security
            </h1>
            <p className="text-xs sm:text-sm text-[#F4EDE2]/60 mt-0.5">
              Manage your administrator credentials and security preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Change Password Form (7 cols) */}
        <div className="md:col-span-7 bg-[#141604] border border-[#DDB789]/15 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#DDB789]/10">
            <div className="w-9 h-9 rounded-xl bg-[#DDB789]/15 border border-[#DDB789]/30 flex items-center justify-center text-[#DDB789]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-charman-serif-light text-[#F4EDE2]">
                Change Password
              </h2>
              <p className="text-xs text-[#F4EDE2]/50">
                Update your administrator login password
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] font-medium mb-1.5">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0c0d02] border border-[#DDB789]/25 rounded-xl text-xs sm:text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="p-1 text-[#F4EDE2]/50 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] font-medium mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0c0d02] border border-[#DDB789]/25 rounded-xl text-xs sm:text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="p-1 text-[#F4EDE2]/50 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#DDB789] font-medium mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#F4EDE2]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0c0d02] border border-[#DDB789]/25 rounded-xl text-xs sm:text-sm text-[#F4EDE2] placeholder-[#F4EDE2]/30 focus:outline-none focus:border-[#DDB789]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="p-1 text-[#F4EDE2]/50 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-[#DDB789] to-[#c9a06e] hover:from-[#e5c49b] hover:to-[#dbb27e] text-[#141604] font-semibold text-xs tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#141604] border-t-transparent rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>

        {/* Security & Account Information (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#141604] border border-[#DDB789]/15 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#DDB789] font-medium pb-3 border-b border-[#DDB789]/10">
              <ShieldCheck className="w-4 h-4 text-[#DDB789]" />
              <span>Admin Profile</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0c0d02] border border-[#DDB789]/10">
                <User className="w-4 h-4 text-[#DDB789] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[#F4EDE2]/50 text-[10px] uppercase">Active Account</div>
                  <div className="font-medium text-[#F4EDE2] truncate mt-0.5">
                    {currentEmail || "admin@sukoon.com.au"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0c0d02] border border-[#DDB789]/10">
                <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[#F4EDE2]/50 text-[10px] uppercase">Access Level</div>
                  <div className="font-medium text-emerald-400 mt-0.5">
                    Super Admin & Editorial Director
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0c0d02] border border-[#DDB789]/10">
                <CheckCircle2 className="w-4 h-4 text-[#DDB789] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[#F4EDE2]/50 text-[10px] uppercase">Session Status</div>
                  <div className="font-medium text-[#DDB789] mt-0.5">
                    Encrypted Session Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#141604] border border-[#DDB789]/15 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-[#DDB789] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#DDB789]" />
              <span>Password Guidelines</span>
            </h3>
            <ul className="text-xs text-[#F4EDE2]/70 space-y-2 leading-relaxed pt-1">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDB789] mt-1.5 shrink-0" />
                <span>Use at least 6 characters (8+ recommended for stronger security).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDB789] mt-1.5 shrink-0" />
                <span>Combine letters, numbers, and special symbols.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDB789] mt-1.5 shrink-0" />
                <span>Do not share your administrator credentials with unauthorized personnel.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
