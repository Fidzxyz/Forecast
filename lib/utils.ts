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

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
