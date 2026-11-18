"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChefHat,
  Sparkles,
  BookOpen,
  Settings,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/setup";

  useEffect(() => {
    if (isAuthPage) {
      setCheckingAuth(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    verify();
  }, [pathname, isAuthPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  // If this is the login or setup page, render children directly without admin shell
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading state while verifying session
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0d02] text-[#F4EDE2] font-instrument-regular">
        <div className="mb-6">
          <img
            src="/logo/sukoon.svg"
            alt="Sukoon"
            className="h-8 md:h-9 w-auto filter drop-shadow-lg"
          />
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-[#DDB789]/30 border-t-[#DDB789] animate-spin" />
        <p className="mt-4 text-xs uppercase tracking-widest text-[#DDB789]">
          Verifying Admin Session...
        </p>
      </div>
    );
  }

  // If not authenticated and not yet redirected
  if (!authenticated) {
    return null;
  }

  const navLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "All Blogs",
      href: "/admin/blogs",
      icon: FileText,
      active: pathname === "/admin/blogs",
    },
    {
      label: "Create Blog",
      href: "/admin/blogs/new",
      icon: PlusCircle,
      active: pathname === "/admin/blogs/new",
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#0c0d02] text-[#F4EDE2] font-instrument-regular selection:bg-[#DDB789]/30 selection:text-[#F4EDE2]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex-col justify-between border-r border-[#DDB789]/15 bg-[#141604] p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full lg:flex hidden"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo and close button for mobile */}
            <div className="flex items-center justify-between pb-6 border-b border-[#DDB789]/10">
              <Link
                href="/admin"
                className="flex flex-col gap-2 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <img
                    src="/logo/sukoon.svg"
                    alt="Sukoon"
                    className="h-7 w-auto object-contain filter drop-shadow-sm group-hover:brightness-110 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#DDB789] font-medium bg-[#DDB789]/15 px-2.5 py-0.5 rounded-full border border-[#DDB789]/25">
                    Admin Portal
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 text-[#F4EDE2]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Navigation */}
            <div className="mt-6">
              <div className="text-[10px] uppercase tracking-wider text-[#F4EDE2]/40 font-semibold px-3 mb-2">
                Editorial & Management
              </div>
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        item.active
                          ? "bg-[#DDB789] text-[#141604] font-semibold shadow-md"
                          : "text-[#F4EDE2]/70 hover:bg-[#1d2005] hover:text-[#F4EDE2]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.active ? "text-[#141604]" : "text-[#DDB789]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Links Section */}
            <div className="mt-8 pt-6 border-t border-[#DDB789]/10">
              <div className="text-[10px] uppercase tracking-wider text-[#F4EDE2]/40 font-semibold px-3 mb-2">
                Public Website
              </div>
              <div className="space-y-1">
                <Link
                  href="/blogs"
                  target="_blank"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#F4EDE2]/70 hover:bg-[#1d2005] hover:text-[#DDB789] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#DDB789]" />
                    <span>View Public Blogs</span>
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#F4EDE2]/70 hover:bg-[#1d2005] hover:text-[#DDB789] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ChefHat className="w-3.5 h-3.5 text-[#DDB789]" />
                    <span>View Restaurant Site</span>
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              </div>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="pt-4 border-t border-[#DDB789]/10">
            <div className="p-3 bg-[#1a1d04] rounded-xl border border-[#DDB789]/15 flex items-center justify-between">
              <Link
                href="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-[#DDB789]/20 border border-[#DDB789]/40 flex items-center justify-center text-[#DDB789] text-xs font-bold shrink-0 group-hover:border-[#DDB789]">
                  SK
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-[#F4EDE2] truncate group-hover:text-[#DDB789] transition-colors">
                    Admin Editor
                  </div>
                  <div className="text-[10px] text-[#DDB789] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Super Admin</span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  title="Account & Password Settings"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    pathname === "/admin/settings"
                      ? "bg-[#DDB789] text-[#141604]"
                      : "text-[#F4EDE2]/60 hover:text-[#DDB789] hover:bg-[#1d2005]"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of Admin Portal"
                  className="p-1.5 text-[#F4EDE2]/60 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#DDB789]/15 bg-[#121404]/90 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#F4EDE2]/70 hover:text-white lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <img src="/logo/sukoon.svg" alt="Sukoon" className="h-5 w-auto" />
              <span className="text-[9px] uppercase tracking-wider text-[#DDB789] bg-[#DDB789]/15 px-2 py-0.5 rounded-full border border-[#DDB789]/20 font-semibold">
                Admin
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#F4EDE2]/50">
              <Link href="/admin" className="hover:text-[#DDB789] transition-colors flex items-center gap-1.5">
                <img src="/logo/sukoon.svg" alt="Sukoon" className="h-3.5 w-auto opacity-70 hover:opacity-100 transition-opacity" />
              </Link>
              <span>/</span>
              <span className="text-[#DDB789] font-medium capitalize">
                {pathname.replace("/admin/", "").replace("/admin", "Overview") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/blogs/new"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDB789] hover:bg-[#e6c499] text-[#141604] font-medium text-xs shadow-md transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Write Blog</span>
            </Link>
            <Link
              href="/blogs"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DDB789]/30 text-xs text-[#F4EDE2]/80 hover:border-[#DDB789] hover:text-[#DDB789] transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
