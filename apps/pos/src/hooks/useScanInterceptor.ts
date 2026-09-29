'use client';

import { useEffect, useRef } from 'react';
import { posAudio } from '../lib/audio';

interface ScanInterceptorOptions {
  onScan: (barcode: string) => void;
  charIntervalMs?: number;
  minBarcodeLength?: number;
}

export function useScanInterceptor({
  onScan,
  charIntervalMs = 35,
  minBarcodeLength = 4,
}: ScanInterceptorOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const now = performance.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key signals end of barcode scan burst
      if (event.key === 'Enter') {
        const barcode = bufferRef.current.trim();
        bufferRef.current = '';

        if (barcode.length >= minBarcodeLength) {
          event.preventDefault();
          event.stopPropagation();

          posAudio.playSuccess();
          onScanRef.current(barcode);
        }
        return;
      }

      // Ignore modifier keys
      if (event.key.length > 1) {
        return;
      }

      // If the interval between characters is greater than threshold, reset buffer
      // (because a human is typing normally)
      if (timeDiff > charIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      bufferRef.current += event.key;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [charIntervalMs, minBarcodeLength]);
}
