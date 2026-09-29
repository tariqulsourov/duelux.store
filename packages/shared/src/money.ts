import Decimal from 'decimal.js';

// Configure Decimal for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export class MoneyUtil {
  /**
   * Normalize an incoming value to a 4-decimal-place string for MySQL DECIMAL(12, 4)
   */
  static toDbDecimal(value: string | number | Decimal): string {
    return new Decimal(value).toFixed(4);
  }

  /**
   * Format for customer-facing receipt / invoice display (2 decimal places)
   */
  static toDisplayPrice(value: string | number | Decimal, currencySymbol = '$'): string {
    const formatted = new Decimal(value).toFixed(2);
    return `${currencySymbol}${formatted}`;
  }

  /**
   * Add multiple money values safely without float drift
   */
  static add(...values: (string | number | Decimal)[]): Decimal {
    return values.reduce<Decimal>((sum, current) => sum.plus(new Decimal(current || 0)), new Decimal(0));
  }

  /**
   * Subtract values safely: a - b
   */
  static subtract(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return new Decimal(a).minus(new Decimal(b));
  }

  /**
   * Multiply price by quantity
   */
  static multiply(unitPrice: string | number | Decimal, qty: number | string | Decimal): Decimal {
    return new Decimal(unitPrice).times(new Decimal(qty));
  }

  /**
   * Calculate percentage discount
   */
  static calculateDiscount(baseAmount: string | number | Decimal, discountPercent: number | string): Decimal {
    const base = new Decimal(baseAmount);
    const rate = new Decimal(discountPercent).dividedBy(100);
    return base.times(rate);
  }

  /**
   * Calculate inclusive or exclusive tax
   */
  static calculateTax(taxableAmount: string | number | Decimal, taxRatePercent: number | string): Decimal {
    const base = new Decimal(taxableAmount);
    const rate = new Decimal(taxRatePercent).dividedBy(100);
    return base.times(rate);
  }
}
