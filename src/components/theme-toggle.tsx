"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const KEY = "llm-spend-theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readTheme(): Theme {
  const current = document.documentElement.getAttribute("data-theme");
  if (current === "dark" || current === "light") return current;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch { /* Storage may be unavailable in a private browser. */ }
  return systemTheme();
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, readTheme, () => null);

  function toggle() {
    const next: Theme = (theme ?? systemTheme()) === "dark" ? "light" : "dark";
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
