type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogData = Record<string, any>

// Add error handling utilities
type ErrorWithMessage = {
  message: string
  [key: string]: any
}

const toErrorWithMessage = (error: unknown): ErrorWithMessage => {
  if (error instanceof Error) {
    return error
  }
  return {
    message: String(error),
    originalError: error
  }
}

const isDevEnvironment = process.env.NODE_ENV === 'development'

// Configure which log levels show in production
const PRODUCTION_LOG_LEVELS: LogLevel[] = ['warn', 'error']

interface LogContext {
  file?: string
  function?: string
  module?: string
}

interface LogOptions extends LogContext {
  level: LogLevel
  data?: LogData
}

class DebugLogger {
  private static instance: DebugLogger
  private logHistory: Array<{
    timestamp: Date
    level: LogLevel
    message: string
    data?: LogData
  }> = []

  private activeTimers: Set<string> = new Set() // Track active timer labels

  private maxHistorySize = 1000 // Keep last 1000 logs in memory for dev tools

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger()
    }
    return DebugLogger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    return isDevEnvironment || PRODUCTION_LOG_LEVELS.includes(level)
  }

  private formatMessage(message: string, options: LogOptions): string {
    const timestamp = new Date().toISOString()
    const fileInfo = options.file ? `[${options.file}] ` : ''
    const functionInfo = options.function ? `[${options.function}] ` : ''
    const moduleInfo = options.module ? `[${options.module}] ` : ''
    return `${timestamp} ${options.level.toUpperCase()} ${fileInfo}${functionInfo}${moduleInfo}${message}`
  }

  public logWithLevel(message: string, options: LogOptions) {
    if (!this.shouldLog(options.level)) {
      return
    }

    const formattedMessage = this.formatMessage(message, options)
    const logData = options.data ? { ...options.data } : undefined

    // Store in history (dev only)
    if (isDevEnvironment) {
      this.logHistory.push({
        timestamp: new Date(),
        level: options.level,
        message: formattedMessage,
        data: logData
      })

      // Maintain history size
      if (this.logHistory.length > this.maxHistorySize) {
        this.logHistory.shift()
      }
    }

    // Output to console
    switch (options.level) {
      case 'debug':
        console.log(formattedMessage, logData || '')
        break
      case 'info':
        console.info(formattedMessage, logData || '')
        break
      case 'warn':
        console.warn(formattedMessage, logData || '')
        break
      case 'error':
        console.error(formattedMessage, logData || '')
        break
    }
  }

  public getLogHistory() {
    return isDevEnvironment ? [...this.logHistory] : []
  }

  public clearHistory() {
    if (isDevEnvironment) {
      this.logHistory = []
    }
  }

  public startTimer(label: string) {
    if (!isDevEnvironment) {
      return
    }

    if (this.activeTimers.has(label)) {
      console.warn(`Timer '${label}' already exists. Creating unique label.`)
      let uniqueLabel = `${label}-${Date.now()}`
      while (this.activeTimers.has(uniqueLabel)) {
        uniqueLabel = `${label}-${Date.now()}`
      }
      label = uniqueLabel
    }

    this.activeTimers.add(label)
    console.time(label)
    return label
  }

  public endTimer(label: string) {
    if (!isDevEnvironment) {
      return
    }

    if (this.activeTimers.has(label)) {
      console.timeEnd(label)
      this.activeTimers.delete(label)
    }
  }
}

// Create the logger instance
const logger = DebugLogger.getInstance()

export const debug = {
  // Basic logging methods
  log: (message: string, data?: LogData, context?: LogContext) => {
    logger.logWithLevel(message, { level: 'debug', data, ...context })
  },

  info: (message: string, data?: LogData, context?: LogContext) => {
    logger.logWithLevel(message, { level: 'info', data, ...context })
  },

  warn: (message: string, data?: LogData, context?: LogContext) => {
    logger.logWithLevel(message, { level: 'warn', data, ...context })
  },

  error: (message: string, data?: LogData, context?: LogContext) => {
    logger.logWithLevel(message, { level: 'error', data, ...context })
  },

  // Performance monitoring
  time: (label: string) => {
    if (typeof window !== 'undefined') {
      console.time(label)
    }
    return undefined
  },

  timeEnd: (label: string) => {
    if (isDevEnvironment) {
      logger.endTimer(label)
    }
  },

  // Grouping
  group: (name: string, fn: () => void) => {
    if (isDevEnvironment) {
      console.group(name)
      fn()
      console.groupEnd()
    } else {
      fn()
    }
  },

  // Memory usage
  memory: () => {
    if (isDevEnvironment && window.performance) {
      const memory = (performance as any).memory
      if (memory) {
        debug.log('Memory Usage', {
          usedJSHeapSize: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
          totalJSHeapSize: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
          jsHeapSizeLimit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        })
      }
    }
  },

  // Trace
  trace: (message: string) => {
    if (isDevEnvironment) {
      console.trace(message)
    }
  },

  // Development utilities
  assert: (condition: boolean, message: string) => {
    if (isDevEnvironment) {
      console.assert(condition, message)
    }
  },

  // Log history management
  getHistory: () => logger.getLogHistory(),
  clearHistory: () => logger.clearHistory(),

  // Table output for structured data
  table: (data: any[], columns?: string[]) => {
    if (isDevEnvironment) {
      console.table(data, columns)
    }
  },

  // Add error handling helper
  errorWithData: (error: unknown): LogData => {
    const errorWithMessage = toErrorWithMessage(error)
    return {
      message: errorWithMessage.message,
      details: errorWithMessage
    }
  }
}

// Type definitions for external use
export type { ErrorWithMessage, LogData, LogLevel }

interface LoggerOptions {
  module: string
  file: string
}

// Create a factory function that returns a pre-configured logger
export function createLogger(options: LoggerOptions) {
  return {
    debug: (message: string, data?: LogData, functionName?: string) => {
      debug.log(message, data, {
        module: options.module,
        file: options.file,
        function: functionName
      })
    },
    log: (message: string, data?: LogData, functionName?: string) => {
      debug.log(message, data, {
        module: options.module,
        file: options.file,
        function: functionName
      })
    },
    info: (message: string, data?: LogData, functionName?: string) => {
      debug.info(message, data, {
        module: options.module,
        file: options.file,
        function: functionName
      })
    },
    warn: (message: string, data?: LogData, functionName?: string) => {
      debug.warn(message, data, {
        module: options.module,
        file: options.file,
        function: functionName
      })
    },
    error: (message: string, data?: LogData, functionName?: string) => {
      debug.error(message, data, {
        module: options.module,
        file: options.file,
        function: functionName
      })
    },
    // Include other debug methods you commonly use
    group: debug.group,
    time: debug.time,
    timeEnd: debug.timeEnd,
    errorWithData: debug.errorWithData
  }
}
