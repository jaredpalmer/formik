import { beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

const consoleError = console.error;

let consoleErrorLog: any[] = [];

beforeEach(() => {
  consoleErrorLog = [];
  // Make sure we aren't triggering React console.error calls
  console.error = (...args: any[]) => {
    // Filter out expected React warnings that are intentional in tests
    const message = args[0]?.toString() || '';
    
    // Skip React act() warnings as they are sometimes expected
    if (message.includes('Warning: An update to') && message.includes('was not wrapped in act')) {
      consoleError.apply(console, args as any);
      return;
    }
    
    // NOTE: We can't throw in here directly as most console.error calls happen
    // inside promises and result in an unhandled promise rejection
    consoleErrorLog.push(`console.error called with args: ${args}`);
    consoleError.apply(console, args as any);
  };
});

afterEach(() => {
  if (consoleErrorLog.length > 0) {
    // Not using an Error object here because the stacktrace is misleading
    throw consoleErrorLog[0];
  }

  console.error = consoleError;
});
