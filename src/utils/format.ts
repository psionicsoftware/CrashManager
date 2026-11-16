import { PoolTable } from '../types/billiards';

/**
 * Formats integer currency using Argentine/Latin dot thousands separator (e.g. $14.000)
 */
export function formatCurrency(amount: number): string {
  const abs = Math.round(Math.abs(amount));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Formats seconds into HH:MM:SS
 */
export function formatHMS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Formats minutes into '1h 30m'
 */
export function formatDurationHm(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
}

/**
 * Computes current accrued table time charge + bar/cantina total
 */
export function computeTableBilling(table: PoolTable) {
  const ordersSubtotal = table.orders.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  if (table.status === 'libre' || table.status === 'mantenimiento' || table.status === 'reservada') {
    return {
      tableCharge: 0,
      ordersSubtotal,
      discount: 0,
      total: ordersSubtotal,
      perPlayer: 0,
    };
  }

  const bookedHours = Math.max(0.5, table.bookedDurationSeconds / 3600);
  const baseBookedCharge = Math.round(bookedHours * table.hourlyRate);
  // Overtime billed in 15-minute blocks or pro-rata per minute
  const overtimeCharge =
    table.overtimeSeconds > 0
      ? Math.round((table.overtimeSeconds / 3600) * table.hourlyRate)
      : 0;

  const tableCharge = baseBookedCharge + overtimeCharge;
  const discount = table.discountAmount || 0;
  const total = Math.max(0, tableCharge + ordersSubtotal - discount);
  const playerCount = Math.max(1, table.players.length);
  const perPlayer = Math.round(total / playerCount);

  return {
    tableCharge,
    ordersSubtotal,
    discount,
    total,
    perPlayer,
  };
}

/**
 * Adds minutes to an HH:MM string
 */
export function addMinutesToTimeStr(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  const total = (h * 60 + m + minutesToAdd) % (24 * 60);
  const nextH = Math.floor(total / 60);
  const nextM = total % 60;
  return `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
}

/**
 * Exports rows to CSV and triggers browser download
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent =
    '\uFEFF' +
    [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
