/**
 * Admin canlı sipariş / garson bildirim katmanı.
 * Polling tabanlı; WebSocket’e geçerken bu arayüz korunur.
 */
export type LiveEvent =
  | { type: "order.created"; payload: { id: string; tableNumber?: number; total: string } }
  | { type: "order.updated"; payload: { id: string } }
  | { type: "waiter.created"; payload: { id: string; tableNumber?: number } };

export const LIVE_POLL_INTERVAL_MS = 5000;

/** Yeni sipariş / garson çağrısında ~5 saniye zil. */
export function playAlertBell(durationMs = 5000) {
  if (typeof window === "undefined") return;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const started = ctx.currentTime;
  const end = started + durationMs / 1000;

  function beep(at: number, freq: number, len = 0.16) {
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

  window.setTimeout(() => {
    void ctx.close().catch(() => undefined);
  }, durationMs + 400);
}

/** Geriye uyumluluk */
export function playNewOrderTone() {
  playAlertBell(5000);
}
