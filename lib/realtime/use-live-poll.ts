"use client";

import { useEffect, useRef } from "react";
import { LIVE_POLL_INTERVAL_MS } from "@/lib/realtime";

/**
 * Sekme gizliyken duran, üst üste binmeyen canlı poll.
 * callback referansı değişse bile son çağrıyı kullanır.
 */
export function useLivePoll(
  callback: () => void | Promise<void>,
  intervalMs: number = LIVE_POLL_INTERVAL_MS,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;

    const run = async () => {
      if (cancelled || inFlight) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        await cbRef.current();
      } catch {
        // ağ hatalarında sessizce sonraki tura bırak
      } finally {
        inFlight = false;
      }
    };

    const schedule = () => {
      if (cancelled) return;
      window.clearTimeout(timer);
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      timer = setTimeout(async () => {
        await run();
        schedule();
      }, intervalMs);
    };

    void run().then(schedule);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void run().then(schedule);
      } else {
        window.clearTimeout(timer);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);
}
