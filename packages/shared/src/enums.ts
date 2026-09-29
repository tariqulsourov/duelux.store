export enum SalesChannel {
  POS_IN_STORE = 'POS_IN_STORE',
  ECOMMERCE_WEB = 'ECOMMERCE_WEB',
  PHONE_ORDER = 'PHONE_ORDER',
  WHOLESALE = 'WHOLESALE',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum TenderType {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE_WALLET = 'MOBILE_WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STORE_CREDIT = 'STORE_CREDIT',
}

export enum InventoryEventType {
  PURCHASE_RECEIPT = 'PURCHASE_RECEIPT',       // Stock arriving from supplier
  POS_SALE = 'POS_SALE',                       // Counter sale decrement
  ONLINE_SALE = 'ONLINE_SALE',                 // E-commerce fulfilled decrement
  RESERVATION_HOLD = 'RESERVATION_HOLD',       // Temporary checkout hold
  RESERVATION_RELEASE = 'RESERVATION_RELEASE', // Released expired hold
  RETURN_RESTOCK = 'RETURN_RESTOCK',           // Item returned to inventory
  DAMAGE_WRITEOFF = 'DAMAGE_WRITEOFF',         // Broken or expired write-off
  CYCLE_COUNT_ADJUST = 'CYCLE_COUNT_ADJUST',   // Physical stock audit correction
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',     // Move between store outlets
}

export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CashDrawerEventType {
  CASH_IN = 'CASH_IN',                         // Manual float addition
  CASH_OUT = 'CASH_OUT',                       // Safe drop / payout
  NO_SALE_OPEN = 'NO_SALE_OPEN',               // Drawer opened without sale
  SHIFT_CLOSE_DEPOSIT = 'SHIFT_CLOSE_DEPOSIT', // End-of-shift bank deposit
}

export enum BarcodeType {
  CODE128 = 'CODE128',
  EAN13 = 'EAN13',
  UPC_A = 'UPC_A',
  QR_CODE = 'QR_CODE',
  INTERNAL = 'INTERNAL',
}
