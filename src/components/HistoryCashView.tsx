import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Banknote,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Download,
  Info,
  Landmark,
  Lock,
  Printer,
  QrCode,
  Receipt,
  Search,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  CashMovement,
  PaymentMethod,
  SessionTicket,
} from '../types/billiards';
import {
  downloadCSV,
  formatCurrency,
  formatDurationHm,
} from '../utils/format';

interface HistoryCashViewProps {
  tickets: SessionTicket[];
  movements: CashMovement[];
  openingCash: number;
  onOpenMovementModal: (defaultType: 'egreso' | 'ingreso') => void;
  onOpenReceiptModal: (
    mode: 'ticket' | 'resumen_x' | 'cierre_z',
    ticket?: SessionTicket
  ) => void;
  onNotify: (msg: string) => void;
}

export const HistoryCashView: React.FC<HistoryCashViewProps> = ({
  tickets,
  movements,
  openingCash,
  onOpenMovementModal,
  onOpenReceiptModal,
  onNotify,
}) => {
  const [methodFilter, setMethodFilter] = useState<'todos' | PaymentMethod>(
    'todos'
  );
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('Hoy (24 de Mayo)');
  const [page, setPage] = useState(1);

  // Compute live financial totals from tickets + movements
  const totalCollected = tickets.reduce((s, t) => s + t.totalAmount, 0);
  const cashTickets = tickets.filter((t) => t.paymentMethod === 'Efectivo');
  const mpTickets = tickets.filter(
    (t) => t.paymentMethod === 'Mercado Pago QR'
  );
  const debitTickets = tickets.filter(
    (t) => t.paymentMethod === 'Tarjeta Débito'
  );

  const cashCollected = cashTickets.reduce((s, t) => s + t.totalAmount, 0);
  const mpCollected = mpTickets.reduce((s, t) => s + t.totalAmount, 0);
  const debitCollected = debitTickets.reduce((s, t) => s + t.totalAmount, 0);
  const digitalCollected = mpCollected + debitCollected;

  const grossTableRevenue = tickets.reduce((s, t) => s + t.tableAmount, 0);
  const grossCantinaRevenue = tickets.reduce((s, t) => s + t.cantinaAmount, 0);
  const totalMinutesPlayed = tickets.reduce((s, t) => s + t.durationMinutes, 0);

  const totalEgresos = movements
    .filter((m) => m.type === 'egreso')
    .reduce((s, m) => s + m.amount, 0);
  const totalIngresosManuales = movements
    .filter((m) => m.type === 'ingreso')
    .reduce((s, m) => s + m.amount, 0);

  const physicalDrawerTotal =
    openingCash + cashCollected + totalIngresosManuales - totalEgresos;

  const cantinaOrdersCount = tickets.filter((t) => t.cantinaAmount > 0).length;
  const avgCantinaTicket =
    cantinaOrdersCount > 0
      ? Math.round(grossCantinaRevenue / cantinaOrdersCount)
      : 0;

  // Filtered tickets
  const filtered = tickets.filter((t) => {
    const matchMethod =
      methodFilter === 'todos' || t.paymentMethod === methodFilter;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.tableName.toLowerCase().includes(q) ||
      t.tableCode.includes(q) ||
      t.operator.toLowerCase().includes(q) ||
      t.cantinaSummary.toLowerCase().includes(q);
    return matchMethod && matchQ;
  });

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageTotal = paged.reduce((s, t) => s + t.totalAmount, 0);

  // Donut chart percentages
  const safeTotal = Math.max(1, totalCollected);
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const mpLen = (mpCollected / safeTotal) * circ;
  const cashLen = (cashCollected / safeTotal) * circ;
  const debLen = (debitCollected / safeTotal) * circ;

  const handleExportReport = () => {
    downloadCSV(
      'crash-manager-historial-caja.csv',
      [
        'Ticket',
        'Hora',
        'Mesa',
        'Zona',
        'Tiempo',
        'Consumos Cantina',
        'Metodo Pago',
        'Total',
        'Operador',
      ],
      tickets.map((t) => [
        t.id,
        t.time,
        t.tableName,
        t.tableZone,
        t.durationLabel,
        t.cantinaSummary,
        t.paymentMethod,
        t.totalAmount,
        t.operator,
      ])
    );
    onNotify('Reporte de caja y sesiones exportado a CSV.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Page Title & Action Buttons */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
              Historial de Sesiones y Control de Caja
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#006948] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]" />
              Caja Abierta
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[10px] font-bold text-[#006591] uppercase">
              Turno Tarde · Carlos M.
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de cobros, arqueo de turno y registro auditado de partidas
            de billar con venta de cantina.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Reporte</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenMovementModal('ingreso')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#e1ecff] text-[#006591] text-xs font-semibold transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Movimiento Manual</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenReceiptModal('cierre_z')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cerrar Caja / Arqueo</span>
          </button>
        </div>
      </div>

      {/* Audit Info Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-5 text-slate-600">
          <span>
            Apertura:{' '}
            <strong className="font-mono text-[#0b1c30]">14:00 hs</strong>
          </span>
          <span>
            Fondo Fijo Inicial:{' '}
            <strong className="font-mono text-[#0b1c30] tabular-nums">
              {formatCurrency(openingCash)}
            </strong>
          </span>
          <span>
            Comprobantes Emitidos:{' '}
            <strong className="font-mono text-[#0b1c30]">
              {tickets[tickets.length - 1]?.id || '#T-1043'} a{' '}
              {tickets[0]?.id || '#T-1057'}
            </strong>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[11px] font-semibold text-[#006948]">
          Sincronizado POS Sala Central
        </span>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Total Recaudado Hoy</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006948] flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-3xl font-bold text-[#006948] mt-2 tabular-nums">
            {formatCurrency(totalCollected)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{tickets.length} sesiones cerradas</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
              <TrendingUp className="w-3 h-3" />
              +18% vs ayer
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Efectivo en Caja</span>
            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-3xl font-bold text-[#0b1c30] mt-2 tabular-nums">
            {formatCurrency(openingCash + cashCollected)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 tabular-nums">
            Fondo inicial {formatCurrency(openingCash)} + Cobros{' '}
            {formatCurrency(cashCollected)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Digital &amp; QR (MP/Débito)</span>
            <span className="w-7 h-7 rounded-lg bg-sky-50 text-[#006591] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-3xl font-bold text-[#006591] mt-2 tabular-nums">
            {formatCurrency(digitalCollected)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 tabular-nums">
            {mpTickets.length + debitTickets.length} transacciones acreditadas
            en cuenta
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Tiempo Jugado Liquidado</span>
            <span className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-3xl font-bold text-[#0b1c30] mt-2 tabular-nums">
            {formatDurationHm(totalMinutesPlayed)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Tarifa base $7.000/h + Excedentes
          </div>
        </div>
      </div>

      {/* Middle Bento Row: Arqueo Dinámico + Cantina & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Arqueo Dinámico del Turno Actual */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-base font-bold text-[#0b1c30]">
                <Landmark className="w-4 h-4 text-[#006948]" />
                <span>Arqueo Dinámico del Turno Actual</span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase">
                Gaveta #01
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Fondo Inicial de Apertura
                </span>
                <span className="font-mono font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(openingCash)}
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#006948]" />
                  Facturación Bruta por Mesas ({tickets.length} turnos)
                </span>
                <span className="font-mono font-bold text-[#006948] tabular-nums">
                  +{formatCurrency(grossTableRevenue)}
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Ventas Barra / Cantina (Snacks y Cervezas)
                </span>
                <span className="font-mono font-bold text-[#006591] tabular-nums">
                  +{formatCurrency(grossCantinaRevenue)}
                </span>
              </div>

              {movements.map((m) => (
                <div
                  key={m.id}
                  className={`px-3.5 py-2.5 rounded-xl flex items-center justify-between ${
                    m.type === 'egreso' ? 'bg-red-50/70' : 'bg-emerald-50/70'
                  }`}
                >
                  <span
                    className={`flex items-center gap-2.5 font-medium ${
                      m.type === 'egreso' ? 'text-red-700' : 'text-emerald-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.type === 'egreso' ? 'bg-red-500' : 'bg-emerald-600'
                      }`}
                    />
                    {m.type === 'egreso' ? 'Gasto / Egreso' : 'Ingreso Manual'} (
                    {m.description})
                  </span>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      m.type === 'egreso' ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {m.type === 'egreso' ? '-' : '+'}
                    {formatCurrency(m.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Drawer Total */}
          <div className="mt-4 p-4 rounded-2xl bg-[#eaf4ff] border border-sky-200/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Total Físico Estimado en Gaveta
              </div>
              <div className="font-mono text-2xl font-bold text-[#006948] mt-0.5 tabular-nums">
                {formatCurrency(physicalDrawerTotal)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                Fondo {formatCurrency(openingCash)} + Efectivo Cobrado{' '}
                {formatCurrency(cashCollected)} - Egresos{' '}
                {formatCurrency(totalEgresos)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenMovementModal('egreso')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#006948] shadow-2xs transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Registrar Gasto / Vale</span>
            </button>
          </div>
        </div>

        {/* Right Stack: Cantina Card + Payment Distribution */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cantina Card with custom billiards-lounge vector graphic */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#0b1c30] via-[#123348] to-[#006948] shrink-0 flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="absolute -right-3 -bottom-3 w-12 h-12 rounded-full bg-emerald-400/20" />
              <Coffee className="w-7 h-7 text-emerald-300" />
              <span className="font-mono text-[10px] font-bold mt-1 text-emerald-100">
                CANTINA
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[#006948]">
                Kiosco &amp; Bebidas
              </div>
              <h3 className="text-base font-bold text-[#0b1c30]">
                Tickets de Cantina
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {cantinaOrdersCount} comandas anexadas directamente al
                cronómetro de las mesas.
              </p>
              <div className="mt-1.5 font-mono text-xs font-bold text-[#006591] tabular-nums">
                Ticket Promedio Cantina: {formatCurrency(avgCantinaTicket)}
              </div>
            </div>
          </div>

          {/* Payment Distribution Donut */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0b1c30]">
                Distribución de Pagos
              </h3>
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                100% Auditado
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 110 110">
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="none"
                    stroke="#006591"
                    strokeWidth="12"
                    strokeDasharray={`${mpLen} ${circ}`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="none"
                    stroke="#006948"
                    strokeWidth="12"
                    strokeDasharray={`${cashLen} ${circ}`}
                    strokeDashoffset={-mpLen}
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="12"
                    strokeDasharray={`${debLen} ${circ}`}
                    strokeDashoffset={-(mpLen + cashLen)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-[#0b1c30] tabular-nums">
                  {tickets.length} Ops
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#006591]" />
                    Mercado Pago ({mpTickets.length})
                  </span>
                  <span className="font-mono font-bold text-[#006591] tabular-nums">
                    {formatCurrency(mpCollected)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#006948]" />
                    Efectivo ({cashTickets.length})
                  </span>
                  <span className="font-mono font-bold text-[#006948] tabular-nums">
                    {formatCurrency(cashCollected)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-violet-600" />
                    Tarjeta Débito ({debitTickets.length})
                  </span>
                  <span className="font-mono font-bold text-violet-700 tabular-nums">
                    {formatCurrency(debitCollected)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  id: 'todos',
                  label: `Todos los Cobros (${tickets.length})`,
                },
                {
                  id: 'Efectivo',
                  label: `Solo Efectivo (${cashTickets.length})`,
                },
                {
                  id: 'Mercado Pago QR',
                  label: `Mercado Pago QR (${mpTickets.length})`,
                },
                {
                  id: 'Tarjeta Débito',
                  label: `Débito (${debitTickets.length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMethodFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  methodFilter === tab.id
                    ? 'bg-[#006948] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none"
              >
                <option>Hoy (24 de Mayo)</option>
                <option>Ayer (23 de Mayo)</option>
                <option>Turno Anterior</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar Mesa 04, Ticket #..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-[#006948]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                <th className="py-3 px-4">Ticket / Hora</th>
                <th className="py-3 px-4">Mesa</th>
                <th className="py-3 px-4">Tiempo Jugado</th>
                <th className="py-3 px-4">Consumos Cantina</th>
                <th className="py-3 px-4">Método de Pago</th>
                <th className="py-3 px-4 text-right">Total Cobrado</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paged.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-[#0b1c30]">
                      {t.id}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {t.time}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006948] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {t.tableCode}
                      </span>
                      <div>
                        <div className="font-semibold text-[#0b1c30]">
                          {t.tableName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {t.tableZone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-[#0b1c30]">
                      {t.durationLabel}
                    </div>
                    <div className="text-[11px] text-[#006591]">
                      {t.durationSubtext}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-700 font-medium">
                      {t.cantinaSummary}
                    </div>
                    {t.cantinaAmount > 0 && (
                      <div className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {formatCurrency(t.cantinaAmount)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        t.paymentMethod === 'Mercado Pago QR'
                          ? 'bg-sky-50 text-[#006591]'
                          : t.paymentMethod === 'Efectivo'
                          ? 'bg-emerald-50 text-[#006948]'
                          : 'bg-violet-50 text-violet-700'
                      }`}
                    >
                      {t.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono font-bold text-sm text-[#006948] tabular-nums">
                      {formatCurrency(t.totalAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {t.tableAmountNote}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{t.operator}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal('ticket', t)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#0b1c30]"
                        title="Imprimir comprobante"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal('ticket', t)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#006948]"
                        title="Ver detalle de ticket"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Mostrando{' '}
            <strong className="text-[#0b1c30]">{paged.length}</strong> de{' '}
            <strong className="text-[#0b1c30]">{filtered.length}</strong> cobros
            del turno · Total Pág:{' '}
            <strong className="font-mono text-[#006948] tabular-nums">
              {formatCurrency(pageTotal)}
            </strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold ${
                  p === safePage
                    ? 'bg-[#0b1c30] text-white'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Dark Guard Handover Banner */}
      <div className="bg-[#0b1c30] text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold">
              Arqueo Rápido y Traspaso de Guardia
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Asegúrate de contar el efectivo físico en gaveta antes del relevo
              con el operador nocturno.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenReceiptModal('resumen_x')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Resumen X</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenReceiptModal('cierre_z')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00855d] hover:bg-[#006948] text-xs font-bold shadow-sm transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Iniciar Cierre Z</span>
          </button>
        </div>
      </div>
    </div>
  );
};
