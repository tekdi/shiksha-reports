import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class StructuredLogger {
  private logger: Logger;
  private context: string;
  private static logFilePath: string = path.join(process.cwd(), 'logs', 'app.log');
  private static errorLogFilePath: string = path.join(process.cwd(), 'logs', 'error.log');

  constructor(context: string) {
    this.logger = new Logger(context);
    this.context = context;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private writeToFile(level: string, message: string, meta?: Record<string, any>, error?: Error) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        context: this.context,
        message,
        ...(meta && { meta }),
        ...(error && { error: error.message, stack: error.stack }),
      };
      
      const logLine = JSON.stringify(logEntry) + '\n';
      
      // Write to main log file
      fs.appendFileSync(StructuredLogger.logFilePath, logLine);
      
      // Also write errors to separate error log file
      if (level === 'ERROR' || level === 'WARN') {
        fs.appendFileSync(StructuredLogger.errorLogFilePath, logLine);
      }
    } catch (err) {
      // Silently fail if file writing fails
    }
  }

  info(message: string, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.log(logMessage);
    this.writeToFile('INFO', message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.error(logMessage, error?.stack);
    this.writeToFile('ERROR', message, meta, error);
  }

  warn(message: string, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.warn(logMessage);
    this.writeToFile('WARN', message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.debug(logMessage);
    // Debug logs are not written to file to reduce log volume
  }
}
