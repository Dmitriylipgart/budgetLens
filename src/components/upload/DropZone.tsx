import { useState, useCallback, useRef } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFileSelect, disabled = false }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith('.csv')) onFileSelect(file);
    },
    [onFileSelect, disabled],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-50'
          : isDragging
            ? 'border-brand-400 bg-brand-50'
            : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-gray-50'
      }`}
    >
      <span className="text-4xl mb-3">📄</span>
      <p className="text-sm font-medium text-gray-700">
        {disabled ? 'Processing...' : 'Drop your bank CSV here, or click to browse'}
      </p>
      <p className="mt-1 text-xs text-gray-400">Priorbank export (.csv, Windows-1251)</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
