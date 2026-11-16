import React, { useState } from 'react';
import {
  Check,
  Minus,
  Plus,
  Receipt,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { MENU_ITEMS } from '../data/mockData';
import { MenuItem, PoolTable } from '../types/billiards';
import {
  computeTableBilling,
  formatCurrency,
  formatHMS,
} from '../utils/format';

interface ConsumeModalProps {
  table: PoolTable;
  onClose: () => void;
  onConfirmOrders: (
    tableId: number,
    items: { menuItem: MenuItem; quantity: number }[],
    note: string
  ) => void;
}

export const ConsumeModal: React.FC<ConsumeModalProps> = ({
  table,
  onClose,
  onConfirmOrders,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<
    'Todas' | 'Bebidas' | 'Picadas' | 'Minutas'
  >('Todas');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const billing = computeTableBilling(table);

  const filteredMenu = MENU_ITEMS.filter((item) => {
    const matchesCat = category === 'Todas' || item.category === category;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const addItem = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decItem = (id: string) => {
    setCart((prev) => {
      const next = (prev[id] || 0) - 1;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => ({
      menuItem: MENU_ITEMS.find((m) => m.id === id)!,
      quantity: qty,
    }))
    .filter((e) => e.menuItem && e.quantity > 0);

  const newOrdersTotal = cartEntries.reduce(
    (sum, e) => sum + e.menuItem.price * e.quantity,
    0
  );
  const accumulatedKiosco = billing.ordersSubtotal + newOrdersTotal;
  const projectedTableTotal = billing.total + newOrdersTotal;

  const handleConfirm = () => {
    if (cartEntries.length === 0) return;
    onConfirmOrders(table.id, cartEntries, note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0b1c30]/45 backdrop-blur-xs">
      <div
        className="w-full max-w-[1000px] max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] border border-slate-200 flex items-center justify-center text-[#006948]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-[#0b1c30]">
                  Cargar Consumo
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-mono font-semibold text-[#006591]">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  {table.name} · Activa
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                Atiende {table.attendant || 'Matías'} · {table.zone} ·{' '}
                {formatHMS(table.elapsedSeconds)} transcurrido
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Cerrar cargar consumo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split: Catalog Left + Ticket Right */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Product Catalog */}
          <div className="lg:col-span-7 p-5 bg-[#f8faff] border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto o escanear..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {(['Todas', 'Bebidas', 'Picadas', 'Minutas'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        category === cat
                          ? 'bg-[#0b1c30] text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredMenu.map((item) => {
                const inCart = cart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => addItem(item.id)}
                    className={`p-3 rounded-xl bg-white border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      inCart > 0
                        ? 'border-[#006948] ring-1 ring-[#006948]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0b1c30] truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.description}
                      </div>
                      <div className="font-mono text-xs font-bold text-[#006948] mt-1 tabular-nums">
                        {formatCurrency(item.price)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(item.id);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        inCart > 0
                          ? 'bg-[#006948] text-white font-mono text-xs font-bold'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#006948]'
                      }`}
                    >
                      {inCart > 0 ? inCart : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Ticket de Consumo */}
          <div className="lg:col-span-5 p-5 bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0b1c30]">
                  <Receipt className="w-4 h-4 text-[#006948]" />
                  <span>Ticket de Consumo</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-600">
                  #{4020 + table.id}
                </span>
              </div>

              {/* Previously loaded */}
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-slate-200/70">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#006948]">
                    <Check className="w-3.5 h-3.5" />
                    Cargados Anteriormente ({table.orders.length})
                  </span>
                  <span className="font-mono text-[#0b1c30] tabular-nums">
                    {formatCurrency(billing.ordersSubtotal)}
                  </span>
                </div>
                {table.orders.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    Sin consumos previos en esta mesa.
                  </p>
                ) : (
                  <div className="space-y-1 text-xs text-slate-600">
                    {table.orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate">
                          {o.quantity}x {o.name}
                        </span>
                        <span className="font-mono tabular-nums shrink-0">
                          {formatCurrency(o.unitPrice * o.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New items to add */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 text-[#006948]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006948]" />
                    Nuevos Para Agregar
                  </span>
                  <span>
                    {cartEntries.reduce((s, e) => s + e.quantity, 0)} items
                  </span>
                </div>

                {cartEntries.length === 0 ? (
                  <div className="p-5 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Selecciona productos del catálogo izquierdo para añadirlos al
                    ticket.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {cartEntries.map(({ menuItem, quantity }) => (
                      <div
                        key={menuItem.id}
                        className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0b1c30] truncate">
                            {menuItem.name}
                          </div>
                          <div className="font-mono text-[11px] text-[#006948] font-semibold tabular-nums">
                            {formatCurrency(menuItem.price * quantity)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => decItem(menuItem.id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-mono text-xs font-bold tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addItem(menuItem.id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(menuItem.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nota para barra/cocina (ej: Hielo extra y vasos fríos)..."
                  className="mt-3 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#006948]"
                />
              </div>
            </div>

            {/* Bottom Summary & CTA */}
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Nuevos consumos:</span>
                <span className="font-mono font-bold text-[#006948] tabular-nums">
                  +{formatCurrency(newOrdersTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Kiosco acumulado:</span>
                <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                  {formatCurrency(accumulatedKiosco)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-[#0b1c30] pt-1">
                <span>Total Proyectado Mesa:</span>
                <span className="font-mono text-lg font-extrabold tabular-nums">
                  {formatCurrency(projectedTableTotal)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="col-span-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={cartEntries.length === 0}
                  onClick={handleConfirm}
                  className="col-span-2 py-2.5 px-4 rounded-xl bg-[#006948] hover:bg-[#00583c] disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Cargar a Mesa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
