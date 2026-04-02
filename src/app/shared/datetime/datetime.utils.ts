/** yyyy-MM-dd en zona local (sin UTC). */
export function formatDateToYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Interpreta yyyy-MM-dd como fecha local a medianoche. */
export function parseYmdToDate(ymd: string): Date | null {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return null;
  }
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * Combina fecha local + "HH:mm" → "yyyy-MM-ddTHH:mm:ss" para APIs que esperan local ISO.
 */
export function combineDateAndTimeToLocalIso(date: Date, timeHHmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec((timeHHmm || '00:00').trim());
  const hh = m ? Math.min(23, Math.max(0, parseInt(m[1], 10))) : 0;
  const mm = m ? Math.min(59, Math.max(0, parseInt(m[2], 10))) : 0;
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const H = String(d.getHours()).padStart(2, '0');
  const M = String(d.getMinutes()).padStart(2, '0');
  const S = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${mo}-${day}T${H}:${M}:${S}`;
}

/** Desde string ISO o similar → fecha calendario local + "HH:mm". */
export function splitApiDateTimeToDateAndTime(iso: string): { date: Date | null; time: string } {
  if (!iso?.trim()) {
    return { date: null, time: '09:00' };
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: null, time: '09:00' };
  }
  const plain = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return { date: plain, time: `${hh}:${mm}` };
}

export function buildQuarterHourSlots(fromHour = 6, toHour = 22): string[] {
  const out: string[] = [];
  for (let h = fromHour; h <= toHour; h++) {
    for (const min of [0, 15, 30, 45]) {
      if (h === toHour && min > 0) {
        break;
      }
      out.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
  }
  return out;
}
