import { useState, useEffect } from 'react';
import { DropZone } from '../components/upload/DropZone';
import { UploadProgress } from '../components/upload/UploadProgress';
import { ImportSummary } from '../components/upload/ImportSummary';
import { api } from '../api/client';
import { formatDateTime } from '../utils/formatters';
import type { ImportResult, UploadRecord } from '../types';

export function Upload() {
  const [step, setStep] = useState<'idle' | 'uploading' | 'parsing' | 'saving' | 'done' | 'error'>(
    'idle',
  );
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<UploadRecord[]>([]);

  useEffect(() => {
    api
      .getUploads()
      .then((res) => setHistory(res.data || res))
      .catch(console.error);
  }, [result]);

  const handleUpload = async (file: File) => {
    setStep('uploading');
    setResult(null);
    setError('');

    try {
      // Show parsing step after a brief delay (upload is instant for small files)
      setTimeout(() => setStep((s) => (s === 'uploading' ? 'parsing' : s)), 500);

      const res = await api.uploadCsv(file);
      const data = res.data || res;

      setStep('done');
      setResult(data);
    } catch (err: any) {
      setStep('error');
      setError(err.message || 'Upload failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Upload Statement</h1>

      <DropZone
        onFileSelect={handleUpload}
        disabled={step === 'uploading' || step === 'parsing' || step === 'saving'}
      />

      {step !== 'idle' && step !== 'done' && (
        <UploadProgress step={step === 'error' ? 'error' : step} error={error} />
      )}

      {result && <ImportSummary result={result} />}

      {/* Upload history */}
      {history.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Upload History</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">File</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Txns</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Tokens</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Time</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-700">{u.filename}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : u.status === 'duplicate'
                            ? 'bg-amber-100 text-amber-700'
                            : u.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500">{u.txnCount ?? '—'}</td>
                  <td className="px-4 py-2 text-right text-gray-500">
                    {u.aiTokensUsed?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500">
                    {u.processingMs ? `${(u.processingMs / 1000).toFixed(1)}s` : '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-400">{formatDateTime(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
