import React, { useEffect, useState } from 'react';
import { WorkOrder } from '../types';

export default function OrderForm({ initial, onSave, onCancel }: { initial?: WorkOrder; onSave: (order: WorkOrder) => void; onCancel: () => void }) {
  const [id, setId] = useState(initial?.id || genId());
  const [item, setItem] = useState(initial?.item || '');
  const [qty, setQty] = useState(initial?.qty || 1);
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [customer, setCustomer] = useState(initial?.customer || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  useEffect(() => {
    if (initial) {
      setId(initial.id);
    }
  }, [initial]);

  const save = () => {
    if (!item.trim()) return alert('Item is required');
    if (qty <= 0) return alert('Quantity must be positive');
    const base: WorkOrder = {
      id,
      item: item.trim(),
      qty: Math.round(qty),
      producedQty: initial?.producedQty ?? 0,
      scrapQty: initial?.scrapQty ?? 0,
      dueDate: dueDate || undefined,
      priority: (priority as any),
      status: initial?.status ?? 'planned',
      customer: customer || undefined,
      notes: notes || undefined,
      machineId: initial?.machineId,
      startTime: initial?.startTime,
      endTime: initial?.endTime,
    };
    onSave(base);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{initial ? 'Edit Order' : 'New Order'}</h3>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Order ID</label>
            <input value={id} onChange={e => setId(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Item</label>
            <input value={item} onChange={e => setItem(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g. Bracket A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Quantity</label>
            <input type="number" value={qty} onChange={e => setQty(parseInt(e.target.value)||0)} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Customer</label>
            <input value={customer} onChange={e => setCustomer(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" placeholder="optional" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" rows={3} />
          </div>
        </div>
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded-md border">Cancel</button>
          <button onClick={save} className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Save</button>
        </div>
      </div>
    </div>
  );
}

function genId() {
  return 'WO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}
