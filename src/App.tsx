import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, ClipboardList, Gauge, Factory, Upload, Download } from 'lucide-react';
import { WorkOrder, Machine, MachineStatus, OrderStatus } from './types';
import { loadData, saveData, seedInitial } from './utils/storage';
import OrderForm from './components/OrderForm';
import WorkOrderList from './components/WorkOrderList';
import MachineBoard from './components/MachineBoard';
import Dashboard from './components/Dashboard';
import ImportExport from './components/ImportExport';

export default function App() {
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'machines' | 'io'>('dashboard');
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkOrder | null>(null);

  // Load from storage (or seed first run)
  useEffect(() => {
    const data = loadData();
    if (!data) {
      const seeded = seedInitial();
      setOrders(seeded.orders);
      setMachines(seeded.machines);
    } else {
      setOrders(data.orders);
      setMachines(data.machines);
    }
  }, []);

  // Persist on changes
  useEffect(() => {
    saveData({ orders, machines });
  }, [orders, machines]);

  const upsertOrder = (order: WorkOrder) => {
    setOrders(prev => {
      const exists = prev.find(o => o.id === order.id);
      if (exists) return prev.map(o => (o.id === order.id ? order : o));
      return [order, ...prev];
    });
  };

  const deleteOrder = (id: string) => {
    // If assigned to a machine, clear it
    const order = orders.find(o => o.id === id);
    if (order?.machineId) {
      setMachines(prev => prev.map(m => m.id === order.machineId ? { ...m, currentOrderId: undefined } : m));
    }
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const changeMachineStatus = (machineId: string, status: MachineStatus) => {
    setMachines(prev => prev.map(m => m.id === machineId ? withStatus(m, status) : m));
  };

  const assignOrderToMachine = (orderId: string, machineId?: string) => {
    setMachines(prev => {
      let updated = prev.map(m => {
        // clear old assignment if any
        if (m.currentOrderId === orderId && m.id !== machineId) {
          return { ...m, currentOrderId: undefined };
        }
        return m;
      });
      if (machineId) {
        updated = updated.map(m => m.id === machineId ? { ...m, currentOrderId: orderId } : m);
      }
      return updated;
    });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, machineId } : o));
  };

  const startOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    let machineId = order.machineId;
    if (!machineId) return; // require assignment first

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'in_progress', startTime: o.startTime ?? Date.now() } : o));
    setMachines(prev => prev.map(m => m.id === machineId ? withStatus(m, 'running') : m));
  };

  const pauseOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.machineId) return;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'paused' } : o));
    setMachines(prev => prev.map(m => m.id === order.machineId ? withStatus(m, 'paused') : m));
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const machineId = order.machineId;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', endTime: Date.now() } : o));
    if (machineId) {
      setMachines(prev => prev.map(m => m.id === machineId ? withStatus({ ...m, currentOrderId: undefined }, 'idle') : m));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, machineId: undefined } : o));
    }
  };

  const updateQty = (orderId: string, producedDelta: number, scrapDelta: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, producedQty: Math.max(0, o.producedQty + producedDelta), scrapQty: Math.max(0, o.scrapQty + scrapDelta) } : o));
  };

  const addMachine = (name: string) => {
    const id = 'M' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const now = Date.now();
    const machine: Machine = { id, name, status: 'idle', history: [{ from: now, status: 'idle' }] };
    setMachines(prev => [machine, ...prev]);
  };

  const removeMachine = (id: string) => {
    // Unassign any order
    setOrders(prev => prev.map(o => o.machineId === id ? { ...o, machineId: undefined } : o));
    setMachines(prev => prev.filter(m => m.id !== id));
  };

  const dataForIO = useMemo(() => ({ orders, machines }), [orders, machines]);
  const onImport = (data: { orders: WorkOrder[]; machines: Machine[] }) => {
    setOrders(data.orders || []);
    setMachines(data.machines || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Factory className="text-indigo-600" />
          <h1 className="text-xl font-semibold">Simple MES</h1>
          <nav className="ml-auto flex gap-1">
            <Tab label="Dashboard" icon={<Gauge size={16} />} active={tab==='dashboard'} onClick={() => setTab('dashboard')} />
            <Tab label="Orders" icon={<ClipboardList size={16} />} active={tab==='orders'} onClick={() => setTab('orders')} />
            <Tab label="Machines" icon={<Factory size={16} />} active={tab==='machines'} onClick={() => setTab('machines')} />
            <Tab label="Import/Export" icon={<Upload size={16} />} active={tab==='io'} onClick={() => setTab('io')} />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'dashboard' && (
          <Dashboard orders={orders} machines={machines} />
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Production Orders</h2>
              <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
                <PlusCircle size={18} /> New Order
              </button>
            </div>
            <WorkOrderList
              orders={orders}
              machines={machines}
              onEdit={(o) => { setEditing(o); setShowForm(true); }}
              onDelete={deleteOrder}
              onAssign={assignOrderToMachine}
              onStart={startOrder}
              onPause={pauseOrder}
              onComplete={completeOrder}
              onQtyChange={updateQty}
            />
          </div>
        )}

        {tab === 'machines' && (
          <MachineBoard
            machines={machines}
            orders={orders}
            onStatusChange={changeMachineStatus}
            onAssign={assignOrderToMachine}
            onAddMachine={addMachine}
            onRemoveMachine={removeMachine}
          />
        )}

        {tab === 'io' && (
          <ImportExport data={dataForIO} onImport={onImport} />
        )}
      </main>

      {showForm && (
        <OrderForm
          initial={editing || undefined}
          onCancel={() => setShowForm(false)}
          onSave={(order) => { upsertOrder(order); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function Tab({ label, icon, active, onClick }: { label: string; icon?: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'}`}
      onClick={onClick}
    >
      {icon} {label}
    </button>
  );
}

function withStatus(machine: Machine, next: MachineStatus): Machine {
  const now = Date.now();
  const last = machine.history[machine.history.length - 1];
  let history = machine.history.slice();
  if (!last || last.status !== next) {
    if (last && last.to === undefined) {
      history[history.length - 1] = { ...last, to: now };
    }
    history.push({ from: now, status: next });
  }
  return { ...machine, status: next, history };
}
