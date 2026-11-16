import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { PoolTable, TableStatus } from '../types/billiards';
import { computeTableBilling, formatCurrency, formatHMS } from '../utils/format';
import { TableCard } from './TableCard';

interface TableBoardProps {
  tables: PoolTable[];
  statusFilter: TableStatus | 'todas';
  onChangeStatusFilter: (status: TableStatus | 'todas') => void;
  globalRate: number;
  onOpenRateModal: () => void;
  onOpenQuickStartModal: (preselectedTable?: PoolTable) => void;
  onOpenDetail: (table: PoolTable) => void;
  onOpenConsume: (table: PoolTable) => void;
  onQuickExtend: (tableId: number, minutes: number) => void;
  onActivateReservation: (tableId: number) => void;
  onEnableMaintenanceTable: (tableId: number) => void;
  onOpenReserveOrMaint: (
    table: PoolTable,
    mode: 'reserve' | 'maintenance'
  ) => void;
  counts: {
    todas: number;
    en_juego: number;
    libre: number;
    por_terminar: number;
    cumplido: number;
    reservada: number;
    mantenimiento: number;
  };
}

const STATUS_BADGE: Record<TableStatus, { label: string; cls: string }> = {
  en_juego: { label: 'En Juego', cls: 'bg-sky-50 text-sky-700' },
  libre: { label: 'Libre', cls: 'bg-emerald-50 text-emerald-700' },
  por_terminar: { label: 'Por Terminar', cls: 'bg-amber-50 text-amber-700' },
  cumplido: { label: 'Cumplido', cls: 'bg-red-50 text-red-700' },
  reservada: { label: 'Reservada', cls: 'bg-violet-50 text-violet-700' },
  mantenimiento: {
    label: 'Mantenimiento',
    cls: 'bg-slate-100 text-slate-600',
  },
};

