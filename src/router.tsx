import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

// Mirrors vite.config.ts's VITE_BASE_PATH via Vite's own BASE_URL (always set,
// always trailing-slash) so the client/SSR router matches whatever subpath
// this build was mounted at ("/" by default, e.g. "/retail" for a multi-zone
// rewrite target).
const basepath = import.meta.env.BASE_URL.replace(/\/+$/, "") || undefined;

export function getRouter() {
  return createRouter({ routeTree, defaultErrorComponent: AppErrorComponent, basepath });
}
