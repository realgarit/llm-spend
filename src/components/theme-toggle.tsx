"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "llm-spend-theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(KEY) as Theme | null;
      } catch {
        return null;
      }
    })();
    setTheme(stored ?? systemTheme());
  }, []);

  function toggle() {
    const next: Theme = (theme ?? systemTheme()) === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  const isDark = (theme ?? "dark") === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="btn"
      style={{ padding: "0.45rem 0.55rem" }}
    >
      {/* Render nothing meaningful until mounted to avoid hydration mismatch. */}
      <span aria-hidden className="mono" style={{ fontSize: "0.9rem", width: "1rem", display: "inline-block", textAlign: "center" }}>
        {theme === null ? "" : isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
