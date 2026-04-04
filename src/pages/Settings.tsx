import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function Settings() {
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStatements()
      .then((res) => setStatements(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this statement and all its transactions?')) return;
    try {
      await api.deleteStatement(id);
      setStatements((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">About</h3>
        <p className="text-sm text-gray-500">
          BudgetLens v0.1.0 — Personal finance analytics for Belarusian bank statements.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Powered by Claude AI for intelligent transaction parsing and merchant normalization.
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Imported Statements</h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 rounded bg-gray-100" />
            ))}
          </div>
        ) : statements.length === 0 ? (
          <p className="text-sm text-gray-400">No statements imported yet.</p>
        ) : (
          <div className="space-y-2">
            {statements.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {s.bankFormat?.displayName || 'Priorbank'} — {s.periodFrom} to {s.periodTo}
                  </p>
                  <p className="text-xs text-gray-400">{s.rawFilename}</p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="rounded px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
