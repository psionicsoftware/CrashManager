import React from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Check,
  Clock,
  Play,
  Plus,
  ShoppingBag,
  Unlock,
  Wrench,
} from 'lucide-react';
import { PoolTable, TableStatus } from '../types/billiards';
import { computeTableBilling, formatCurrency, formatHMS } from '../utils/format';

interface TableCardProps {
  table: PoolTable;
  onOpenDetail: (table: PoolTable) => void;
  onOpenConsume: (table: PoolTable) => void;
  onQuickExtend: (tableId: number, minutes: number) => void;
  onQuickStart: (table: PoolTable) => void;
  onActivateReservation: (tableId: number) => void;
  onEnableMaintenanceTable: (tableId: number) => void;
  onOpenReserveOrMaint: (table: PoolTable, mode: 'reserve' | 'maintenance') => void;
}

const STATUS_META: Record<
  TableStatus,
  {
    label: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
    boxBg: string;
    timerText: string;
  }
> = {
  en_juego: {
    label: 'EN JUEGO',
    border: 'border-sky-400/80',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    dot: 'bg-sky-500',
    boxBg: 'bg-[#f4f8ff]',
    timerText: 'text-[#006591]',
  },
  libre: {
    label: 'LIBRE',
    border: 'border-emerald-400/80',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    dot: 'bg-emerald-500',
    boxBg: 'bg-[#f4fbf8]',
    timerText: 'text-[#006948]',
  },
  por_terminar: {
    label: 'POR TERMINAR',
    border: 'border-amber-400',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    dot: 'bg-amber-500',
    boxBg: 'bg-amber-50/70',
    timerText: 'text-amber-600',
  },
  cumplido: {
    label: 'CUMPLIDO',
    border: 'border-red-400',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    dot: 'bg-red-500',
    boxBg: 'bg-red-50/70',
    timerText: 'text-red-600',
  },
  reservada: {
    label: 'RESERVADA',
    border: 'border-violet-400',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    dot: 'bg-violet-500',
    boxBg: 'bg-violet-50/70',
    timerText: 'text-violet-700',
  },
  mantenimiento: {
    label: 'MANTENIMIENTO',
    border: 'border-slate-300',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    dot: 'bg-slate-400',
    boxBg: 'bg-slate-100/80',
    timerText: 'text-slate-700',
  },
};

