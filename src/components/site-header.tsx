"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, site } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "color-mix(in srgb, var(--ink) 82%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-page" style={{ display: "flex", alignItems: "center", height: "3.75rem", gap: "1rem" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <span
            aria-hidden
            className="mono"
            style={{
              width: "1.6rem",
              height: "1.6rem",
              display: "grid",
              placeItems: "center",
              borderRadius: "0.4rem",
              background: "var(--brand)",
              color: "#0a0c10",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            $
          </span>
          <span style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>{site.name}</span>
        </Link>

        <nav
          aria-label="Primary"
          style={{ display: "none", gap: "0.25rem", marginLeft: "0.5rem" }}
          className="nav-desktop"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.4rem 0.7rem",
                borderRadius: "0.45rem",
                fontSize: "0.875rem",
                color: isActive(item.href) ? "var(--brand)" : "var(--text-muted)",
                background: isActive(item.href) ? "var(--brand-soft)" : "transparent",
                fontWeight: isActive(item.href) ? 600 : 500,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="btn"
            style={{ padding: "0.45rem 0.7rem", fontSize: "0.83rem" }}
          >
            GitHub
          </a>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            className="btn nav-mobile-btn"
            style={{ padding: "0.45rem 0.55rem" }}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden className="mono">{open ? "✕" : "≡"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="nav-mobile-panel" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="container-page" style={{ paddingBlock: "0.5rem", display: "flex", flexDirection: "column" }}>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  padding: "0.7rem 0.4rem",
                  borderBottom: "1px solid var(--border)",
                  color: isActive(item.href) ? "var(--brand)" : "var(--text)",
                  fontWeight: isActive(item.href) ? 600 : 500,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <style>{`
        @media (min-width: 860px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
          .nav-mobile-panel { display: none !important; }
        }
      `}</style>
    </header>
  );
}
