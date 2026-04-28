"use client";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * Tells the Farcaster client to dismiss the splash screen.
 * Must run after first paint, otherwise users see infinite loading.
 * https://miniapps.farcaster.xyz/docs/getting-started#making-your-app-display
 */
export function MiniAppReady() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await sdk.actions.ready();
        if (cancelled) return;
      } catch {
        // sdk not available outside a Farcaster client (e.g. plain browser preview)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
