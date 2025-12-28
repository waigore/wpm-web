// Simple console-based logger for browser compatibility
// Replaces Winston which requires Node.js globals

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

interface LogContext {
  context?: string;
  [key: string]: any;
}

function formatMessage(level: string, message: string, meta?: LogContext): string {
  const context = meta?.context ? `[${meta.context}]` : '';
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > (meta.context ? 1 : 0) 
    ? ` ${JSON.stringify(Object.fromEntries(Object.entries(meta).filter(([k]) => k !== 'context')))}`
    : '';
  return `${timestamp} [${level.toUpperCase()}] ${context} ${message}${metaStr}`;
}

const logger = {
  debug: (message: string, meta?: LogContext) => {
    if (!isProduction && isDevelopment) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
  info: (message: string, meta?: LogContext) => {
    console.info(formatMessage('info', message, meta));
  },
  warn: (message: string, meta?: LogContext) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message: string, meta?: LogContext) => {
    console.error(formatMessage('error', message, meta));
  },
};

export default logger;
