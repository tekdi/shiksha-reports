import { Logger } from '@nestjs/common';

export class StructuredLogger {
  private logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  info(message: string, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.log(logMessage);
  }

  error(message: string, error?: Error, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.error(logMessage, error?.stack);
  }

  warn(message: string, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.warn(logMessage);
  }

  debug(message: string, meta?: Record<string, any>) {
    const logMessage = meta ? `${message} | ${JSON.stringify(meta)}` : message;
    this.logger.debug(logMessage);
  }

  // Utility methods for common logging patterns
  logDatabaseOperation(
    operation: string,
    entityType: string,
    identifiers: Record<string, any>,
  ) {
    this.info(`Database ${operation}`, {
      entityType,
      identifiers,
    });
  }

  logValidationError(field: string, value: any, error: string) {
    this.error(`Validation failed for ${field}`, undefined, {
      field,
      value: typeof value,
      error,
    });
  }

  logApiCall(url: string, method: string, duration?: number) {
    this.info(`External API call`, {
      url: url.replace(/\/[a-f0-9-]{36,}/gi, '/[ID]'), // Mask IDs for privacy
      method,
      duration,
    });
  }

  logKafkaEvent(topic: string, eventType: string, success: boolean) {
    this.info(`Kafka event processed`, {
      topic,
      eventType,
      success,
    });
  }
}
