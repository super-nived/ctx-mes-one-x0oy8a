import React, { useRef, useState } from 'react';
import { Machine, WorkOrder } from '../types';

export default function ImportExport({ data, onImport }: { data: { orders: WorkOrder[]; machines: Machine[] }; onImport: (d: { orders: WorkOrder[]; machines: Machine[] }) => void }) {
  const [json, setJson] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simple-mes-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
        onImport({ orders: parsed.orders || [], machines: parsed.machines || [] });
      } catch (e: any) {
        alert('Import failed: ' + e.message);
      }
    };
    reader.readAsText(file);
  };

  const importFromTextarea = () => {
    try {
      const parsed = JSON.parse(json);
      onImport({ orders: parsed.orders || [], machines: parsed.machines || [] });
      setJson('');
    } catch (e: any) {
      alert('Invalid JSON: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Export</h3>
        <button onClick={download} className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Download Backup</button>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Import from File</h3>
        <input type="file" ref={fileRef} accept="application/json" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Import from JSON</h3>
        <textarea value={json} onChange={e => setJson(e.target.value)} className="w-full border rounded p-2" rows={8} placeholder='{"orders":[],"machines":[]}' />
        <div className="mt-3 flex gap-2">
          <button onClick={importFromTextarea} className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Import</button>
          <button onClick={() => setJson('')} className="px-3 py-2 rounded-md border">Clear</button>
        </div>
      </div>
    </div>
  );
}
