'use client';

/**
 * `app/(protected)/receipts/_components/receipt-upload.tsx`
 *
 * Sprint 8.2 — Drag-drop / paste-to-upload alanı.
 *
 * ŞantiyePro `receipt-upload.tsx` davranışı korunur:
 *   - Drop zone (sürükle-bırak)
 *   - Tıkla veya Ctrl+V ile yapıştır
 *   - 4 kolonlu preview grid + remove
 *   - PDF / image mime ayrımı
 */

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Camera, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReceiptUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function ReceiptUpload({
  value,
  onChange,
  disabled = false,
  maxFiles = 20,
}: ReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      onChange([...value, ...newFiles].slice(0, maxFiles));
    },
    [value, onChange, maxFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  // Ctrl+V paste support — sayfa aktifken clipboard'tan dosya alır.
  useEffect(() => {
    if (disabled) {
      return;
    }

    const handlePaste = (e: ClipboardEvent) => {
      const itemList = e.clipboardData?.items;
      if (!itemList) {
        return;
      }
      const files: File[] = [];
      const items = Array.from(itemList);
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled, addFiles]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      addFiles(files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) {
      return;
    }
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:border-primary/50',
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <Camera className="size-8 text-primary" />
        <p className="text-sm font-medium">
          Fotoğraf seçin, sürükleyin veya yapıştırın (Ctrl+V)
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, JPEG, PNG, WebP veya GIF · tek seferde en fazla {maxFiles} dosya
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="group relative overflow-hidden rounded-lg border border-border bg-card"
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-20 w-full object-cover"
                />
              ) : (
                <div className="flex h-20 items-center justify-center bg-muted">
                  <FileText className="size-6 text-muted-foreground" />
                </div>
              )}
              <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">
                {file.name}
              </p>
              <button
                type="button"
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                aria-label={`Kaldır: ${file.name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}