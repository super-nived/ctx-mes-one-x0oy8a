import React, { useMemo } from 'react';
import { Machine, WorkOrder } from '../types';

export default function Dashboard({ orders, machines }: { orders: WorkOrder[]; machines: Machine[] }) {
  const stats = useMemo(() => {
    const wip = orders.filter(o => o.status === 'in_progress' || o.status === 'paused').length;
    const completedToday = orders.filter(o => o.status === 'completed' && isToday(o.endTime)).length;
    const utilization = calcUtilization(machines);
    const dueSoon = orders.filter(o => o.status !== 'completed' && o.dueDate && daysUntil(o.dueDate) <= 2).length;
    return { wip, completedToday, utilization, dueSoon };
  }, [orders, machines]);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      map[o.status] = (map[o.status] || 0) + 1;
    }
    return map;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="WIP" value={stats.wip} />
        <Stat title="Completed Today" value={stats.completedToday} />
        <Stat title="Machine Utilization" value={stats.utilization.toFixed(0) + '%'} />
        <Stat title="Due in 48h" value={stats.dueSoon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Orders by Status</h3>
          <div className="space-y-2">
            {Object.entries(byStatus).map(([s, n]) => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-28 text-slate-600 capitalize">{s.replace('_',' ')}</div>
                <div className="flex-1 h-3 bg-slate-100 rounded">
                  <div className="h-3 bg-indigo-500 rounded" style={{ width: `${(n/orders.length)*100}%` }} />
                </div>
                <div className="w-10 text-right">{n}</div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-slate-500">No data yet.</div>}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Machines</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {machines.map(m => (
              <div key={m.id} className="border rounded p-3 text-sm">
                <div className="text-slate-500">{m.id}</div>
                <div className="font-medium">{m.name}</div>
                <div className="text-slate-600">{m.status}</div>
              </div>
            ))}
            {machines.length === 0 && <div className="text-slate-500">No machines.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
      <div className="text-slate-600 text-sm">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function isToday(ts?: number) {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function daysUntil(dateIso?: string) {
  if (!dateIso) return Infinity;
  const d = new Date(dateIso).getTime();
  const now = Date.now();
  return Math.ceil((d - now) / 86400000);
}

function calcUtilization(machines: Machine[]) {
  // naive: percent of machines that are running
  if (machines.length === 0) return 0;
  const running = machines.filter(m => m.status === 'running').length;
  return (running / machines.length) * 100;
}
