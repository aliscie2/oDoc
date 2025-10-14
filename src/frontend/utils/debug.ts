/**
 * Debug utility for conditional logging
 * Enable by setting localStorage.setItem('debug', 'true') in console
 */

const isDebugEnabled = () => {
  return process.env.NODE_ENV === 'development' && 
         localStorage.getItem('debug') === 'true';
};

export const debug = {
  log: (...args: any[]) => {
    if (isDebugEnabled()) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDebugEnabled()) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  
  group: (label: string) => {
    if (isDebugEnabled()) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDebugEnabled()) {
      console.groupEnd();
    }
  }
};
