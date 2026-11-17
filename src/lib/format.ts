// Định dạng cố định múi giờ VN — server và client ra cùng chuỗi (không lệch hydration).
const TZ = "Asia/Ho_Chi_Minh";

const dateFmt = new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });

/** "2026-11-10" → "10/11/2026" */
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
/** ISO → "19:30" */
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
/** 7 → "7.0" */
export const band = (n: number) => n.toFixed(1);

/** Giây → "mm:ss" (hoặc "h:mm:ss"). Âm → 00:00. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const mmss = `${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return h ? `${h}:${mmss}` : mmss;
}
