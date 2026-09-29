'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PosHeader } from '../components/PosHeader';
import { PosProductCatalog, type CatalogVariant } from '../components/PosProductCatalog';
import { PosTicketCart, type CartLineItem } from '../components/PosTicketCart';
import { PaymentModal, type PaymentTender } from '../components/PaymentModal';
import { BarcodeLabelGenerator } from '../components/BarcodeLabelGenerator';
import { ShiftModal } from '../components/ShiftModal';
import { useScanInterceptor } from '../hooks/useScanInterceptor';
import { posAudio } from '../lib/audio';
import { ThermalPrinterDriver } from '../lib/printer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function PosTerminalPage() {
  const [outletId, setOutletId] = useState('87b12521-bbd7-11f1-a3cb-20c19b705e3f');
  const [outletName, setOutletName] = useState('Duelux Flagship Store');
  const [registerCode, setRegisterCode] = useState('REG-01');
  const [cashierId, setCashierId] = useState('87cc29d1-bbd7-11f1-a3cb-20c19b705e3f');
  const [cashierName, setCashierName] = useState('Tariqul Admin');

  // Shift & Register state
  const [shiftData, setShiftData] = useState({
    id: 'e2e619d7-bbd7-11f1-a3cb-20c19b705e3f',
    openedAt: new Date().toISOString(),
    openingFloat: 5000,
    cashSales: 2000,
    cardSales: 1675,
    mobileWalletSales: 0,
    expectedCash: 7000,
  });

  // Catalog items
  const [catalogItems, setCatalogItems] = useState<CatalogVariant[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Cart state
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [parkedOrders, setParkedOrders] = useState<Array<{ id: string; time: string; items: CartLineItem[] }>>([]);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Selected item for label generator
  const [selectedLabelItem, setSelectedLabelItem] = useState<CatalogVariant | null>(null);

  // Completed order receipt preview
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  // Fetch initial catalog
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingCatalog(true);
      const res = await fetch(`${API_BASE_URL}/catalog/products`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const flattened: CatalogVariant[] = [];
        data.data.forEach((p: any) => {
          if (Array.isArray(p.variants)) {
            p.variants.forEach((v: any) => {
              const onHand = v.inventoryLevels?.[0]?.onHandQty ? Number(v.inventoryLevels[0].onHandQty) : 50;
              flattened.push({
                variantId: v.id,
                productId: p.id,
                productTitle: p.title,
                variantTitle: v.title,
                sku: v.sku,
                barcode: v.barcode,
                sellingPrice: v.sellingPrice,
                taxRatePercent: p.taxRatePercent || 0,
                isTaxExempt: p.isTaxExempt,
                onHandQty: onHand,
              });
            });
          }
        });
        setCatalogItems(flattened);
      }
    } catch (err) {
      console.error('Failed to load products from API:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add Item to Active Ticket Cart
  const handleAddItem = useCallback((variant: CatalogVariant) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.variantId === variant.variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variant.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          variantId: variant.variantId,
          sku: variant.sku,
          productTitle: variant.productTitle,
          variantTitle: variant.variantTitle,
          unitPrice: Number(variant.sellingPrice),
          quantity: 1,
          discountAmount: 0,
          taxRatePercent: Number(variant.taxRatePercent),
        },
      ];
    });
  }, []);

  // Hardware USB Scanner Burst Interceptor
  useScanInterceptor({
    onScan: async (scannedBarcode) => {
      console.log('⚡ Hardware USB scan detected:', scannedBarcode);
      try {
        const res = await fetch(
          `${API_BASE_URL}/pos/scan/${encodeURIComponent(scannedBarcode)}?outletId=${outletId}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          handleAddItem({
            variantId: json.data.variantId,
            productId: json.data.productId,
            productTitle: json.data.productTitle,
            variantTitle: json.data.variantTitle,
            sku: json.data.sku,
            barcode: json.data.barcode,
            sellingPrice: json.data.sellingPrice,
            taxRatePercent: json.data.taxRatePercent,
            isTaxExempt: json.data.isTaxExempt,
            onHandQty: json.data.availableQty,
          });
        } else {
          posAudio.playError();
          alert(`Scanned code "${scannedBarcode}" not found in catalog.`);
        }
      } catch (err) {
        posAudio.playError();
        console.error('Scan lookup error:', err);
      }
    },
  });

  // Cart Qty updates
  const handleUpdateQty = (variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartLineItem[]
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCartItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const handleClearCart = () => {
    if (cartItems.length > 0 && confirm('Clear the active ticket?')) {
      setCartItems([]);
    }
  };

  // Park Order (Hold Ticket)
  const handleParkOrder = () => {
    if (cartItems.length === 0) return;
    setParkedOrders((prev) => [
      ...prev,
      {
        id: `PARK-${Date.now().toString().slice(-4)}`,
        time: new Date().toLocaleTimeString(),
        items: cartItems,
      },
    ]);
    setCartItems([]);
    posAudio.playSuccess();
  };

  const handleRecallOrder = (parkedId: string) => {
    const found = parkedOrders.find((p) => p.id === parkedId);
    if (found) {
      if (cartItems.length > 0) {
        handleParkOrder();
      }
      setCartItems(found.items);
      setParkedOrders((prev) => prev.filter((p) => p.id !== parkedId));
    }
  };

  // Process Checkout
  const handleCompleteCheckout = async (payments: PaymentTender[]) => {
    const payload = {
      outletId,
      shiftId: shiftData.id,
      cashierId,
      items: cartItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
      })),
      payments: payments.map((p) => ({
        tenderType: p.tenderType,
        amount: p.amount.toFixed(4),
        transactionRef: p.transactionRef,
      })),
    };

    const res = await fetch(`${API_BASE_URL}/pos/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Checkout failed');
    }

    // Update local shift sales totals
    const cashTotal = payments
      .filter((p) => p.tenderType === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);
    const cardTotal = payments
      .filter((p) => p.tenderType === 'CARD')
      .reduce((sum, p) => sum + p.amount, 0);
    const mobileTotal = payments
      .filter((p) => p.tenderType === 'MOBILE_WALLET')
      .reduce((sum, p) => sum + p.amount, 0);

    setShiftData((prev) => ({
      ...prev,
      cashSales: prev.cashSales + cashTotal,
      cardSales: prev.cardSales + cardTotal,
      mobileWalletSales: prev.mobileWalletSales + mobileTotal,
      expectedCash: prev.expectedCash + cashTotal,
    }));

    // Trigger Print
    setLastReceipt({
      orderNumber: json.data.orderNumber,
      orderId: json.data.orderId,
      items: [...cartItems],
      payments,
      grandTotal: json.data.grandTotal,
      changeGiven: json.data.changeGiven,
      date: new Date().toLocaleString(),
    });

    // Reset Cart
    setCartItems([]);
    posAudio.playSuccess();

    // Auto-trigger browser thermal print after tiny DOM paint delay
    setTimeout(() => {
      ThermalPrinterDriver.triggerBrowserPrint();
    }, 200);

    // Refresh stock levels in catalog
    fetchProducts();

    return { orderNumber: json.data.orderNumber, orderId: json.data.orderId };
  };

  // Shift Drawer adjustments
  const handleDrawerEvent = async (type: 'CASH_IN' | 'CASH_OUT', amount: number, reason: string) => {
    const res = await fetch(`${API_BASE_URL}/pos/shifts/drawer-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId: shiftData.id,
        cashierId,
        eventType: type,
        amount: amount.toFixed(4),
        reason,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    setShiftData((prev) => ({
      ...prev,
      expectedCash: type === 'CASH_IN' ? prev.expectedCash + amount : prev.expectedCash - amount,
    }));
  };

  const handleCloseShift = async (countedCash: number, notes?: string) => {
    const res = await fetch(`${API_BASE_URL}/pos/shifts/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId: shiftData.id,
        countedCash: countedCash.toFixed(4),
        notes,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return { variance: json.data.variance };
  };

  // Quick PIN Unlock Screen
  if (isLocked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-xs text-center p-6 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 font-black text-xl">
            DX
          </div>
          <h2 className="text-xl font-bold">Terminal Locked</h2>
          <p className="text-xs text-gray-400 mt-1 mb-6">Enter Cashier 4-digit PIN</p>

          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full rounded-xl bg-gray-700 p-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
            autoFocus
          />

          <button
            type="button"
            onClick={() => {
              if (pinInput === '1234') {
                setIsLocked(false);
                setPinInput('');
              } else {
                alert('Invalid PIN (Hint: default seeded PIN is 1234)');
                setPinInput('');
              }
            }}
            className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-700 transition"
          >
            Unlock Terminal
          </button>
        </div>
      </div>
    );
  }

  // Calculate current grand total for payment modal
  const activeGrandTotal = cartItems.reduce((sum, item) => {
    const base = item.unitPrice * item.quantity - item.discountAmount;
    const tax = base * (item.taxRatePercent / 100);
    return sum + base + tax;
  }, 0);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-100">
      {/* Top Header */}
      <PosHeader
        outletName={outletName}
        registerCode={registerCode}
        cashierName={cashierName}
        onOpenLabelModal={() => {
          setSelectedLabelItem(catalogItems[0] || null);
          setIsLabelModalOpen(true);
        }}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onLockTerminal={() => setIsLocked(true)}
      />

      {/* Main Content: Left Product Catalog + Right Cart */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Product Selection Grid */}
        <div className="flex-1 overflow-hidden">
          <PosProductCatalog
            items={catalogItems}
            onSelectItem={handleAddItem}
            isLoading={isLoadingCatalog}
          />
        </div>

        {/* Right: Active Ticket Cart */}
        <PosTicketCart
          items={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onParkOrder={handleParkOrder}
          onOpenParkedOrders={() => {
            if (parkedOrders.length > 0) {
              handleRecallOrder(parkedOrders[0].id);
            }
          }}
          parkedOrdersCount={parkedOrders.length}
          onProceedToPayment={() => setIsPaymentModalOpen(true)}
        />
      </div>

      {/* Split Payment Tender Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        grandTotal={activeGrandTotal}
        onCompleteCheckout={handleCompleteCheckout}
      />

      {/* Thermal Barcode Label Generator Modal */}
      <BarcodeLabelGenerator
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        productTitle={selectedLabelItem?.productTitle}
        variantTitle={selectedLabelItem?.variantTitle}
        sku={selectedLabelItem?.sku}
        barcode={selectedLabelItem?.barcode}
        price={selectedLabelItem?.sellingPrice}
      />

      {/* Register Shift & Drawer Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftData={shiftData}
        onDrawerEvent={handleDrawerEvent}
        onCloseShift={handleCloseShift}
      />

      {/* Hidden Thermal Receipt Print Area (Used by window.print on 80mm roll) */}
      {lastReceipt && (
        <div id="thermal-receipt-print-area" className="hidden p-4 text-xs font-mono">
          <div className="text-center font-bold text-sm mb-1">{outletName}</div>
          <div className="text-center text-[10px] text-gray-500 mb-2">VAT Reg: 123456789</div>
          <div className="border-b border-dashed border-black pb-1 mb-2">
            <div>Order: {lastReceipt.orderNumber}</div>
            <div>Date: {lastReceipt.date}</div>
            <div>Cashier: {cashierName}</div>
          </div>

          <div className="space-y-1 mb-2 border-b border-dashed border-black pb-2">
            {lastReceipt.items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {it.productTitle} ({it.variantTitle}) x{it.quantity}
                </span>
                <span>৳{(it.unitPrice * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-black pb-2 mb-2 font-bold">
            <div className="flex justify-between text-sm">
              <span>TOTAL</span>
              <span>৳{Number(lastReceipt.grandTotal).toFixed(2)}</span>
            </div>
            {lastReceipt.payments.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs font-normal">
                <span>{p.tenderType}</span>
                <span>৳{Number(p.amount).toFixed(2)}</span>
              </div>
            ))}
            {Number(lastReceipt.changeGiven) > 0 && (
              <div className="flex justify-between text-xs font-normal">
                <span>Change Return</span>
                <span>৳{Number(lastReceipt.changeGiven).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="text-center text-[10px] mt-3">
            Thank you for shopping with Duelux Store!
            <br />
            Exchange within 7 days with original receipt.
          </div>
        </div>
      )}
    </div>
  );
}
