export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type OrderStatus = 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface WorkOrder {
  id: string;
  customer?: string;
  item: string;
  qty: number;
  producedQty: number;
  scrapQty: number;
  dueDate?: string; // ISO date
  priority: Priority;
  status: OrderStatus;
  machineId?: string;
  startTime?: number;
  endTime?: number;
  notes?: string;
}

export type MachineStatus = 'idle' | 'running' | 'paused' | 'down' | 'maintenance';

export interface MachineStateSpan {
  from: number;
  to?: number;
  status: MachineStatus;
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  currentOrderId?: string;
  history: MachineStateSpan[];
}
