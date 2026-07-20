"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Scale,
  Search,
  FileText,
  Gavel,
  BookOpen,
  PenTool,
  Database,
  LayoutDashboard,
} from "lucide-react";

const NAV = [
  { href: "/juridisch", label: "Dashboard", icon: LayoutDashboard },
  { href: "/juridisch/definities", label: "Definitie zoeken", icon: BookOpen },
  { href: "/juridisch/casus", label: "Analyseer casus", icon: FileText },
  { href: "/juridisch/jurisprudentie", label: "Jurisprudentie", icon: Gavel },
  { href: "/juridisch/wetgeving", label: "Wetgeving", icon: Scale },
  { href: "/juridisch/claim", label: "Claim genereren", icon: PenTool },
  { href: "/juridisch/bronnen", label: "Bronstatus", icon: Database },
];

export function JuridischHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/juridisch" className="flex items-center gap-2 font-semibold text-lg">
            <Scale className="h-6 w-6 text-[hsl(var(--legal-primary))]" />
            Juridisch Onderzoeksplatform
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === href
                    ? "bg-[hsl(var(--legal-primary))] text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <nav className="flex md:hidden gap-1 overflow-x-auto pb-2">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs",
                pathname === href ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
