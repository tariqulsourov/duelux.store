export class BarcodeUtil {
  /**
   * Calculate EAN-13 check digit
   */
  static calculateEan13CheckDigit(twelveDigits: string): number {
    if (!/^\d{12}$/.test(twelveDigits)) {
      throw new Error('EAN-13 requires exactly 12 digits to compute the check digit');
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(twelveDigits[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Validate whether a string is a valid EAN-13 barcode
   */
  static isValidEan13(code: string): boolean {
    if (!/^\d{13}$/.test(code)) return false;
    const body = code.substring(0, 12);
    const expectedCheck = this.calculateEan13CheckDigit(body);
    return parseInt(code[12], 10) === expectedCheck;
  }

  /**
   * Generate an internal store barcode with a custom prefix (e.g. prefix '200')
   */
  static generateInternalEan13(numericId: number, prefix = '200'): string {
    const paddedId = numericId.toString().padStart(9, '0');
    const twelveDigits = `${prefix}${paddedId}`;
    const checkDigit = this.calculateEan13CheckDigit(twelveDigits);
    return `${twelveDigits}${checkDigit}`;
  }

  /**
   * Scanner Burst Interceptor Thresholds
   * Hardware USB scanners emit characters with < 30ms inter-keystroke interval
   */
  static readonly SCANNER_CHAR_INTERVAL_MS = 35;
  static readonly MIN_BARCODE_LENGTH = 4;
}
