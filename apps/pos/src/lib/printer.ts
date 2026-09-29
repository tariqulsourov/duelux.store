/**
 * Hardware USB Thermal Printer and Cash Drawer Engine
 */
export class ThermalPrinterDriver {
  /**
   * Send ESC/POS commands via WebSerial (Supported in Chrome/Edge on Windows/macOS/Linux)
   */
  static async printViaWebSerial(rawEscPosText: string): Promise<boolean> {
    if (!('serial' in navigator)) {
      console.warn('WebSerial is not supported in this browser. Falling back to browser print.');
      return false;
    }

    try {
      const navSerial = (navigator as any).serial;
      // Request serial port
      const port = await navSerial.requestPort();
      await port.open({ baudRate: 9600 });

      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      const data = encoder.encode(rawEscPosText);

      await writer.write(data);
      writer.releaseLock();
      await port.close();
      return true;
    } catch (err) {
      console.error('WebSerial print failed:', err);
      return false;
    }
  }

  /**
   * Kick Cash Drawer directly via RJ11 pulse (ESC p 0 25 250)
   */
  static async kickDrawer(): Promise<void> {
    const DRAWER_KICK = '\x1B\x70\x00\x19\xFA';
    const sent = await this.printViaWebSerial(DRAWER_KICK);
    if (!sent) {
      console.log('Cash drawer kick command queued via receipt output.');
    }
  }

  /**
   * Browser Standard Print Trigger (Fallback)
   */
  static triggerBrowserPrint(): void {
    window.print();
  }
}
