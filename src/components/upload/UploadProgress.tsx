interface Props {
  step: 'uploading' | 'parsing' | 'saving' | 'done' | 'error';
  error?: string;
}

const steps = [
  { key: 'uploading', label: 'Uploading file' },
  { key: 'parsing', label: 'AI parsing transactions' },
  { key: 'saving', label: 'Saving to database' },
  { key: 'done', label: 'Complete' },
];

export function UploadProgress({ step, error }: Props) {
  const currentIdx = steps.findIndex((s) => s.key === step);

  if (step === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-800">Upload failed</p>
        <p className="mt-1 text-sm text-red-600">{error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="space-y-3">
        {steps.map((s, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx || step === 'done';
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-600'
                    : isActive
                      ? 'bg-brand-100 text-brand-600 animate-pulse'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? 'font-medium text-gray-900'
                    : isDone
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                }`}
              >
                {s.label}
                {isActive && step !== 'done' && '...'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
