'use client';

import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, X, Tag } from 'lucide-react';

interface BarcodeLabelGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  variantTitle?: string;
  sku?: string;
  barcode?: string;
  price?: string | number;
}

export function BarcodeLabelGenerator({
  isOpen,
  onClose,
  productTitle = 'Duelux Royal Oxford Shirt',
  variantTitle = 'White / M',
  sku = 'DX-SHIRT-WHT-M',
  barcode = '2000000010014',
  price = '3500.00',
}: BarcodeLabelGeneratorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [labelSize, setLabelSize] = useState<'50x30' | '38x25'>('50x30');

  useEffect(() => {
    if (isOpen && svgRef.current && barcode) {
      try {
        JsBarcode(svgRef.current, barcode, {
          format: barcode.length === 13 ? 'EAN13' : 'CODE128',
          width: 1.5,
          height: 38,
          displayValue: true,
          fontSize: 12,
          font: 'monospace',
          margin: 4,
        });
      } catch (err) {
        console.error('Failed to render barcode SVG:', err);
      }
    }
  }, [isOpen, barcode, labelSize]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-bold text-gray-900">Thermal Barcode Label</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Sticker Preview Box */}
        <div className="my-6 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4 border border-dashed border-gray-300">
          <div
            id="thermal-label-print-area"
            className="flex flex-col items-center justify-center rounded bg-white p-2 shadow-sm border border-gray-200"
            style={{
              width: labelSize === '50x30' ? '180px' : '150px',
              minHeight: labelSize === '50x30' ? '110px' : '90px',
            }}
          >
            <div className="text-center font-bold text-[10px] text-gray-800 line-clamp-1">
              DUELUX STORE
            </div>
            <div className="text-center text-[10px] font-medium text-gray-600 line-clamp-1">
              {productTitle} ({variantTitle})
            </div>
            <svg ref={svgRef} className="my-1 max-w-full" />
            <div className="flex w-full justify-between items-center px-1 text-[11px] font-bold text-gray-900">
              <span>{sku}</span>
              <span>৳{Number(price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Print Configuration Controls */}
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Roll Dimensions:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLabelSize('50x30')}
                className={`px-3 py-1.5 rounded-lg border font-medium ${
                  labelSize === '50x30'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                50mm × 30mm
              </button>
              <button
                type="button"
                onClick={() => setLabelSize('38x25')}
                className={`px-3 py-1.5 rounded-lg border font-medium ${
                  labelSize === '38x25'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                38mm × 25mm
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Print Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                className="h-8 w-8 rounded-lg border bg-gray-50 text-lg font-bold hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-gray-800">{printCopies}</span>
              <button
                type="button"
                onClick={() => setPrintCopies(printCopies + 1)}
                className="h-8 w-8 rounded-lg border bg-gray-50 text-lg font-bold hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-semibold text-white hover:bg-black"
          >
            <Printer className="h-4 w-4" />
            Print ({printCopies})
          </button>
        </div>
      </div>
    </div>
  );
}
