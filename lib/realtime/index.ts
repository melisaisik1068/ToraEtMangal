/**
 * Admin canlı sipariş / garson bildirim katmanı.
 * Polling tabanlı; WebSocket’e geçerken bu arayüz korunur.
 */
export type LiveEvent =
  | { type: "order.created"; payload: { id: string; tableNumber?: number; total: string } }
  | { type: "order.updated"; payload: { id: string } }
  | { type: "waiter.created"; payload: { id: string; tableNumber?: number } };

export const LIVE_POLL_INTERVAL_MS = 5000;
export const ALERT_BELL_MS = 10_000;

type BellHandle = { stop: () => void };

let activeBell: BellHandle | null = null;

/** Yeni sipariş / garson çağrısında zil. Varsayılan 10 sn. */
export function playAlertBell(durationMs = ALERT_BELL_MS): BellHandle {
  if (typeof window === "undefined") {
    return { stop: () => undefined };
  }

  stopAlertBell();

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const started = ctx.currentTime;
  const end = started + durationMs / 1000;
  let stopped = false;

  function beep(at: number, freq: number, len = 0.16) {
    if (stopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.12, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + len + 0.02);
  }

  let t = started;
  let i = 0;
  while (t < end) {
    beep(t, i % 2 === 0 ? 880 : 1175, 0.14);
    t += 0.45;
    i += 1;
  }

  const closer = window.setTimeout(() => {
    if (!stopped) void ctx.close().catch(() => undefined);
    if (activeBell === handle) activeBell = null;
  }, durationMs + 400);

  const handle: BellHandle = {
    stop: () => {
      stopped = true;
      window.clearTimeout(closer);
      void ctx.close().catch(() => undefined);
      if (activeBell === handle) activeBell = null;
    },
  };

  activeBell = handle;
  return handle;
}

export function stopAlertBell() {
  activeBell?.stop();
  activeBell = null;
}

/** Geriye uyumluluk */
export function playNewOrderTone() {
  playAlertBell(ALERT_BELL_MS);
}
