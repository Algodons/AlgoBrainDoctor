// Utility: Logger setup (stub for now)
export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: unknown[]) {
    console.log(`[${this.context}] INFO:`, message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[${this.context}] WARN:`, message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(`[${this.context}] ERROR:`, message, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    console.debug(`[${this.context}] DEBUG:`, message, ...args);
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
