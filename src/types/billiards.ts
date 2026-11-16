export type TableStatus =
  | 'en_juego'
  | 'libre'
  | 'por_terminar'
  | 'cumplido'
  | 'reservada'
  | 'mantenimiento';

export type NavView = 'tablero' | 'analiticas' | 'historial';

export type PaymentMethod = 'Efectivo' | 'Mercado Pago QR' | 'Tarjeta Débito';

export type AnalyticsPeriod = 'Hoy' | 'Ayer' | 'Esta Semana' | 'Este Mes';

export interface Player {
  id: string;
  name: string;
  initials: string;
  role: 'Titular' | 'Invitado';
  phone?: string;
  paid: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  servedAt: string;
  servedBy: string;
  category: 'Bebidas' | 'Picadas' | 'Minutas';
  note?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Bebidas' | 'Picadas' | 'Minutas';
}

export interface PoolTable {
  id: number;
  code: string; // e.g. '01', '02'
  name: string; // e.g. 'Mesa 01'
  zone: string; // e.g. 'Standard 8ft', 'Tournament 9ft', 'VIP Lounge Slate', 'Snooker Pro'
  status: TableStatus;
  hourlyRate: number;
  isVip?: boolean;
  isPaused?: boolean;
  // Active / Ending / Overtime session data
  attendant?: string;
  attendantCode?: string;
  startTimeStr?: string; // '16:30'
  endTimeStr?: string; // '17:30'
  remainingSeconds: number; // > 0 when counting down
  elapsedSeconds: number;
  overtimeSeconds: number; // > 0 when status === 'cumplido'
  bookedDurationSeconds: number;
  discountAmount: number;
  players: Player[];
  orders: OrderItem[];
  // Reservation fields
  reservationName?: string;
  reservationTime?: string; // '17:30 hs'
  reservationEtaMinutes?: number;
  // Maintenance fields
  maintenanceReason?: string;
  maintenanceTech?: string;
  maintenanceEstEnd?: string;
  // Analytics metadata for today
  todayHours: number;
  todayOccupancyPct: number;
  todayRevenue: number;
  promoActive?: boolean;
}

export interface SessionTicket {
  id: string; // e.g. '#T-1057'
  time: string; // '20:38 hs'
  tableCode: string; // '04'
  tableName: string; // 'Mesa 04'
  tableZone: string; // 'Tournament 9ft'
  durationLabel: string; // '1h 30m'
  durationMinutes: number;
  durationSubtext: string; // '30m excedente'
  cantinaSummary: string; // '2 Cervezas IPA + 1 Maní'
  cantinaAmount: number;
  tableAmount: number;
  tableAmountNote: string; // 'Mesa $10.500 + Bar $6.500'
  paymentMethod: PaymentMethod;
  totalAmount: number;
  operator: string;
}

export interface CashMovement {
  id: string;
  type: 'egreso' | 'ingreso';
  description: string;
  amount: number;
  time: string;
  operator: string;
}

export interface Operator {
  id: string;
  name: string;
  shortName: string;
  email: string;
  role: string;
  shift: string;
  initials: string;
}
