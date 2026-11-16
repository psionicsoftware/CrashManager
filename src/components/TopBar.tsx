import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { NavView, Operator } from '../types/billiards';
import { formatCurrency } from '../utils/format';

interface TopBarProps {
  activeView: NavView;
  globalRate: number;
  onOpenRateModal: () => void;
  clockStr: string;
  currentOperator: Operator;
  onLockShift: () => void;
  onSwitchOperator: (op: Operator) => void;
  operators: Operator[];
  occupancyPct: number;
  totalTables: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  globalRate,
  onOpenRateModal,
  clockStr,
  currentOperator,
  onLockShift,
  onSwitchOperator,
  operators,
  occupancyPct,
  totalTables,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Left context */}
      <div className="flex items-center gap-3 min-w-0">
        {activeView === 'historial' ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-mono font-semibold text-[#0b1c30] tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#006948]" />
              {clockStr} · Vie, 24 Mayo
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold tracking-wide text-[#006948] uppercase">
              Caja Abierta · {currentOperator.shift}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-xs sm:text-sm min-w-0">
            <span className="font-semibold text-[#0b1c30] whitespace-nowrap">
              Sala Central
            </span>
            <span className="text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="text-slate-500 whitespace-nowrap">
              {totalTables} Mesas Reguladas
            </span>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="hidden sm:inline font-mono text-xs font-semibold text-[#006948] tabular-nums whitespace-nowrap">
              {occupancyPct}% Capacidad Ocupada
            </span>
          </div>
        )}
      </div>

      {/* Right operational controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          type="button"
          onClick={onOpenRateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006948] hover:bg-[#00583c] text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0"
          title="Ajustar Tarifa Global por Hora"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span className="font-mono tabular-nums">
            Tarifa Global: {formatCurrency(globalRate)}/h
          </span>
        </button>

        {activeView !== 'historial' && (
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="font-mono text-sm font-bold text-[#0b1c30] tabular-nums">
              {clockStr}
            </span>
            <span className="text-[11px] text-slate-500">
              {currentOperator.shortName} ({currentOperator.shift})
            </span>
          </div>
        )}

        {/* Operator profile & Lock dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Menú de operador"
          >
            {activeView === 'historial' && (
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs font-bold text-[#0b1c30]">
                  {currentOperator.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentOperator.role}
                </div>
              </div>
            )}
            <div className="w-9 h-9 rounded-full bg-[#0b1c30] text-white font-bold text-xs flex items-center justify-center border-2 border-emerald-500/40 shrink-0">
              {currentOperator.initials}
            </div>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-40 py-2">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-[#0b1c30]">
                    {currentOperator.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentOperator.email}
                  </div>
                </div>
                <div className="px-2 py-1.5">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Cambiar Operador Activo
                  </div>
                  {operators.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        onSwitchOperator(op);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        op.id === currentOperator.id
                          ? 'bg-emerald-50 text-[#006948] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5" />
                        {op.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {op.shift}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLockShift();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006948]" />
                    <span>Pantalla de Acceso Operativo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLockShift();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Bloquear / Cerrar Turno</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
