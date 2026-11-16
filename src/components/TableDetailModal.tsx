import React, { useState } from 'react';
import {
  Check,
  Clock,
  CreditCard,
  Hash,
  Pause,
  Pencil,
  Play,
  ShoppingCart,
  Trash2,
  User,
  Utensils,
  Wine,
  X,
} from 'lucide-react';
import { PaymentMethod, PoolTable } from '../types/billiards';
import {
  computeTableBilling,
  formatCurrency,
  formatHMS,
} from '../utils/format';

interface TableDetailModalProps {
  table: PoolTable;
  onClose: () => void;
  onExtend: (tableId: number, minutes: number) => void;
  onTogglePause: (tableId: number) => void;
  onOpenConsume: (table: PoolTable) => void;
  onRemoveOrderItem: (tableId: number, orderId: string) => void;
  onTogglePlayerPaid: (tableId: number, playerId: string) => void;
  onEditPlayers: (table: PoolTable) => void;
  onApplyDiscount: (tableId: number, discount: number) => void;
  onCheckout: (tableId: number, method: PaymentMethod) => void;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  onClose,
  onExtend,
  onTogglePause,
  onOpenConsume,
  onRemoveOrderItem,
  onTogglePlayerPaid,
  onEditPlayers,
  onApplyDiscount,
  onCheckout,
}) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Mercado Pago QR');
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState(
    String(table.discountAmount || 0)
  );

  const billing = computeTableBilling(table);
  const progressPct =
    table.bookedDurationSeconds > 0
      ? Math.min(
          100,
          Math.round((table.elapsedSeconds / table.bookedDurationSeconds) * 100)
        )
      : 0;

  const isOvertime = table.status === 'cumplido';
  const isEnding = table.status === 'por_terminar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0b1c30]/45 backdrop-blur-xs">
      <div
        className="w-full max-w-[1020px] max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-[#0b1c30]">
                  {table.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    isOvertime
                      ? 'bg-red-50 text-red-700'
                      : isEnding
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOvertime
                        ? 'bg-red-500'
                        : isEnding
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {isOvertime
                    ? 'Tiempo Cumplido'
                    : isEnding
                    ? 'Por Terminar'
                    : table.isPaused
                    ? 'En Pausa'
                    : 'En Juego'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Atendido por:{' '}
                <span className="font-semibold text-slate-700">
                  {table.attendantCode || table.attendant || 'Jorge (Cajero #04)'}
                </span>{' '}
                · Tarifa:{' '}
                <span className="font-mono font-semibold text-slate-700">
                  {formatCurrency(table.hourlyRate)}/h
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => onExtend(table.id, 30)}
                className="px-2.5 py-1 rounded-lg hover:bg-white text-xs font-mono font-semibold text-slate-700 transition-colors"
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => onExtend(table.id, 60)}
                className="px-2.5 py-1 rounded-lg hover:bg-white text-xs font-mono font-semibold text-slate-700 transition-colors"
              >
                +1h
              </button>
              <div className="w-px h-4 bg-slate-200 mx-0.5" />
              <button
                type="button"
                onClick={() => onTogglePause(table.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  table.isPaused
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                {table.isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Reanudar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pausar</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              aria-label="Cerrar detalle de mesa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Column Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#f8faff]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1: Timer & Players */}
            <div className="space-y-4">
              {/* Timer Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  <span>
                    {isOvertime ? 'Excedente de Tiempo' : 'Tiempo Restante'}
                  </span>
                  <Clock className="w-4 h-4 text-[#006948]" />
                </div>

                <div
                  className={`font-mono text-4xl font-bold tracking-tight mt-2 tabular-nums ${
                    isOvertime
                      ? 'text-red-600'
                      : isEnding
                      ? 'text-amber-600'
                      : 'text-[#0b1c30]'
                  }`}
                >
                  {isOvertime
                    ? `+${formatHMS(table.overtimeSeconds)}`
                    : formatHMS(table.remainingSeconds)}
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Transcurrido: {formatHMS(table.elapsedSeconds)}</span>
                </div>

                <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOvertime
                        ? 'bg-red-500'
                        : isEnding
                        ? 'bg-amber-500'
                        : 'bg-[#006948]'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                  <span>Inicio: {table.startTimeStr} hs</span>
                  <span className="font-bold text-[#006948]">
                    {progressPct}%
                  </span>
                  <span>Pactado: {table.endTimeStr} hs</span>
                </div>
              </div>

              {/* Players Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    Jugadores en Mesa
                  </span>
                  <span className="text-xs font-semibold text-[#006948]">
                    {table.players.length} Personas
                  </span>
                </div>

                <div className="space-y-2">
                  {table.players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                        player.role === 'Titular'
                          ? 'bg-[#eff5ff] border-sky-200/80'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            player.role === 'Titular'
                              ? 'bg-[#006948] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {player.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#0b1c30] truncate">
                              {player.name}
                            </span>
                            {player.role === 'Titular' && (
                              <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[9px] font-bold uppercase">
                                Titular
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">
                            {player.phone || player.role}
                          </div>
                        </div>
                      </div>
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onEditPlayers(table)}
                  className="mt-3 w-full py-2 rounded-xl hover:bg-slate-50 border border-dashed border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>+ Asignar / Editar</span>
                </button>
              </div>
            </div>

            {/* Column 2: Consumos Registrados */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0b1c30]">
                      Consumos Registrados
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ({table.orders.length} pedidos cargados)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      Subtotal
                    </div>
                    <div className="font-mono text-sm font-bold text-[#006948] tabular-nums">
                      {formatCurrency(billing.ordersSubtotal)}
                    </div>
                  </div>
                </div>

                {table.orders.length === 0 ? (
                  <div className="my-8 p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <p className="text-xs font-medium text-slate-500">
                      Sin consumos registrados todavía.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {table.orders.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-[#f4f8ff] border border-slate-200/70 flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#006591] shrink-0 mt-0.5">
                            {item.category === 'Bebidas' ? (
                              <Wine className="w-3.5 h-3.5" />
                            ) : (
                              <Utensils className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#0b1c30] leading-snug">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Servido {item.servedAt} · {item.servedBy}
                            </div>
                            {item.note && (
                              <div className="text-[10px] text-sky-700 mt-0.5 italic">
                                Nota: {item.note}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                            {item.quantity}x
                          </span>
                          <span className="font-mono text-xs font-bold text-[#0b1c30] tabular-nums">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveOrderItem(table.id, item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Eliminar ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenConsume(table)}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#e1ecff] text-[#006591] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>+ Nuevo Consumo</span>
              </button>
            </div>

            {/* Column 3: Liquidación Actual & Split */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-3">
                  Liquidación Actual
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>
                      Tiempo de Mesa (
                      {Math.round(table.bookedDurationSeconds / 60)}m pactados)
                    </span>
                    <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                      {formatCurrency(billing.tableCharge)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Consumos Bar/Kiosco</span>
                    <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                      {formatCurrency(billing.ordersSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <button
                      type="button"
                      onClick={() => setEditingDiscount((v) => !v)}
                      className="text-left hover:text-[#006948] underline decoration-dotted"
                    >
                      Descuentos / Promos
                    </button>
                    {editingDiscount ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={discountInput}
                          onChange={(e) => setDiscountInput(e.target.value)}
                          className="w-20 px-2 py-0.5 border border-slate-300 rounded font-mono text-xs text-right"
                          min={0}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onApplyDiscount(
                              table.id,
                              Math.max(0, Number(discountInput) || 0)
                            );
                            setEditingDiscount(false);
                          }}
                          className="px-2 py-0.5 bg-[#006948] text-white rounded text-[10px] font-semibold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-semibold text-slate-500 tabular-nums">
                        {billing.discount > 0
                          ? `-${formatCurrency(billing.discount)}`
                          : '$0'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Highlighted Total */}
                <div className="mt-4 p-3.5 rounded-2xl bg-[#eafbf3] border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold tracking-wider text-[#006948] uppercase">
                      Total Acumulado
                    </div>
                    <div className="text-[11px] text-emerald-700/80">
                      Impuestos incluidos
                    </div>
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#006948] tabular-nums">
                    {formatCurrency(billing.total)}
                  </div>
                </div>

                {/* Split among players */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs font-bold text-[#0b1c30]">
                        División entre jugadores
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {table.players.length} personas
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 font-mono text-[11px] font-bold text-[#006591] tabular-nums">
                      {formatCurrency(billing.perPlayer)} / c.u.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {table.players.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onTogglePlayerPaid(table.id, p.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors text-xs"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                              p.paid
                                ? 'bg-[#006948] text-white'
                                : 'bg-[#006948]/15 border border-[#006948] text-[#006948]'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </span>
                          <span className="font-semibold text-[#0b1c30] truncate">
                            {p.name} {p.role === 'Titular' ? '(Titular)' : ''}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-[#0b1c30] tabular-nums">
                            {formatCurrency(billing.perPlayer)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              p.paid
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-white text-slate-500 border border-slate-200'
                            }`}
                          >
                            {p.paid ? 'Pagado' : 'Pendiente'}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1.5">
                  Método de Cobro
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      'Efectivo',
                      'Mercado Pago QR',
                      'Tarjeta Débito',
                    ] as PaymentMethod[]
                  ).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all truncate ${
                        paymentMethod === method
                          ? 'bg-[#0b1c30] text-white border-[#0b1c30]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {method === 'Mercado Pago QR'
                        ? 'MP QR'
                        : method === 'Tarjeta Débito'
                        ? 'Débito'
                        : 'Efectivo'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0b1c30] hover:bg-slate-100 transition-colors"
          >
            Volver al Tablero
          </button>

          <button
            type="button"
            onClick={() => onCheckout(table.id, paymentMethod)}
            className="px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span className="font-mono tabular-nums">
              Cobrar y Liberar Mesa ({formatCurrency(billing.total)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
