import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { AnalyticsView } from './components/AnalyticsView';
import { ConsumeModal } from './components/ConsumeModal';
import { HistoryCashView } from './components/HistoryCashView';
import { LoginScreen } from './components/LoginScreen';
import {
  CashMovementModal,
  EditPlayersModal,
  RateModal,
  ReceiptModal,
  ReserveMaintModal,
  StartTableModal,
} from './components/QuickModals';
import { Sidebar } from './components/Sidebar';
import { TableBoard } from './components/TableBoard';
import { TableDetailModal } from './components/TableDetailModal';
import { TopBar } from './components/TopBar';
import {
  INITIAL_MOVEMENTS,
  INITIAL_TABLES,
  INITIAL_TICKETS,
  OPERATORS,
} from './data/mockData';
import {
  CashMovement,
  MenuItem,
  NavView,
  Operator,
  PaymentMethod,
  Player,
  PoolTable,
  SessionTicket,
  TableStatus,
} from './types/billiards';
import {
  addMinutesToTimeStr,
  computeTableBilling,
  formatCurrency,
  formatDurationHm,
} from './utils/format';

export default function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentOperator, setCurrentOperator] = useState<Operator>(
    OPERATORS[0]
  );
  const [activeView, setActiveView] = useState<NavView>('tablero');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'todas'>(
    'todas'
  );
  const [globalRate, setGlobalRate] = useState<number>(7000);
  const [tables, setTables] = useState<PoolTable[]>(INITIAL_TABLES);
  const [tickets, setTickets] = useState<SessionTicket[]>(INITIAL_TICKETS);
  const [movements, setMovements] = useState<CashMovement[]>(INITIAL_MOVEMENTS);
  const openingCash = 20000;

  // Live clock starting near 21:42:18
  const [clockDate, setClockDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(21, 42, 18, 0);
    return d;
  });

  // Modals state
  const [detailTableId, setDetailTableId] = useState<number | null>(null);
  const [consumeTableId, setConsumeTableId] = useState<number | null>(null);
  const [startModalTable, setStartModalTable] = useState<PoolTable | null>(
    null
  );
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [editPlayersTableId, setEditPlayersTableId] = useState<number | null>(
    null
  );
  const [reserveMaintState, setReserveMaintState] = useState<{
    table: PoolTable;
    mode: 'reserve' | 'maintenance';
  } | null>(null);
  const [movementModalType, setMovementModalType] = useState<
    'egreso' | 'ingreso' | null
  >(null);
  const [receiptModalState, setReceiptModalState] = useState<{
    mode: 'ticket' | 'resumen_x' | 'cierre_z';
    ticket?: SessionTicket;
  } | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // 1-second live operational ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setClockDate((prev) => new Date(prev.getTime() + 1000));
      setTables((prevTables) =>
        prevTables.map((t) => {
          if (t.isPaused) return t;
          if (t.status === 'en_juego' || t.status === 'por_terminar') {
            const nextRem = Math.max(0, t.remainingSeconds - 1);
            const nextElap = t.elapsedSeconds + 1;
            let nextStatus: TableStatus = t.status;
            if (nextRem === 0) {
              nextStatus = 'cumplido';
            } else if (nextRem <= 300) {
              nextStatus = 'por_terminar';
            }
            return {
              ...t,
              status: nextStatus,
              remainingSeconds: nextRem,
              elapsedSeconds: nextElap,
              overtimeSeconds: nextRem === 0 ? 1 : t.overtimeSeconds,
            };
          }
          if (t.status === 'cumplido') {
            return {
              ...t,
              elapsedSeconds: t.elapsedSeconds + 1,
              overtimeSeconds: t.overtimeSeconds + 1,
            };
          }
          return t;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const clockStr = useMemo(() => {
    const h = String(clockDate.getHours()).padStart(2, '0');
    const m = String(clockDate.getMinutes()).padStart(2, '0');
    const s = String(clockDate.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [clockDate]);

  const counts = useMemo(() => {
    return {
      todas: tables.length,
      en_juego: tables.filter((t) => t.status === 'en_juego').length,
      libre: tables.filter((t) => t.status === 'libre').length,
      por_terminar: tables.filter((t) => t.status === 'por_terminar').length,
      cumplido: tables.filter((t) => t.status === 'cumplido').length,
      reservada: tables.filter((t) => t.status === 'reservada').length,
      mantenimiento: tables.filter((t) => t.status === 'mantenimiento').length,
    };
  }, [tables]);

  const activeCount = counts.en_juego + counts.por_terminar + counts.cumplido;
  const occupancyPct = Math.round((activeCount / tables.length) * 100);

  const detailTable = useMemo(
    () => tables.find((t) => t.id === detailTableId) || null,
    [tables, detailTableId]
  );
  const consumeTable = useMemo(
    () => tables.find((t) => t.id === consumeTableId) || null,
    [tables, consumeTableId]
  );
  const editPlayersTable = useMemo(
    () => tables.find((t) => t.id === editPlayersTableId) || null,
    [tables, editPlayersTableId]
  );
  const freeTables = useMemo(
    () => tables.filter((t) => t.status === 'libre'),
    [tables]
  );

  // Handlers
  const handleQuickExtend = (tableId: number, minutes: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const addSec = minutes * 60;
        const nextRem = t.remainingSeconds + addSec;
        const nextBooked = t.bookedDurationSeconds + addSec;
        const nextEnd = addMinutesToTimeStr(t.endTimeStr || '17:00', minutes);
        const nextStatus: TableStatus =
          nextRem <= 300 ? 'por_terminar' : 'en_juego';
        return {
          ...t,
          status: nextStatus,
          remainingSeconds: nextRem,
          overtimeSeconds: 0,
          bookedDurationSeconds: nextBooked,
          endTimeStr: nextEnd,
        };
      })
    );
    notify(`+${minutes}m agregados a Mesa ${String(tableId).padStart(2, '0')}.`);
  };

  const handleTogglePause = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, isPaused: !t.isPaused } : t))
    );
  };

  const handleStartTable = (
    tableId: number,
    titularName: string,
    phone: string,
    playerCount: number,
    durationMinutes: number
  ) => {
    const nowH = String(clockDate.getHours()).padStart(2, '0');
    const nowM = String(clockDate.getMinutes()).padStart(2, '0');
    const startStr = `${nowH}:${nowM}`;
    const endStr = addMinutesToTimeStr(startStr, durationMinutes);

    const parts = titularName.split(' ');
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : titularName.slice(0, 2).toUpperCase();

    const newPlayers: Player[] = [
      {
        id: `p-${Date.now()}-1`,
        name: titularName,
        initials,
        role: 'Titular',
        phone,
        paid: false,
      },
    ];
    for (let i = 2; i <= playerCount; i++) {
      newPlayers.push({
        id: `p-${Date.now()}-${i}`,
        name: `Jugador ${i}`,
        initials: `J${i}`,
        role: 'Invitado',
        paid: false,
      });
    }

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: durationMinutes <= 5 ? 'por_terminar' : 'en_juego',
              attendant: currentOperator.shortName.split(' ')[0],
              attendantCode: `${currentOperator.shortName} (${currentOperator.role})`,
              startTimeStr: startStr,
              endTimeStr: endStr,
              remainingSeconds: durationMinutes * 60,
              elapsedSeconds: 0,
              overtimeSeconds: 0,
              bookedDurationSeconds: durationMinutes * 60,
              discountAmount: 0,
              isPaused: false,
              players: newPlayers,
              orders: [],
            }
          : t
      )
    );
    setStartModalOpen(false);
    setStartModalTable(null);
    notify(
      `Mesa ${String(tableId).padStart(2, '0')} iniciada (${durationMinutes} min).`
    );
  };

  const handleActivateReservation = (tableId: number) => {
    const nowH = String(clockDate.getHours()).padStart(2, '0');
    const nowM = String(clockDate.getMinutes()).padStart(2, '0');
    const startStr = `${nowH}:${nowM}`;
    const endStr = addMinutesToTimeStr(startStr, 60);

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'en_juego',
              startTimeStr: startStr,
              endTimeStr: endStr,
              remainingSeconds: 3600,
              elapsedSeconds: 0,
              overtimeSeconds: 0,
              bookedDurationSeconds: 3600,
              isPaused: false,
            }
          : t
      )
    );
    notify(
      `Reserva activada en Mesa ${String(tableId).padStart(2, '0')}. Reloj en marcha.`
    );
  };

  const handleEnableMaintenanceTable = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'libre',
              maintenanceReason: undefined,
              maintenanceTech: undefined,
              maintenanceEstEnd: undefined,
            }
          : t
      )
    );
    notify(`Mesa ${String(tableId).padStart(2, '0')} habilitada y disponible.`);
  };

  const handleConfirmOrders = (
    tableId: number,
    items: { menuItem: MenuItem; quantity: number }[],
    note: string
  ) => {
    const nowH = String(clockDate.getHours()).padStart(2, '0');
    const nowM = String(clockDate.getMinutes()).padStart(2, '0');
    const servedAt = `${nowH}:${nowM} hs`;

    const newItems = items.map((entry, idx) => ({
      id: `ord-${Date.now()}-${idx}`,
      menuItemId: entry.menuItem.id,
      name: entry.menuItem.name,
      quantity: entry.quantity,
      unitPrice: entry.menuItem.price,
      servedAt,
      servedBy: `Despachado por ${currentOperator.shortName}`,
      category: entry.menuItem.category,
      note: idx === 0 && note ? note : undefined,
    }));

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, orders: [...t.orders, ...newItems] } : t
      )
    );
    setConsumeTableId(null);
    notify(
      `Consumos cargados a Mesa ${String(tableId).padStart(2, '0')} correctamente.`
    );
  };

  const handleRemoveOrderItem = (tableId: number, orderId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, orders: t.orders.filter((o) => o.id !== orderId) }
          : t
      )
    );
    notify('Ítem quitado de la mesa.');
  };

  const handleTogglePlayerPaid = (tableId: number, playerId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              players: t.players.map((p) =>
                p.id === playerId ? { ...p, paid: !p.paid } : p
              ),
            }
          : t
      )
    );
  };

  const handleSavePlayers = (tableId: number, players: Player[]) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, players } : t))
    );
    setEditPlayersTableId(null);
    notify('Lista de jugadores actualizada.');
  };

  const handleApplyDiscount = (tableId: number, discount: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, discountAmount: discount } : t
      )
    );
    notify(`Descuento de ${formatCurrency(discount)} aplicado.`);
  };

  const handleCheckout = (tableId: number, method: PaymentMethod) => {
    const target = tables.find((t) => t.id === tableId);
    if (!target) return;

    const billing = computeTableBilling(target);
    const totalMinutes = Math.max(
      15,
      Math.round((target.elapsedSeconds || target.bookedDurationSeconds) / 60)
    );
    const nextNum = 1058 + (tickets.length - INITIAL_TICKETS.length);
    const nowH = String(clockDate.getHours()).padStart(2, '0');
    const nowM = String(clockDate.getMinutes()).padStart(2, '0');

    const cantinaSummary =
      target.orders.length > 0
        ? target.orders
            .slice(0, 2)
            .map((o) => `${o.quantity} ${o.name.split(' ')[0]}`)
            .join(' + ') +
          (target.orders.length > 2 ? ` (+${target.orders.length - 2})` : '')
        : 'Sin consumos cantina';

    const newTicket: SessionTicket = {
      id: `#T-${nextNum}`,
      time: `${nowH}:${nowM} hs`,
      tableCode: target.code,
      tableName: target.name,
      tableZone: target.zone,
      durationLabel: formatDurationHm(totalMinutes),
      durationMinutes: totalMinutes,
      durationSubtext:
        target.overtimeSeconds > 0
          ? `${Math.ceil(target.overtimeSeconds / 60)}m excedente`
          : 'Tiempo pactado exacto',
      cantinaSummary,
      cantinaAmount: billing.ordersSubtotal,
      tableAmount: billing.tableCharge,
      tableAmountNote: `Mesa ${formatCurrency(billing.tableCharge)}${
        billing.ordersSubtotal > 0
          ? ` + Bar ${formatCurrency(billing.ordersSubtotal)}`
          : ''
      }`,
      paymentMethod: method,
      totalAmount: billing.total,
      operator: currentOperator.shortName,
    };

    setTickets((prev) => [newTicket, ...prev]);

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'libre',
              remainingSeconds: 0,
              elapsedSeconds: 0,
              overtimeSeconds: 0,
              isPaused: false,
              discountAmount: 0,
              players: [],
              orders: [],
              todayRevenue: t.todayRevenue + billing.total,
              todayHours: Number((t.todayHours + totalMinutes / 60).toFixed(1)),
              todayOccupancyPct: Math.min(99, t.todayOccupancyPct + 4),
            }
          : t
      )
    );

    setDetailTableId(null);
    notify(
      `${target.name} cobrada (${formatCurrency(billing.total)} · ${method}) y liberada.`
    );
  };

  const handleSaveGlobalRate = (newRate: number) => {
    setGlobalRate(newRate);
    setTables((prev) => prev.map((t) => ({ ...t, hourlyRate: newRate })));
    setRateModalOpen(false);
    notify(`Tarifa global actualizada a ${formatCurrency(newRate)}/h.`);
  };

  const handleSaveReserve = (
    tableId: number,
    name: string,
    time: string,
    playersCount: number
  ) => {
    const players: Player[] = Array.from({ length: playersCount }, (_, i) => ({
      id: `res-${Date.now()}-${i}`,
      name: i === 0 ? name : `Jugador ${i + 1}`,
      initials: i === 0 ? name.slice(0, 2).toUpperCase() : `J${i + 1}`,
      role: i === 0 ? 'Titular' : 'Invitado',
      paid: false,
    }));
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'reservada',
              reservationName: name,
              reservationTime: time,
              reservationEtaMinutes: 25,
              attendant: currentOperator.shortName.split(' ')[0],
              players,
            }
          : t
      )
    );
    setReserveMaintState(null);
    notify(`Reserva guardada para ${name} en Mesa ${String(tableId).padStart(2, '0')}.`);
  };

  const handleCancelReserve = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'libre',
              reservationName: undefined,
              reservationTime: undefined,
              players: [],
            }
          : t
      )
    );
    setReserveMaintState(null);
    notify(`Reserva cancelada en Mesa ${String(tableId).padStart(2, '0')}.`);
  };

  const handleSaveMaintenance = (
    tableId: number,
    reason: string,
    estEnd: string
  ) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'mantenimiento',
              maintenanceReason: reason,
              maintenanceTech: 'Técnico Asignado',
              maintenanceEstEnd: estEnd,
            }
          : t
      )
    );
    setReserveMaintState(null);
    notify(`Mesa ${String(tableId).padStart(2, '0')} en mantenimiento.`);
  };

  const handleAddMovement = (
    type: 'egreso' | 'ingreso',
    description: string,
    amount: number
  ) => {
    const nowH = String(clockDate.getHours()).padStart(2, '0');
    const nowM = String(clockDate.getMinutes()).padStart(2, '0');
    setMovements((prev) => [
      ...prev,
      {
        id: `mov-${Date.now()}`,
        type,
        description,
        amount,
        time: `${nowH}:${nowM} hs`,
        operator: currentOperator.shortName,
      },
    ]);
    setMovementModalType(null);
    notify(
      `${type === 'egreso' ? 'Gasto' : 'Ingreso'} de ${formatCurrency(amount)} registrado en caja.`
    );
  };

  const handleTogglePromo = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, promoActive: !t.promoActive } : t
      )
    );
    notify(`Estado de promoción actualizado en Mesa ${String(tableId).padStart(2, '0')}.`);
  };

  const handleLoginSuccess = (op: Operator) => {
    setCurrentOperator(op);
    setIsAuthenticated(true);
    notify(`Turno iniciado como ${op.name}.`);
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  const dashboardElement = (
    <div className="min-h-screen w-full bg-[#f4f7fb] text-[#0b1c30] flex flex-col lg:flex-row">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
        statusFilter={statusFilter}
        onChangeStatusFilter={setStatusFilter}
        counts={counts}
        occupancyPct={occupancyPct}
        activeCount={activeCount}
        totalCount={tables.length}
      />

      {/* Right Main Shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeView={activeView}
          globalRate={globalRate}
          onOpenRateModal={() => setRateModalOpen(true)}
          clockStr={clockStr}
          currentOperator={currentOperator}
          onLockShift={handleLogout}
          onSwitchOperator={(op) => {
            setCurrentOperator(op);
            notify(`Operador cambiado a ${op.name}.`);
          }}
          operators={OPERATORS}
          occupancyPct={occupancyPct}
          totalTables={tables.length}
        />

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeView === 'tablero' && (
              <motion.div
                key="tablero"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                <TableBoard
                  tables={tables}
                  statusFilter={statusFilter}
                  onChangeStatusFilter={setStatusFilter}
                  globalRate={globalRate}
                  onOpenRateModal={() => setRateModalOpen(true)}
                  onOpenQuickStartModal={(pre) => {
                    setStartModalTable(pre || null);
                    setStartModalOpen(true);
                  }}
                  onOpenDetail={(t) => setDetailTableId(t.id)}
                  onOpenConsume={(t) => setConsumeTableId(t.id)}
                  onQuickExtend={handleQuickExtend}
                  onActivateReservation={handleActivateReservation}
                  onEnableMaintenanceTable={handleEnableMaintenanceTable}
                  onOpenReserveOrMaint={(table, mode) =>
                    setReserveMaintState({ table, mode })
                  }
                  counts={counts}
                />
              </motion.div>
            )}

            {activeView === 'analiticas' && (
              <motion.div
                key="analiticas"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                <AnalyticsView
                  tables={tables}
                  tickets={tickets}
                  globalRate={globalRate}
                  onOpenDetail={(t) => {
                    if (t.status === 'libre') {
                      setStartModalTable(t);
                      setStartModalOpen(true);
                    } else if (
                      t.status === 'en_juego' ||
                      t.status === 'por_terminar' ||
                      t.status === 'cumplido'
                    ) {
                      setDetailTableId(t.id);
                    } else {
                      setReserveMaintState({
                        table: t,
                        mode:
                          t.status === 'mantenimiento'
                            ? 'maintenance'
                            : 'reserve',
                      });
                    }
                  }}
                  onTogglePromo={handleTogglePromo}
                  onNotify={notify}
                />
              </motion.div>
            )}

            {activeView === 'historial' && (
              <motion.div
                key="historial"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                <HistoryCashView
                  tickets={tickets}
                  movements={movements}
                  openingCash={openingCash}
                  onOpenMovementModal={(type) => setMovementModalType(type)}
                  onOpenReceiptModal={(mode, ticket) =>
                    setReceiptModalState({ mode, ticket })
                  }
                  onNotify={notify}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Operational Modals */}
      {detailTable && (
        <TableDetailModal
          table={detailTable}
          onClose={() => setDetailTableId(null)}
          onExtend={handleQuickExtend}
          onTogglePause={handleTogglePause}
          onOpenConsume={(t) => setConsumeTableId(t.id)}
          onRemoveOrderItem={handleRemoveOrderItem}
          onTogglePlayerPaid={handleTogglePlayerPaid}
          onEditPlayers={(t) => setEditPlayersTableId(t.id)}
          onApplyDiscount={handleApplyDiscount}
          onCheckout={handleCheckout}
        />
      )}

      {consumeTable && (
        <ConsumeModal
          table={consumeTable}
          onClose={() => setConsumeTableId(null)}
          onConfirmOrders={handleConfirmOrders}
        />
      )}

      {startModalOpen && (
        <StartTableModal
          freeTables={freeTables}
          preselectedTable={startModalTable}
          globalRate={globalRate}
          onClose={() => {
            setStartModalOpen(false);
            setStartModalTable(null);
          }}
          onStartTable={handleStartTable}
        />
      )}

      {rateModalOpen && (
        <RateModal
          currentRate={globalRate}
          onClose={() => setRateModalOpen(false)}
          onSaveRate={handleSaveGlobalRate}
        />
      )}

      {editPlayersTable && (
        <EditPlayersModal
          table={editPlayersTable}
          onClose={() => setEditPlayersTableId(null)}
          onSavePlayers={handleSavePlayers}
        />
      )}

      {reserveMaintState && (
        <ReserveMaintModal
          table={reserveMaintState.table}
          initialMode={reserveMaintState.mode}
          onClose={() => setReserveMaintState(null)}
          onSaveReserve={handleSaveReserve}
          onCancelReserve={handleCancelReserve}
          onSaveMaintenance={handleSaveMaintenance}
        />
      )}

      {movementModalType && (
        <CashMovementModal
          defaultType={movementModalType}
          onClose={() => setMovementModalType(null)}
          onAddMovement={handleAddMovement}
        />
      )}

      {receiptModalState && (
        <ReceiptModal
          mode={receiptModalState.mode}
          ticket={receiptModalState.ticket}
          tickets={tickets}
          movements={movements}
          openingCash={openingCash}
          operatorName={currentOperator.name}
          onClose={() => setReceiptModalState(null)}
          onConfirmCloseShift={() => {
            setReceiptModalState(null);
            handleLogout();
          }}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.16 }}
            className="fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0b1c30] text-white text-xs font-semibold shadow-xl border border-white/10"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginScreen onLogin={handleLoginSuccess} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? dashboardElement : <Navigate to="/" replace />
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
        }
      />
    </Routes>
  );
}
