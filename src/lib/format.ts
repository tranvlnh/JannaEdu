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
