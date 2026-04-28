import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "closed";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function formatPercent(p: number): string {
  return `${Math.round(p * 100)}%`;
}

export function shortFid(fid: number): string {
  return `fid:${fid}`;
}

/**
 * Resolves the public origin of this deployment.
 * Order of precedence:
 *   1. NEXT_PUBLIC_URL — explicit override (use this for custom domains)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — set by Vercel for the prod alias
 *   3. VERCEL_URL — set by Vercel per-deployment (preview / branch URLs)
 *   4. localhost fallback for local dev
 *
 * On Vercel this means a fresh import → click Deploy → it just works,
 * even before you set NEXT_PUBLIC_URL manually.
 */
export function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const prodAlias = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodAlias) return `https://${prodAlias}`;

  const deploymentUrl = process.env.VERCEL_URL;
  if (deploymentUrl) return `https://${deploymentUrl}`;

  return "http://localhost:3000";
}
