import React, { useState } from 'react';
import {
  CalendarClock,
  Check,
  DollarSign,
  Play,
  Printer,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  CashMovement,
  Player,
  PoolTable,
  SessionTicket,
} from '../types/billiards';
import { formatCurrency } from '../utils/format';

/* 1. Start Table Modal */
interface StartTableModalProps {
  freeTables: PoolTable[];
  preselectedTable?: PoolTable | null;
  globalRate: number;
  onClose: () => void;
  onStartTable: (
    tableId: number,
    titularName: string,
    phone: string,
    playerCount: number,
    durationMinutes: number
  ) => void;
}

export const StartTableModal: React.FC<StartTableModalProps> = ({
  freeTables,
  preselectedTable,
  globalRate,
  onClose,
  onStartTable,
}) => {
  const [tableId, setTableId] = useState<number>(
    preselectedTable?.id || freeTables[0]?.id || 0
  );
  const [titularName, setTitularName] = useState('');
  const [phone, setPhone] = useState('+54 9 11 ');
  const [playerCount, setPlayerCount] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(60);

  const selectedTable = freeTables.find((t) => t.id === tableId);
  const rate = selectedTable?.hourlyRate || globalRate;
  const estimated = Math.round((durationMinutes / 60) * rate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableId) return;
    onStartTable(
      tableId,
      titularName.trim() || 'Cliente Salón',
      phone.trim(),
      playerCount,
      durationMinutes
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/45 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              Iniciar Turno de Mesa
            </h2>
            <p className="text-xs text-slate-500">
              Configura duración y jugadores para comenzar el reloj.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {freeTables.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium">
              No hay mesas libres en este momento.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mesa Disponible
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                >
                  {freeTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {t.zone} ({formatCurrency(t.hourlyRate)}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Titular
                  </label>
                  <input
                    type="text"
                    value={titularName}
                    onChange={(e) => setTitularName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-[#006948]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    WhatsApp / Tel
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:bg-white focus:border-[#006948]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Duración Pactada
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                        durationMinutes === m
                          ? 'bg-[#006948] text-white border-[#006948]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m === 30 ? '30m' : m === 60 ? '1h' : m === 90 ? '1h30' : '2h'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Jugadores ({playerCount})
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setPlayerCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                        playerCount === cnt
                          ? 'bg-[#0b1c30] text-white border-[#0b1c30]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">
                  Importe inicial estimado
                </span>
                <span className="font-mono text-base font-bold text-[#006948] tabular-nums">
                  {formatCurrency(estimated)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            {freeTables.length > 0 && (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Turno</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

/* 2. Global Rate Modal */
interface RateModalProps {
  currentRate: number;
  onClose: () => void;
  onSaveRate: (newRate: number) => void;
}

export const RateModal: React.FC<RateModalProps> = ({
  currentRate,
  onClose,
  onSaveRate,
}) => {
  const [rate, setRate] = useState(currentRate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/45 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#006948]" />
            <h2 className="text-base font-bold text-[#0b1c30]">
              Tarifa Global por Hora
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setRate((r) => Math.max(1000, r - 500))}
              className="w-11 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 font-mono text-lg font-bold"
            >
              -
            </button>
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-[#006948] tabular-nums">
                {formatCurrency(rate)}
              </div>
              <div className="text-[11px] text-slate-500">por hora</div>
            </div>
            <button
              type="button"
              onClick={() => setRate((r) => r + 500)}
              className="w-11 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 font-mono text-lg font-bold"
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Happy Hour', val: 5500 },
              { label: 'Estándar', val: 7000 },
              { label: 'Fin de Semana', val: 8500 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setRate(preset.val)}
                className={`p-2 rounded-xl border text-center transition-colors ${
                  rate === preset.val
                    ? 'border-[#006948] bg-emerald-50 text-[#006948]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-[10px] font-semibold">{preset.label}</div>
                <div className="font-mono text-xs font-bold">
                  {formatCurrency(preset.val)}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSaveRate(rate)}
              className="px-5 py-2 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-bold"
            >
              Aplicar Tarifa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 3. Edit Players Modal */
interface EditPlayersModalProps {
  table: PoolTable;
  onClose: () => void;
  onSavePlayers: (tableId: number, players: Player[]) => void;
}

export const EditPlayersModal: React.FC<EditPlayersModalProps> = ({
  table,
  onClose,
  onSavePlayers,
}) => {
  const [players, setPlayers] = useState<Player[]>(table.players);

  const updateName = (id: string, name: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const parts = name.trim().split(' ');
        const initials =
          parts.length >= 2
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase() || p.initials;
        return { ...p, name, initials };
      })
    );
  };

  const addPlayer = () => {
    if (players.length >= 4) return;
    const idx = players.length + 1;
    setPlayers((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        name: `Jugador ${idx}`,
        initials: `J${idx}`,
        role: 'Invitado',
        paid: false,
      },
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 1) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0b1c30]">
            Jugadores en {table.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {players.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-xs font-bold flex items-center justify-center text-slate-700 shrink-0">
                {p.initials}
              </span>
              <input
                type="text"
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006948]"
              />
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removePlayer(p.id)}
                  className="px-2.5 py-2 rounded-xl hover:bg-red-50 text-xs text-red-600 font-semibold"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}

          {players.length < 4 && (
            <button
              type="button"
              onClick={addPlayer}
              className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-[#006948] hover:bg-emerald-50"
            >
              + Agregar Jugador
            </button>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSavePlayers(table.id, players)}
              className="px-5 py-2 rounded-xl bg-[#006948] text-white text-xs font-bold"
            >
              Guardar Jugadores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 4. Reserve / Maintenance Modal */
interface ReserveMaintModalProps {
  table: PoolTable;
  initialMode: 'reserve' | 'maintenance';
  onClose: () => void;
  onSaveReserve: (
    tableId: number,
    name: string,
    time: string,
    playersCount: number
  ) => void;
  onCancelReserve: (tableId: number) => void;
  onSaveMaintenance: (tableId: number, reason: string, estEnd: string) => void;
}

export const ReserveMaintModal: React.FC<ReserveMaintModalProps> = ({
  table,
  initialMode,
  onClose,
  onSaveReserve,
  onCancelReserve,
  onSaveMaintenance,
}) => {
  const [mode, setMode] = useState<'reserve' | 'maintenance'>(initialMode);
  const [resName, setResName] = useState(table.reservationName || 'Lucas Pereyra');
  const [resTime, setResTime] = useState(table.reservationTime || '19:00 hs');
  const [resCount, setResCount] = useState(table.players.length || 2);
  const [maintReason, setMaintReason] = useState(
    table.maintenanceReason || 'Cambio de paño y nivelación'
  );
  const [maintEnd, setMaintEnd] = useState(table.maintenanceEstEnd || '19:30 hs');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/45 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0b1c30]">
            {table.name} · Gestión de Estado
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => setMode('reserve')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                mode === 'reserve'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Reserva
            </button>
            <button
              type="button"
              onClick={() => setMode('maintenance')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                mode === 'maintenance'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Mantenimiento
            </button>
          </div>

          {mode === 'reserve' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                  Nombre de Reserva
                </label>
                <input
                  type="text"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Hora Programada
                  </label>
                  <input
                    type="text"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Jugadores
                  </label>
                  <select
                    value={resCount}
                    onChange={(e) => setResCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} Personas
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                {table.status === 'reservada' ? (
                  <button
                    type="button"
                    onClick={() => onCancelReserve(table.id)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Cancelar Reserva
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() =>
                    onSaveReserve(table.id, resName, resTime, resCount)
                  }
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                >
                  Confirmar Reserva
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                  Motivo / Reporte de Daño
                </label>
                <input
                  type="text"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                  Fin Estimado
                </label>
                <input
                  type="text"
                  value={maintEnd}
                  onChange={(e) => setMaintEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onSaveMaintenance(table.id, maintReason, maintEnd)
                  }
                  className="px-5 py-2.5 rounded-xl bg-[#0b1c30] text-white text-xs font-bold"
                >
                  Bloquear por Mantenimiento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* 5. Cash Movement Modal */
interface CashMovementModalProps {
  defaultType: 'egreso' | 'ingreso';
  onClose: () => void;
  onAddMovement: (
    type: 'egreso' | 'ingreso',
    description: string,
    amount: number
  ) => void;
}

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  defaultType,
  onClose,
  onAddMovement,
}) => {
  const [type, setType] = useState<'egreso' | 'ingreso'>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!description.trim() || !num || num <= 0) return;
    onAddMovement(type, description.trim(), num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/45 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0b1c30]">
            Registrar Movimiento de Caja
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => setType('egreso')}
              className={`py-2 rounded-lg text-xs font-semibold ${
                type === 'egreso'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Gasto / Vale (Egreso)
            </button>
            <button
              type="button"
              onClick={() => setType('ingreso')}
              className={`py-2 rounded-lg text-xs font-semibold ${
                type === 'ingreso'
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Refuerzo (Ingreso)
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Concepto / Detalle
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'egreso'
                  ? 'Ej: Reposición de tizas, hielo, limpieza'
                  : 'Ej: Refuerzo de cambio en gaveta'
              }
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-[#006948]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Monto ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500"
              min={1}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:bg-white focus:border-[#006948]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-bold"
            >
              Guardar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 6. Receipt / Resumen X / Cierre Z Modal */
interface ReceiptModalProps {
  mode: 'ticket' | 'resumen_x' | 'cierre_z';
  ticket?: SessionTicket;
  tickets: SessionTicket[];
  movements: CashMovement[];
  openingCash: number;
  operatorName: string;
  onClose: () => void;
  onConfirmCloseShift?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  mode,
  ticket,
  tickets,
  movements,
  openingCash,
  operatorName,
  onClose,
  onConfirmCloseShift,
}) => {
  const totalCollected = tickets.reduce((s, t) => s + t.totalAmount, 0);
  const cashTotal = tickets
    .filter((t) => t.paymentMethod === 'Efectivo')
    .reduce((s, t) => s + t.totalAmount, 0);
  const digitalTotal = totalCollected - cashTotal;
  const egresos = movements
    .filter((m) => m.type === 'egreso')
    .reduce((s, m) => s + m.amount, 0);
  const drawerFinal = openingCash + cashTotal - egresos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0b1c30]">
            {mode === 'ticket'
              ? `Comprobante ${ticket?.id}`
              : mode === 'resumen_x'
              ? 'Resumen Parcial de Caja (X)'
              : 'Cierre Definitivo de Turno (Z)'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 font-mono text-xs space-y-2">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <div className="font-bold text-sm text-[#0b1c30]">
                CRASH MANAGER · SALA CENTRAL
              </div>
              <div className="text-[11px] text-slate-500">
                Operador: {operatorName}
              </div>
            </div>

            {mode === 'ticket' && ticket ? (
              <>
                <div className="flex justify-between">
                  <span>Mesa:</span>
                  <span className="font-bold">
                    {ticket.tableName} ({ticket.tableZone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hora cierre:</span>
                  <span>{ticket.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo jugado:</span>
                  <span>
                    {ticket.durationLabel} ({ticket.durationSubtext})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Alquiler mesa:</span>
                  <span>{formatCurrency(ticket.tableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cantina ({ticket.cantinaSummary}):</span>
                  <span>{formatCurrency(ticket.cantinaAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-300 pt-2 text-sm font-bold text-[#006948]">
                  <span>TOTAL ({ticket.paymentMethod}):</span>
                  <span>{formatCurrency(ticket.totalAmount)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Operaciones cerradas:</span>
                  <span className="font-bold">{tickets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fondo inicial apertura:</span>
                  <span>{formatCurrency(openingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cobros Efectivo:</span>
                  <span>{formatCurrency(cashTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cobros Digital &amp; QR:</span>
                  <span>{formatCurrency(digitalTotal)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Gastos / Egresos:</span>
                  <span>-{formatCurrency(egresos)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-300 pt-2 text-sm font-bold text-[#006948]">
                  <span>EFECTIVO EN GAVETA:</span>
                  <span>{formatCurrency(drawerFinal)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#0b1c30]">
                  <span>TOTAL RECAUDADO TURNO:</span>
                  <span>{formatCurrency(totalCollected)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            {mode === 'cierre_z' && onConfirmCloseShift ? (
              <button
                type="button"
                onClick={onConfirmCloseShift}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs font-bold"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Cierre Z</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#006948] text-white text-xs font-bold"
              >
                Listo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
