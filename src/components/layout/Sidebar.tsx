"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import LanguageSwitcherSimple from "@/components/LanguageSwitcherSimple";
import { PowerExhaustLogo } from "@/components/ui/Logo";
import {
  LayoutDashboard, Wrench, FileText, Settings, Users, Tag,
  LogOut, Menu, X, MessageCircle, type LucideIcon
} from "lucide-react";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mes rachats", href: "/rachats", icon: Wrench },
  { label: "Attestations", href: "/attestations", icon: FileText },
];

const adminItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Admin - Rachats", href: "/admin/rachats", icon: Settings },
  { label: "Admin - Documents", href: "/admin/documents", icon: FileText },
  { label: "Admin - Attestations", href: "/admin/attestations", icon: FileText },
  { label: "Admin - Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Catalogue & Prix", href: "/admin/catalogue", icon: Tag },
  { label: "Chat clients", href: "/admin/chat", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-exhaust-dark border-r border-white/5">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <PowerExhaustLogo size="sm" href="/" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {isAdmin && (
          <>
            <div className="border-t border-white/5 my-4" />
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
              Administration
            </p>
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-exhaust-orange flex items-center justify-center text-white text-sm font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {session?.user?.name ?? "Utilisateur"}
            </p>
            <p className="text-gray-400 text-xs truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: { label: string; href: string; icon: LucideIcon };
  pathname: string;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
        isActive
          ? "bg-exhaust-orange/20 text-white font-semibold border border-exhaust-orange/30"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
    </Link>
  );
}

// ─── Header mobile ────────────────────────────
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="md:hidden bg-exhaust-dark text-white sticky top-0 z-50 border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        <PowerExhaustLogo size="sm" href="/" />
        <div className="flex items-center gap-2">
          <LanguageSwitcherSimple />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="px-4 pb-4 space-y-1 border-t border-white/5 pt-3">
          {[...navItems, ...(isAdmin ? adminItems : [])].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
                  pathname === item.href
                    ? "bg-exhaust-orange/20 text-white font-semibold"
                    : "text-gray-400"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-400 text-sm"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </nav>
      )}
    </header>
  );
}
