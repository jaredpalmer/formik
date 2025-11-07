// Temporary React 19 compatibility shim
// This file provides type compatibility between Next.js 16 and React 19

declare module 'react' {
  import * as React from 'react';
  
  // Re-export everything from React
  export = React;
  export as namespace React;
}
