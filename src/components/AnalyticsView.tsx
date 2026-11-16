import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { HOURLY_OCCUPANCY } from '../data/mockData';
import {
  AnalyticsPeriod,
  PoolTable,
  SessionTicket,
  TableStatus,
} from '../types/billiards';
import {
  computeTableBilling,
  downloadCSV,
  formatCurrency,
  formatHMS,
} from '../utils/format';

interface AnalyticsViewProps {
  tables: PoolTable[];
  tickets: SessionTicket[];
  globalRate: number;
  onOpenDetail: (table: PoolTable) => void;
  onTogglePromo: (tableId: number) => void;
  onNotify: (msg: string) => void;
}

const PERIOD_MULTIPLIER: Record<
  AnalyticsPeriod,
  { revMult: number; occDelta: number; hoursMult: number; avgTime: string }
> = {
  Hoy: { revMult: 1, occDelta: 0, hoursMult: 1, avgTime: '1h 45m' },
  Ayer: { revMult: 0.85, occDelta: -6.2, hoursMult: 0.88, avgTime: '1h 32m' },
  'Esta Semana': {
    revMult: 5.8,
    occDelta: 4.1,
    hoursMult: 5.4,
    avgTime: '1h 52m',
  },
  'Este Mes': {
    revMult: 24.5,
    occDelta: 7.4,
    hoursMult: 23.2,
    avgTime: '1h 48m',
  },
};

const STATUS_ROW_STYLE: Record<
  TableStatus,
  { bar: string; label: string; badge: string }
