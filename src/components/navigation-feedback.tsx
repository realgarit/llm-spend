"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Gives client-side navigations immediate visual feedback while the route's
 * RSC payload is in flight. The static app otherwise keeps the old page
 * mounted until that payload arrives, which can look like a missed click on
 * a slow or cold hosting path.
 */
export function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let destination: URL;
      try {
        destination = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      setPending(true);
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, []);

  useEffect(() => {
    if (!pending) return;
    const timeout = window.setTimeout(() => setPending(false), 15_000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  if (!pending) return null;

  return (
    <div className="navigation-feedback" role="status" aria-live="polite">
      <span className="visually-hidden">Loading the next page</span>
    </div>
  );
}
