/**
 * Secure logger that prevents leaking sensitive error details in production.
 * In development, full error details are logged.
 * In production, only generic messages are logged to the console.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, _details?: unknown) => {
    if (isDev) {
      console.error(message, _details);
    } else {
      console.error(message);
    }
  },
  warn: (message: string, _details?: unknown) => {
    if (isDev) {
      console.warn(message, _details);
    } else {
      console.warn(message);
    }
  },
  info: (message: string, _details?: unknown) => {
    if (isDev) {
      console.info(message, _details);
    }
  },
};