export const TableCard: React.FC<TableCardProps> = ({
  table,
  onOpenDetail,
  onOpenConsume,
  onQuickExtend,
  onQuickStart,
  onActivateReservation,
  onEnableMaintenanceTable,
  onOpenReserveOrMaint,
}) => {
  const meta = STATUS_META[table.status];
  const billing = computeTableBilling(table);
  const orderCount = table.orders.reduce((s, o) => s + o.quantity, 0);

  const renderStatusIcon = () => {
    switch (table.status) {
      case 'libre':
        return <Check className="w-3.5 h-3.5 text-emerald-600" />;
      case 'por_terminar':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'cumplido':
        return <Clock className="w-3.5 h-3.5 text-red-500" />;
      case 'reservada':
        return <CalendarClock className="w-3.5 h-3.5 text-violet-600" />;
      case 'mantenimiento':
        return <Wrench className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  return (
    <article
      className={`relative bg-white rounded-2xl border-[1.5px] ${meta.border} p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_20px_-6px_rgba(15,23,42,0.08)] transition-all flex flex-col justify-between min-h-[268px]`}
    >
      {/* Subtle 4-corner pocket rivets motif */}
      <span className="pointer-events-none absolute top-2 left-2 w-1 h-1 rounded-full bg-slate-300/80" />
      <span className="pointer-events-none absolute top-2 right-2 w-1 h-1 rounded-full bg-slate-300/80" />
      <span className="pointer-events-none absolute bottom-2 left-2 w-1 h-1 rounded-full bg-slate-300/80" />
      <span className="pointer-events-none absolute bottom-2 right-2 w-1 h-1 rounded-full bg-slate-300/80" />

      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              table.status === 'libre'
                ? onQuickStart(table)
                : onOpenDetail(table)
            }
            className="flex items-center gap-1.5 text-left group"
          >
            <span className="font-mono text-base font-bold text-[#0b1c30] group-hover:text-[#006948] transition-colors tabular-nums">
              {table.code}
            </span>
            {renderStatusIcon()}
            {table.isPaused && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                PAUSA
              </span>
            )}
          </button>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${meta.badgeBg} ${meta.badgeText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>

        {/* Sub-info Row */}
        <div className="mt-2 flex items-start justify-between gap-2 text-[11px] leading-snug text-slate-600 min-h-[30px]">
          {table.status === 'libre' && (
            <>
              <span className="font-medium text-slate-600">
                Disponible / Lista
              </span>
              <span className="font-mono font-semibold text-slate-500 tabular-nums">
                {formatCurrency(table.hourlyRate)}/h
              </span>
            </>
          )}

          {table.status === 'mantenimiento' && (
            <>
              <span className="font-medium text-slate-600 line-clamp-2">
                {table.maintenanceReason || 'Mantenimiento programado'}
              </span>
              <span className="font-semibold text-slate-500 shrink-0">
                Bloqueada
              </span>
            </>
          )}

          {table.status === 'reservada' && (
            <>
              <div className="min-w-0">
                <div className="font-semibold text-[#0b1c30] truncate">
                  Reserva: {table.reservationName}
                </div>
                <div className="text-slate-500">
                  Atendido Por: {table.attendant || 'Jorge'}
                </div>
              </div>
              <span className="font-mono font-semibold text-violet-700 shrink-0 tabular-nums">
                Jugadores: {table.players.length}/4
              </span>
            </>
          )}

          {(table.status === 'en_juego' ||
            table.status === 'por_terminar' ||
            table.status === 'cumplido') && (
            <>
              <div className="min-w-0">
                <div>
                  Jugadores:{' '}
                  <span className="font-semibold text-[#0b1c30] tabular-nums">
                    {table.players.length}/4
                  </span>
                </div>
                <div className="text-slate-500 truncate">
                  Atendido Por: {table.attendant || 'Jorge'}
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#0b1c30] tabular-nums shrink-0">
                {formatCurrency(billing.total)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Central Timer / Status Box */}
      <div
        onClick={() => {
          if (
            table.status === 'en_juego' ||
            table.status === 'por_terminar' ||
            table.status === 'cumplido'
          ) {
            onOpenDetail(table);
          }
        }}
        className={`my-2.5 rounded-xl px-3 py-3 text-center ${meta.boxBg} ${
          table.status === 'en_juego' ||
          table.status === 'por_terminar' ||
          table.status === 'cumplido'
            ? 'cursor-pointer hover:brightness-[0.98] transition-all'
            : ''
        }`}
      >
        {table.status === 'libre' && (
          <div className="py-2 flex flex-col items-center justify-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600">
              Listo para iniciar
            </span>
          </div>
        )}

        {table.status === 'mantenimiento' && (
          <div className="py-1.5 flex flex-col items-center justify-center gap-1">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {table.maintenanceTech || 'Técnico Asignado'}
            </span>
            <span className="text-[10px] text-slate-500">
              Est. fin: {table.maintenanceEstEnd || '19:00 hs'}
            </span>
          </div>
        )}

        {table.status === 'reservada' && (
          <div className="py-1">
            <div className="text-[10px] font-bold tracking-wider text-violet-600 uppercase">
              Cita Programada
            </div>
            <div className="font-mono text-2xl font-bold text-violet-700 mt-0.5 tabular-nums">
              {table.reservationTime || '17:30 hs'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Llega en ~{table.reservationEtaMinutes ?? 35} minutos
            </div>
          </div>
        )}

        {(table.status === 'en_juego' || table.status === 'por_terminar') && (
          <div>
            <div
              className={`text-[10px] font-bold tracking-wider uppercase ${
                table.status === 'por_terminar'
                  ? 'text-amber-700'
                  : 'text-slate-500'
              }`}
            >
              {table.status === 'por_terminar'
                ? 'Por Terminar'
                : 'Tiempo Restante'}
            </div>
            <div
              className={`font-mono text-[26px] leading-tight font-bold mt-0.5 tabular-nums ${meta.timerText}`}
            >
              {formatHMS(table.remainingSeconds)}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500 px-1 tabular-nums">
              <span>Ini: {table.startTimeStr}</span>
              <span>Fin: {table.endTimeStr}</span>
            </div>
          </div>
        )}

        {table.status === 'cumplido' && (
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-red-600 tabular-nums">
              Excedente (+{formatHMS(table.overtimeSeconds)})
            </div>
            <div className="font-mono text-[26px] leading-tight font-bold mt-0.5 text-red-600 tabular-nums">
              00:00:00
            </div>
            <div className="mt-1.5 text-[10px] font-mono text-slate-500 tabular-nums">
              Fin programado: {table.endTimeStr}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="space-y-1.5">
        {table.status === 'libre' && (
          <>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pb-0.5">
              <button
                type="button"
                onClick={() => onOpenReserveOrMaint(table, 'reserve')}
                className="hover:text-[#006948] font-medium transition-colors"
              >
                Reservar
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => onOpenReserveOrMaint(table, 'maintenance')}
                className="hover:text-slate-800 font-medium transition-colors"
              >
                Mantenimiento
              </button>
            </div>
            <button
              type="button"
              onClick={() => onQuickStart(table)}
              className="w-full py-2 px-3 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Turno (1h)</span>
            </button>
          </>
        )}

        {table.status === 'mantenimiento' && (
          <>
            <div className="text-center pb-0.5">
              <button
                type="button"
                onClick={() => onOpenReserveOrMaint(table, 'maintenance')}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
              >
                Ver reporte de daño
              </button>
            </div>
            <button
              type="button"
              onClick={() => onEnableMaintenanceTable(table.id)}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Habilitar Mesa</span>
            </button>
          </>
        )}

        {table.status === 'reservada' && (
          <>
            <div className="text-center pb-0.5">
              <button
                type="button"
                onClick={() => onOpenReserveOrMaint(table, 'reserve')}
                className="text-[11px] font-medium text-slate-500 hover:text-violet-700"
              >
                Editar Reserva / Cancelar
              </button>
            </div>
            <button
              type="button"
              onClick={() => onActivateReservation(table.id)}
              className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Activar Turno Ahora</span>
            </button>
          </>
        )}

        {(table.status === 'en_juego' ||
          table.status === 'por_terminar' ||
          table.status === 'cumplido') && (
          <>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onQuickExtend(table.id, 30)}
                className={`py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors ${
                  table.status === 'por_terminar'
                    ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => onQuickExtend(table.id, 60)}
                className="py-1 rounded-lg text-[11px] font-mono font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                +1h
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenDetail(table)}
              className={`w-full py-2 px-3 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                table.status === 'por_terminar'
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : table.status === 'cumplido'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#006591] hover:bg-[#005276]'
              }`}
            >
              {table.status === 'por_terminar' ? (
                <Bell className="w-3.5 h-3.5" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
              <span>
                {table.status === 'por_terminar'
                  ? 'Avisar / Cobrar'
                  : table.status === 'cumplido'
                  ? 'Finalizar & Cobrar'
                  : 'Cobrar/Liberar'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenConsume(table)}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Consumo ({orderCount})</span>
            </button>
          </>
        )}
      </div>
    </article>
  );
};