export const TableBoard: React.FC<TableBoardProps> = ({
  tables,
  statusFilter,
  onChangeStatusFilter,
  globalRate,
  onOpenRateModal,
  onOpenQuickStartModal,
  onOpenDetail,
  onOpenConsume,
  onQuickExtend,
  onActivateReservation,
  onEnableMaintenanceTable,
  onOpenReserveOrMaint,
  counts,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'lista'>('cards');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = tables.filter((t) => {
    const matchesStatus =
      statusFilter === 'todas' || t.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.zone.toLowerCase().includes(q) ||
      (t.attendant || '').toLowerCase().includes(q) ||
      (t.reservationName || '').toLowerCase().includes(q) ||
      t.players.some((p) => p.name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const filterChips: {
    id: TableStatus | 'todas';
    label: string;
    count: number;
    dot?: string;
  }[] = [
    { id: 'todas', label: 'Todas', count: counts.todas },
    { id: 'libre', label: 'Libres', count: counts.libre, dot: 'bg-emerald-500' },
    {
      id: 'en_juego',
      label: 'En Juego',
      count: counts.en_juego,
      dot: 'bg-sky-500',
    },
    {
      id: 'por_terminar',
      label: 'Por Terminar',
      count: counts.por_terminar,
      dot: 'bg-amber-500',
    },
    {
      id: 'cumplido',
      label: 'Cumplido',
      count: counts.cumplido,
      dot: 'bg-red-500',
    },
    {
      id: 'reservada',
      label: 'Reservadas',
      count: counts.reservada,
      dot: 'bg-violet-500',
    },
    {
      id: 'mantenimiento',
      label: 'Mantenimiento',
      count: counts.mantenimiento,
      dot: 'bg-slate-400',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Cards / Lista toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'cards'
                  ? 'bg-white text-[#0b1c30] shadow-sm'
                  : 'text-slate-600 hover:text-[#0b1c30]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'lista'
                  ? 'bg-white text-[#0b1c30] shadow-sm'
                  : 'text-slate-600 hover:text-[#0b1c30]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenRateModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-xs transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#006948]" />
            <span className="font-mono tabular-nums">
              Tarifa Base: {formatCurrency(globalRate)}/h
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickStartModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Iniciar Mesa Rápida</span>
          </button>
        </div>

        {/* Search table / titular */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar mesa, jugador o zona..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
          />
        </div>
      </div>

      {/* Horizontal Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filterChips.map((chip) => {
          const active = statusFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onChangeStatusFilter(chip.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? 'bg-[#0b1c30] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#0b1c30]'
              }`}
            >
              {chip.dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${chip.dot}`} />
              )}
              <span>{chip.label}</span>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state if search/filter yields 0 */}
      {filteredTables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-semibold text-[#0b1c30]">
            No hay mesas que coincidan con el filtro actual.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Prueba limpiando la búsqueda o seleccionando &ldquo;Todas&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              onChangeStatusFilter('todas');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#006948] text-white text-xs font-semibold hover:bg-[#00583c]"
          >
            Mostrar Todas las Mesas
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* 4-Column Responsive Grid of Table Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onOpenDetail={onOpenDetail}
              onOpenConsume={onOpenConsume}
              onQuickExtend={onQuickExtend}
              onQuickStart={onOpenQuickStartModal}
              onActivateReservation={onActivateReservation}
              onEnableMaintenanceTable={onEnableMaintenanceTable}
              onOpenReserveOrMaint={onOpenReserveOrMaint}
            />
          ))}
        </div>
      ) : (
        /* High-Density Lista View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  <th className="py-3 px-4">Mesa &amp; Zona</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Titular / Jugadores</th>
                  <th className="py-3 px-4">Reloj / Horario</th>
                  <th className="py-3 px-4 text-right">Consumos</th>
                  <th className="py-3 px-4 text-right">Total Actual</th>
                  <th className="py-3 px-4 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTables.map((table) => {
                  const billing = computeTableBilling(table);
                  const badge = STATUS_BADGE[table.status];
                  const isActive =
                    table.status === 'en_juego' ||
                    table.status === 'por_terminar' ||
                    table.status === 'cumplido';
                  return (
                    <tr
                      key={table.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-[#0b1c30] tabular-nums">
                            {table.code}
                          </span>
                          <div>
                            <div className="font-semibold text-[#0b1c30]">
                              {table.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {table.zone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {isActive ? (
                          <div>
                            <div className="font-medium text-[#0b1c30]">
                              {table.players[0]?.name || 'Jugador'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {table.players.length}/4 · Atiende{' '}
                              {table.attendant}
                            </div>
                          </div>
                        ) : table.status === 'reservada' ? (
                          <div>
                            <div className="font-medium text-violet-700">
                              {table.reservationName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Cita {table.reservationTime}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {table.status === 'cumplido' ? (
                          <span className="text-red-600 font-bold">
                            +{formatHMS(table.overtimeSeconds)} exc.
                          </span>
                        ) : isActive ? (
                          <span
                            className={`font-bold ${
                              table.status === 'por_terminar'
                                ? 'text-amber-600'
                                : 'text-[#006591]'
                            }`}
                          >
                            {formatHMS(table.remainingSeconds)}
                          </span>
                        ) : table.status === 'reservada' ? (
                          <span className="text-violet-700 font-semibold">
                            {table.reservationTime}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {formatCurrency(table.hourlyRate)}/h
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        {billing.ordersSubtotal > 0
                          ? formatCurrency(billing.ordersSubtotal)
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-[#0b1c30]">
                        {isActive ? formatCurrency(billing.total) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isActive && (
                            <>
                              <button
                                type="button"
                                onClick={() => onQuickExtend(table.id, 30)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono text-[11px] font-semibold text-slate-700"
                              >
                                +30m
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenConsume(table)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700"
                              >
                                + Consumo
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenDetail(table)}
                                className="px-2.5 py-1 rounded-lg bg-[#006591] hover:bg-[#005276] text-white text-[11px] font-semibold"
                              >
                                Cobrar
                              </button>
                            </>
                          )}
                          {table.status === 'libre' && (
                            <button
                              type="button"
                              onClick={() => onOpenQuickStartModal(table)}
                              className="px-3 py-1 rounded-lg bg-[#006948] hover:bg-[#00583c] text-white text-[11px] font-semibold"
                            >
                              Iniciar 1h
                            </button>
                          )}
                          {table.status === 'reservada' && (
                            <button
                              type="button"
                              onClick={() => onActivateReservation(table.id)}
                              className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold"
                            >
                              Activar
                            </button>
                          )}
                          {table.status === 'mantenimiento' && (
                            <button
                              type="button"
                              onClick={() => onEnableMaintenanceTable(table.id)}
                              className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold"
                            >
                              Habilitar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
