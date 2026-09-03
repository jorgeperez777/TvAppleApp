import type {PlaybackStats} from './types';

/** Segundos a `m:ss` (o `h:mm:ss` si pasa de la hora). Los negativos se tratan como cero. */
export function formatClock(seconds: number): string {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Resolución y bitrate actuales; omite lo que el reproductor aún no ha reportado. */
export function describeStats({bitrate, width, height}: PlaybackStats): string {
  const parts: string[] = [];
  if (width > 0 && height > 0) {
    parts.push(`${width}×${height}`);
  }
  if (bitrate > 0) {
    parts.push(`${(bitrate / 1_000_000).toFixed(1)} Mbps`);
  }
  return parts.length > 0 ? parts.join('  ·  ') : 'Midiendo calidad…';
}
