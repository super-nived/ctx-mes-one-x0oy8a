import { Machine, WorkOrder } from '../types';

const KEY = 'simple-mes-data-v1';

export function loadData(): { orders: WorkOrder[]; machines: Machine[] } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load data', e);
    return null;
  }
}

export function saveData(data: { orders: WorkOrder[]; machines: Machine[] }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

export function seedInitial() {
  const now = Date.now();
  const machines: Machine[] = [
    { id: 'MC-01', name: 'CNC Mill 01', status: 'idle', history: [{ from: now, status: 'idle' }] },
    { id: 'MC-02', name: 'Lathe 02', status: 'idle', history: [{ from: now, status: 'idle' }] },
    { id: 'MC-03', name: 'Laser Cutter', status: 'maintenance', history: [{ from: now, status: 'maintenance' }] },
  ];
  const orders: WorkOrder[] = [
    { id: 'WO-1001', item: 'Bracket A', qty: 500, producedQty: 120, scrapQty: 3, dueDate: new Date(Date.now()+86400000).toISOString().slice(0,10), priority: 'high', status: 'in_progress', machineId: 'MC-01', startTime: now - 2*3600*1000 },
    { id: 'WO-1002', item: 'Shaft B', qty: 200, producedQty: 0, scrapQty: 0, dueDate: new Date(Date.now()+3*86400000).toISOString().slice(0,10), priority: 'medium', status: 'planned' },
    { id: 'WO-1003', item: 'Cover C', qty: 1000, producedQty: 600, scrapQty: 8, dueDate: new Date(Date.now()+2*86400000).toISOString().slice(0,10), priority: 'urgent', status: 'paused', machineId: 'MC-02', startTime: now - 5*3600*1000 },
  ];
  saveData({ orders, machines });
  return { orders, machines };
}
