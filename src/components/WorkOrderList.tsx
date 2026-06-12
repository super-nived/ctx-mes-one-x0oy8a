import React from 'react';
import { Play, Pause, Check, Trash2 } from 'lucide-react';
import { Machine, WorkOrder } from '../types';

export default function WorkOrderList({ orders, machines, onEdit, onDelete, onAssign, onStart, onPause, onComplete, onQtyChange }: {
  orders: WorkOrder[];
  machines: Machine[];
  onEdit: (o: WorkOrder) => void;
  onDelete: (id: string) => void;
  onAssign: (orderId: string, machineId?: string) => void;
  onStart: (orderId: string) => void;
  onPause: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onQtyChange: (orderId: string, producedDelta: number, scrapDelta: number) => void;
}) {
  const priorityColor = (p: WorkOrder['priority']) => (
    p === 'urgent' ? 'bg-rose-100 text-rose-700' :
    p === 'high' ? 'bg-amber-100 text-amber-700' :
    p === 'medium' ? 'bg-sky-100 text-sky-700' :
    'bg-emerald-100 text-emerald-700'
  );

  const statusBadge = (s: WorkOrder['status']) => (
    s === 'completed' ? 'bg-emerald-100 text-emerald-700' :
    s === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
    s === 'paused' ? 'bg-amber-100 text-amber-700' :
    s === 'cancelled' ? 'bg-rose-100 text-rose-700' :
    'bg-slate-100 text-slate-700'
  );

  const sorted = [...orders].sort((a,b) => {
    const pri = priorityRank(a.priority) - priorityRank(b.priority);
    if (pri !== 0) return pri;
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return ad - bd;
  });

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="p-2">Order</th>
            <th className="p-2">Item</th>
            <th className="p-2">Priority</th>
            <th className="p-2">Due</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Prod/Scrap</th>
            <th className="p-2">Machine</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map(order => {
            const m = machines.find(x => x.id === order.machineId);
            const progress = Math.min(100, Math.round((order.producedQty / Math.max(1, order.qty)) * 100));
            return (
              <tr key={order.id} className="bg-white hover:bg-slate-50">
                <td className="p-2 font-medium">{order.id}</td>
                <td className="p-2">{order.item}</td>
                <td className="p-2"><span className={`px-2 py-1 rounded ${priorityColor(order.priority)}`}>{order.priority}</span></td>
                <td className="p-2">{order.dueDate || '-'}</td>
                <td className="p-2">{order.qty}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded">
                      <div className="h-2 rounded bg-indigo-500" style={{ width: progress + '%' }} />
                    </div>
                    <div className="text-slate-600">{order.producedQty} / {order.qty} ({progress}%)</div>
                  </div>
                  <div className="text-xs text-slate-500">Scrap: {order.scrapQty}</div>
                </td>
                <td className="p-2">
                  <select value={order.machineId || ''} onChange={e => onAssign(order.id, e.target.value || undefined)} className="border rounded px-2 py-1">
                    <option value="">Unassigned</option>
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2"><span className={`px-2 py-1 rounded ${statusBadge(order.status)}`}>{order.status.replace('_',' ')}</span></td>
                <td className="p-2">
                  <div className="flex items-center justify-end gap-1">
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => onQtyChange(order.id, +1, 0)}>+1</button>
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => onQtyChange(order.id, -1, 0)}>-1</button>
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => onQtyChange(order.id, 0, +1)}>+Scrap</button>
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => onQtyChange(order.id, 0, -1)}>-Scrap</button>
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => onEdit(order)}>Edit</button>
                    {order.status !== 'in_progress' && (
                      <button className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => onStart(order.id)}><Play size={14} className="inline" /> Start</button>
                    )}
                    {order.status === 'in_progress' && (
                      <button className="px-2 py-1 text-xs rounded bg-amber-600 text-white hover:bg-amber-500" onClick={() => onPause(order.id)}><Pause size={14} className="inline" /> Pause</button>
                    )}
                    <button className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => onComplete(order.id)}><Check size={14} className="inline" /> Complete</button>
                    <button className="px-2 py-1 text-xs rounded bg-rose-600 text-white hover:bg-rose-500" onClick={() => onDelete(order.id)}><Trash2 size={14} className="inline" /> Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={9} className="p-6 text-center text-slate-500">No orders yet. Click "New Order" to add one.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function priorityRank(p: WorkOrder['priority']) {
  switch (p) {
    case 'urgent': return 0;
    case 'high': return 1;
    case 'medium': return 2;
    case 'low': return 3;
  }
}
