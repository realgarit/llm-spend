import { cache } from "react";

// A single server-render timestamp keeps the static HTML and hydration basis
// consistent across all pricing components in the same render.
export const getServerNow = cache(() => Date.now());