> = {
  en_juego: {
    bar: 'bg-sky-600',
    label: 'En Juego',
    badge: 'text-sky-700 bg-sky-50',
  },
  libre: {
    bar: 'bg-emerald-600',
    label: 'Libre',
    badge: 'text-emerald-700 bg-emerald-50',
  },
  por_terminar: {
    bar: 'bg-amber-500',
    label: 'Por Terminar',
    badge: 'text-amber-700 bg-amber-50',
  },
  cumplido: {
    bar: 'bg-red-500',
    label: 'Cumplido',
    badge: 'text-red-700 bg-red-50',
  },
  reservada: {
    bar: 'bg-violet-500',
    label: 'Reservada',
    badge: 'text-violet-700 bg-violet-50',
  },
  mantenimiento: {
    bar: 'bg-slate-400',
    label: 'Mantenimiento',
    badge: 'text-slate-600 bg-slate-100',
  },
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tables,
  tickets,
  globalRate,
  onOpenDetail,
  onTogglePromo,
  onNotify,
}) => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('Hoy');
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'todas'>(
    'todas'
  );
  const [page, setPage] = useState(1);

  const mult = PERIOD_MULTIPLIER[period];
  const baseRevenueToday = 868000;
  const periodRevenue = Math.round(baseRevenueToday * mult.revMult);
  const avgOccupancy = Math.min(98, Math.max(40, 78.5 + mult.occDelta));
  const billedHours = Math.round(124 * mult.hoursMult);
  const activeTablesCount = tables.filter(
    (t) =>
      t.status === 'en_juego' ||
      t.status === 'por_terminar' ||
      t.status === 'cumplido'
  ).length;

  const sortedByRevenue = [...tables].sort(
    (a, b) => b.todayRevenue - a.todayRevenue
  );
  const top5 = sortedByRevenue.slice(0, 5);
  const bottom4 = [...tables]
    .sort((a, b) => a.todayOccupancyPct - b.todayOccupancyPct)
    .slice(0, 4);

  const filteredTables = tables.filter((t) => {
    const matchStatus = statusFilter === 'todas' || t.status === statusFilter;
    const q = tableSearch.trim().toLowerCase();
    const matchQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.code.includes(q) ||
      t.zone.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredTables.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedTables = filteredTables.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleExportExcel = () => {
    downloadCSV(
      `crash-manager-metricas-${period.toLowerCase().replace(/\s+/g, '-')}.csv`,
      ['Mesa', 'Zona', 'Estado', 'Horas Hoy', 'Ocupacion %', 'Facturado Hoy'],
      tables.map((t) => [
        t.name,
        t.zone,
        t.status,
        t.todayHours,
        `${t.todayOccupancyPct}%`,
        t.todayRevenue,
      ])
    );
    onNotify('Reporte Excel (CSV) descargado correctamente.');
  };

  const handleExportPDF = () => {
    window.print();
    onNotify('Vista de impresión / PDF lista.');
  };

  // SVG Donut math for Group Distribution: 48% Duplas, 40% Social (3-4), 12% Solo
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const seg1 = 0.48 * circumference;
  const seg2 = 0.4 * circumference;
  const seg3 = 0.12 * circumference;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Reportes &amp; Métricas / Rendimiento Operativo
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Rendimiento y Métricas por Mesa
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200">
            {(
              ['Hoy', 'Ayer', 'Esta Semana', 'Este Mes'] as AnalyticsPeriod[]
            ).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  period === p
                    ? 'bg-[#0b1c30] text-white'
                    : 'text-slate-600 hover:text-[#0b1c30]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#006948]" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Ingresos {period}</span>
            <DollarSign className="w-4 h-4 text-[#006948]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0b1c30] mt-2 tabular-nums">
            {formatCurrency(periodRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
              <TrendingUp className="w-3 h-3" />
              +18.4%
            </span>
            <span className="text-slate-400">
              vs ayer ($735.000)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Ocupación Prom.</span>
            <Users className="w-4 h-4 text-[#006591]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0b1c30] mt-2 tabular-nums">
            {avgOccupancy.toFixed(1)}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Pico <span className="font-semibold text-[#0b1c30]">95%</span>{' '}
            (19:30 hs)
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Horas Facturadas</span>
            <Clock className="w-4 h-4 text-violet-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0b1c30] mt-2 tabular-nums">
            {billedHours}h
          </div>
          <div className="mt-2 text-[11px] text-slate-500 tabular-nums">
            <span className="font-semibold text-[#006948]">
              {activeTablesCount} mesas activas
            </span>{' '}
            · {tickets.length + 27} turnos
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Tiempo Promedio</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0b1c30] mt-2 tabular-nums">
            {mult.avgTime}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            +12 min vs media histórica
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
            <span>Tarifa Base</span>
            <DollarSign className="w-4 h-4 text-[#006948]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0b1c30] mt-2 tabular-nums">
            {formatCurrency(globalRate)}
            <span className="text-sm font-normal text-slate-400">/h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
            Media Hora: {formatCurrency(Math.round(globalRate * 0.7))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hourly Occupancy Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Distribución Temporal
              </div>
              <h2 className="text-base font-bold text-[#0b1c30]">
                Ocupación por Franja Horaria (14:00 - 01:00)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#006948]" />
              <span>Ocupación &gt; 80%</span>
            </div>
          </div>

          <div className="h-52 flex items-end justify-between gap-2 sm:gap-3 pt-6 px-1">
            {HOURLY_OCCUPANCY.map((item) => {
              const isPeak = item.pct >= 80;
              const isHovered = hoveredHour === item.hour;
              return (
                <div
                  key={item.hour}
                  onMouseEnter={() => setHoveredHour(item.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group"
                >
                  {isHovered && (
                    <div className="absolute -top-2 z-10 px-2 py-1 rounded-lg bg-[#0b1c30] text-white text-[10px] font-mono whitespace-nowrap shadow-md">
                      {item.pct}% · {item.tables} mesas
                    </div>
                  )}
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      className={`w-full max-w-[26px] rounded-t-lg transition-all duration-200 ${
                        isPeak
                          ? 'bg-[#006948] group-hover:bg-[#005137]'
                          : 'bg-[#cbe3fc] group-hover:bg-sky-300'
                      }`}
                      style={{ height: `${item.pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Distribution Donut */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Perfil de Clientes
            </div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              Distribución de Grupos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Concurrencia según jugadores por mesa
            </p>
          </div>

          <div className="my-4 flex items-center justify-center relative">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
              />
              {/* 48% Duplas - Emerald */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#006948"
                strokeWidth="16"
                strokeDasharray={`${seg1} ${circumference}`}
                strokeDashoffset="0"
              />
              {/* 40% Social - Sky */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="16"
                strokeDasharray={`${seg2} ${circumference}`}
                strokeDashoffset={-seg1}
              />
              {/* 12% Solo - Violet */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="16"
                strokeDasharray={`${seg3} ${circumference}`}
                strokeDashoffset={-(seg1 + seg2)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-bold text-[#0b1c30]">
                48%
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Duplas
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#006948]" />2 personas
                (Duelos)
              </span>
              <span className="font-mono font-bold text-[#0b1c30]">48%</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-500" />3 - 4
                personas (Social)
              </span>
              <span className="font-mono font-bold text-[#0b1c30]">40%</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-violet-500" />1 persona
                (Práctica Solo)
              </span>
              <span className="font-mono font-bold text-[#0b1c30]">12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 & Least Occupied */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-base font-bold text-[#0b1c30]">
            <Sparkles className="w-4 h-4 text-[#006948]" />
            <span>Top 5 Mesas Más Ocupadas</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Mesas líderes en facturación acumulada durante la jornada.
          </p>

          <div className="space-y-2.5">
            {top5.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => onOpenDetail(t)}
                className="p-3 rounded-xl bg-[#f8fbff] hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-[#006948] text-white'
                        : 'bg-sky-100 text-[#006591]'
                    }`}
                  >
                    {idx + 1}°
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0b1c30] truncate">
                      {t.name}{' '}
                      <span className="font-normal text-slate-500">
                        ({t.zone})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      {t.todayHours} horas registradas hoy
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-[#006948] tabular-nums">
                      {formatCurrency(t.todayRevenue)}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 tabular-nums">
                      {t.todayOccupancyPct}% Ocup.
                    </div>
                  </div>
                  <div className="w-1.5 h-8 rounded-full bg-slate-200 overflow-hidden flex items-end">
                    <div
                      className="w-full bg-[#006948] rounded-full"
                      style={{ height: `${t.todayOccupancyPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-[#0b1c30]">
              <TrendingDown className="w-4 h-4 text-slate-500" />
              <span>Mesas Menos Ocupadas</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Identificación de cuellos de botella y mesas candidatas a
              promociones.
            </p>

            <div className="space-y-2.5">
              {bottom4.map((t, idx) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    t.status === 'mantenimiento'
                      ? 'bg-red-50/40 border-red-100'
                      : 'bg-[#f8fbff] border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        t.status === 'mantenimiento'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {20 - idx}°
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0b1c30]">
                          {t.name}
                        </span>
                        {t.status === 'mantenimiento' ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                            Mantenimiento
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 truncate">
                            ({t.zone})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.status === 'mantenimiento'
                          ? `${t.todayHours} horas activas hoy · Paño en ajuste`
                          : t.promoActive
                          ? 'Promoción 2x1 activa en tablero'
                          : `${t.todayHours} horas registradas hoy`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-[#0b1c30] tabular-nums">
                        {formatCurrency(t.todayRevenue)}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {t.todayOccupancyPct}% Ocup.
                      </div>
                    </div>
                    {t.status !== 'mantenimiento' && (
                      <button
                        type="button"
                        onClick={() => onTogglePromo(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                          t.promoActive
                            ? 'bg-[#006948] text-white border-[#006948]'
                            : 'bg-white border-sky-200 text-[#006591] hover:bg-sky-50'
                        }`}
                      >
                        {t.promoActive ? 'Promo Activa' : 'Promoción'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900">
            <span className="font-semibold">Rotación recomendada:</span>{' '}
            Desplazar torneos relámpago a mesas 015 y 019 para balancear desgaste
            del paño.
          </div>
        </div>
      </div>

      {/* Real-time Detailed Table Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Auditoría en Tiempo Real
            </div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              Desglose Detallado de las {tables.length} Mesas
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Filtrar por mesa..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-[#006948]"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as TableStatus | 'todas');
                  setPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="todas">Todos los estados</option>
                <option value="en_juego">En Juego</option>
                <option value="libre">Libre</option>
                <option value="por_terminar">Por Terminar</option>
                <option value="cumplido">Cumplido</option>
                <option value="reservada">Reservada</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                <th className="py-3 px-5">Mesa &amp; Estado</th>
                <th className="py-3 px-5">Tiempo Restante / Excedente</th>
                <th className="py-3 px-5 text-right">Acumulado / Tarifa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pagedTables.map((t) => {
                const style = STATUS_ROW_STYLE[t.status];
                const billing = computeTableBilling(t);
                const isActive =
                  t.status === 'en_juego' ||
                  t.status === 'por_terminar' ||
                  t.status === 'cumplido';
                return (
                  <tr
                    key={t.id}
                    onClick={() => onOpenDetail(t)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      t.status === 'cumplido' ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-1 h-6 rounded-full ${style.bar}`}
                        />
                        <span className="font-mono text-sm font-bold text-[#0b1c30] tabular-nums">
                          {t.code}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style.badge}`}
                        >
                          {style.label}
                          {t.isVip ? ' (VIP)' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono tabular-nums">
                      {t.status === 'cumplido' ? (
                        <span className="text-red-600 font-bold">
                          +{formatHMS(t.overtimeSeconds)}
                        </span>
                      ) : isActive ? (
                        <span className="font-semibold text-[#0b1c30]">
                          {formatHMS(t.remainingSeconds)}
                        </span>
                      ) : t.status === 'reservada' ? (
                        <span className="font-semibold text-violet-700">
                          {t.reservationTime}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right font-mono tabular-nums">
                      {t.status === 'mantenimiento' ? (
                        <span className="text-slate-500 font-sans">
                          Bloqueada
                        </span>
                      ) : isActive ? (
                        <span className="font-bold text-[#006948]">
                          {formatCurrency(billing.total)}
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          {formatCurrency(t.hourlyRate)}/h
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Mostrando{' '}
            <strong className="text-[#0b1c30]">
              {filteredTables.length === 0 ? 0 : (safePage - 1) * pageSize + 1} a{' '}
              {Math.min(safePage * pageSize, filteredTables.length)}
            </strong>{' '}
            de {filteredTables.length} mesas registradas
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold ${
                  p === safePage
                    ? 'bg-[#006948] text-white'
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
              className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
