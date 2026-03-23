"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";

type NavLink = { label: string; href: string };

function getLinks(session: Session | null): {
  left: NavLink[];
  right: NavLink[];
} {
  if (!session) {
    return {
      left: [
        { label: "Accueil", href: "/" },
        { label: "Établissements", href: "/etablissements" },
      ],
      right: [
        { label: "Contact", href: "/contact" },
        { label: "Connexion", href: "/login" },
        { label: "Inscription", href: "/register" },
      ],
    };
  }

  const role = session.user.role;

  if (role === "admin") {
    return {
      left: [{ label: "Accueil", href: "/" }],
      right: [{ label: "Admin", href: "/admin/etablissements" }],
    };
  }

  if (role === "manager") {
    return {
      left: [{ label: "Accueil", href: "/" }],
      right: [{ label: "Mes suites", href: "/manager/suites" }],
    };
  }

  return {
    left: [
      { label: "Accueil", href: "/" },
      { label: "Établissements", href: "/etablissements" },
    ],
    right: [
      { label: "Mes réservations", href: "/client/reservation" },
      { label: "Contact", href: "/contact" },
    ],
  };
}

export default function NavbarClient({
  session,
}: {
  session: Session | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { left, right } = getLinks(session);
  const allLinks = [...left, ...right];

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const isHome = pathname === "/";

  const linkClass = (href: string) =>
    isActive(href)
      ? "text-icon transition-colors"
      : isHome
        ? "text-white/80 hover:text-icon transition-colors"
        : "text-foreground/70 hover:text-icon transition-colors";

  const btnClass = isHome
    ? "text-white/80 hover:text-icon transition-colors"
    : "text-foreground/70 hover:text-icon transition-colors";

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-20">
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {left.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="shrink-0 hover:scale-110 transition-transform duration-300">
          <Image
            src="/images/logo-cl.png"
            alt="Clair de Lune"
            width={80}
            height={55}
            className="object-contain"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center justify-end gap-6 flex-1">
          {right.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {session && (
            <button onClick={handleSignOut} className={btnClass}>
              Déconnexion
            </button>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden ${isHome ? "text-white/80" : "text-foreground/70"}`}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-foreground/90 backdrop-blur-sm px-4 py-4 flex flex-col gap-4">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
          {session && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleSignOut();
              }}
              className={`${btnClass} text-left`}
            >
              Déconnexion
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
