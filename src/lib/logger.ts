type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

class Logger {
  private format(level: LogLevel, module: string, message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${module}] ${message}`;
  }

  info(module: string, message: string, ...args: any[]) {
    console.log(this.format("INFO", module, message), ...args);
  }

  warn(module: string, message: string, ...args: any[]) {
    console.warn(this.format("WARN", module, message), ...args);
  }

  error(module: string, message: string, ...args: any[]) {
    console.error(this.format("ERROR", module, message), ...args);
  }

  debug(module: string, message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(this.format("DEBUG", module, message), ...args);
    }
  }
}

export const logger = new Logger();
