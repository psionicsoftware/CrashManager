import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  History,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react';
import { NavView, TableStatus } from '../types/billiards';

interface SidebarProps {
  activeView: NavView;
  onChangeView: (view: NavView) => void;
  statusFilter: TableStatus | 'todas';
  onChangeStatusFilter: (status: TableStatus | 'todas') => void;
  counts: {
    todas: number;
    en_juego: number;
    libre: number;
    por_terminar: number;
    cumplido: number;
    reservada: number;
    mantenimiento: number;
  };
  occupancyPct: number;
  activeCount: number;
  totalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onChangeView,
  statusFilter,
  onChangeStatusFilter,
  counts,
  occupancyPct,
  activeCount,
  totalCount,
}) => {
  const navItems: { id: NavView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'tablero',
      label: 'Tablero de Mesas',
      icon:
        activeView === 'tablero' ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <LayoutGrid className="w-4 h-4 shrink-0" />
        ),
    },
    {
      id: 'analiticas',
      label: 'Analíticas & Rendimiento',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'historial',
      label: 'Historial y Caja',
      icon: <History className="w-4 h-4 shrink-0" />,
    },
  ];

  const filterItems: {
    id: TableStatus | 'todas';
    label: string;
    count: number;
    dotColor: string;
  }[] = [
    {
      id: 'todas',
      label: 'Todas',
      count: counts.todas,
      dotColor: 'bg-slate-400',
    },
    {
      id: 'en_juego',
      label: 'En Juego',
      count: counts.en_juego,
      dotColor: 'bg-sky-500',
    },
    {
      id: 'libre',
      label: 'Libres',
      count: counts.libre,
      dotColor: 'bg-emerald-600',
    },
    {
      id: 'por_terminar',
      label: 'Por Terminar',
      count: counts.por_terminar,
      dotColor: 'bg-amber-500',
    },
    {
      id: 'cumplido',
      label: 'Cumplido',
      count: counts.cumplido,
      dotColor: 'bg-red-500',
    },
    {
      id: 'reservada',
      label: 'Reservadas',
      count: counts.reservada,
      dotColor: 'bg-violet-500',
    },
    {
      id: 'mantenimiento',
      label: 'Mantenimiento',
      count: counts.mantenimiento,
      dotColor: 'bg-slate-400',
    },
  ];

  return (
    <aside className="w-full lg:w-[244px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-sm shrink-0">
            <span className="font-mono font-bold text-sm tracking-tight">
              CM
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#0b1c30] tracking-tight truncate">
              Crash Manager
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase truncate">
              Control de Mesas &amp; Tiempo
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1">
          <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Operaciones
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeView(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 lg:w-full text-left ${
                    isActive
                      ? 'bg-[#006948] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0b1c30]'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status Filter List (desktop sidebar, visible on Tablero & Analíticas) */}
        {activeView !== 'historial' && (
          <div className="hidden lg:block px-3 pt-2 pb-4 border-t border-slate-100">
            <div className="px-2.5 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Filtro de Estado
            </div>
            <div className="space-y-0.5">
              {filterItems.map((f) => {
                const selected = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onChangeStatusFilter(f.id);
                      if (activeView !== 'tablero') {
                        onChangeView('tablero');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      selected
                        ? 'bg-emerald-50/80 text-[#006948] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${f.dotColor}`}
                        aria-hidden="true"
                      />
                      <span>{f.label}</span>
                    </span>
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        selected ? 'text-[#006948] font-bold' : 'text-slate-500'
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Occupancy / Hall Widget */}
      <div className="hidden lg:block p-3 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-[#f8fbff] border border-slate-200/80">
          {activeView === 'historial' ? (
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Salón
              </div>
              <div className="text-sm font-bold text-[#0b1c30] mt-0.5">
                Sala Central
              </div>
              <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {activeCount} Mesas Activas / {totalCount} Total
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600">
                  Ocupación Turno
                </span>
                <span className="font-mono font-bold text-[#006948] tabular-nums">
                  {occupancyPct}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006948] rounded-full transition-all duration-300"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Sala Principal</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
