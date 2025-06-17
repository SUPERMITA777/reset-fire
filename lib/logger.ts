type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date().toISOString()
    const level = entry.level.toUpperCase()
    const message = entry.message
    
    return `[${timestamp}] ${level}: ${message}`
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
    }

    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, data || '')
        }
        break
      case 'info':
        console.info(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'error':
        console.error(formattedMessage, error || data || '')
        break
    }

    // En producción, podrías enviar los logs a un servicio externo
    if (!this.isDevelopment && level === 'error') {
      // Aquí podrías enviar a Sentry, LogRocket, etc.
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // Implementar envío a servicio externo de logging
    // Por ejemplo: Sentry, LogRocket, etc.
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error, data?: any) {
    this.log('error', message, data, error)
  }
}

export const logger = new Logger() 