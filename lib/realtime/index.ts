/**
 * Admin canlı sipariş katmanı.
 * İlk sürümde polling kullanılır. İleride WebSocket / Pusher / Supabase
 * Realtime ile değiştirmek için bu arayüzü koruyun.
 */
export type LiveEvent =
  | { type: "order.created"; payload: { id: string; tableNumber?: number; total: string } }
  | { type: "order.updated"; payload: { id: string } }
  | { type: "waiter.created"; payload: { id: string; tableNumber?: number } };

export const LIVE_POLL_INTERVAL_MS = 7000;

export function playNewOrderTone() {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.value = 0.06;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}
