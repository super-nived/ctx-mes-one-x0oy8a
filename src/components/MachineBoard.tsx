import React, { useState } from 'react';
import { Machine, MachineStatus, WorkOrder } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function MachineBoard({ machines, orders, onStatusChange, onAssign, onAddMachine, onRemoveMachine }: {
  machines: Machine[];
  orders: WorkOrder[];
  onStatusChange: (id: string, status: MachineStatus) => void;
  onAssign: (orderId: string, machineId?: string) => void;
  onAddMachine: (name: string) => void;
  onRemoveMachine: (id: string) => void;
}) {
  const [newName, setNewName] = useState('');

  const statusStyle = (s: MachineStatus) => (
    s === 'running' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    s === 'paused' ? 'bg-amber-100 text-amber-700 border-amber-200' :
    s === 'down' ? 'bg-rose-100 text-rose-700 border-rose-200' :
    s === 'maintenance' ? 'bg-sky-100 text-sky-700 border-sky-200' :
    'bg-slate-100 text-slate-700 border-slate-200'
  );

  const orderOptions = orders.filter(o => o.status !== 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New machine name" className="border rounded px-3 py-2 flex-1" />
        <button onClick={() => { if(!newName.trim()) return; onAddMachine(newName.trim()); setNewName(''); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
          <Plus size={16} /> Add Machine
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map(m => {
          const order = orders.find(o => o.id === m.currentOrderId || o.machineId === m.id);
          return (
            <div key={m.id} className={`rounded-lg border ${statusStyle(m.status)} p-4 shadow-sm`}> 
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm text-slate-500">{m.id}</div>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                </div>
                <button onClick={() => onRemoveMachine(m.id)} className="text-rose-600 hover:text-rose-700"><Trash2 size={18} /></button>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-slate-600 mb-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['idle','running','paused','down','maintenance'] as MachineStatus[]).map(s => (
                    <button key={s} className={`px-2 py-1 rounded text-xs border ${m.status===s?'bg-white/70':''}`} onClick={() => onStatusChange(m.id, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-slate-600 mb-1">Assigned Order</label>
                <select value={order?.id || ''} onChange={e => onAssign(e.target.value || '', e.target.value ? m.id : undefined)} className="border rounded px-2 py-1 w-full">
                  <option value="">Unassigned</option>
                  {orderOptions.map(o => (
                    <option key={o.id} value={o.id}>{o.id} — {o.item}</option>
                  ))}
                </select>
              </div>

              {order ? (
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <div>Item: <span className="font-medium">{order.item}</span></div>
                    <div>Qty: <span className="font-medium">{order.producedQty}/{order.qty}</span></div>
                  </div>
                  <div className="text-slate-600">Priority: {order.priority} | Status: {order.status.replace('_',' ')}</div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">No order assigned.</div>
              )}
            </div>
          );
        })}
        {machines.length === 0 && (
          <div className="col-span-full text-center text-slate-500 border rounded-lg p-10 bg-white">No machines added yet.</div>
        )}
      </div>
    </div>
  );
}
