"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Activity, BarChart2, Info, ExternalLink } from "lucide-react";

const links = [
  { href: "/",           label: "Pipeline",  icon: Activity },
  { href: "/trading",    label: "Trading",   icon: BarChart2 },
  { href: "/analytics",  label: "Analytics", icon: Database },
  { href: "/about",      label: "About",     icon: Info },
];

const ext = [
  { href: "https://grafana.gabyer.dev",  label: "Grafana" },
  { href: "https://github.com/GabYer/de-portfolio", label: "GitHub" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-800 bg-[#0f1117]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
            <Database className="h-4 w-4 text-orange-400" />
          </div>
          <span className="font-bold text-white tracking-tight">
            gabyer<span className="text-orange-400">.dev</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* External links */}
        <div className="hidden md:flex items-center gap-2">
          {ext.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-400 border border-slate-700 hover:border-orange-500/50 hover:text-orange-400 transition-all"
            >
              {label}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
