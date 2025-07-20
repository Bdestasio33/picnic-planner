import '@testing-library/jest-dom'

// Tell React we're in a testing environment so it handles act() automatically
;(global as any).IS_REACT_ACT_ENVIRONMENT = true

// // Handle Material-UI Slider focus errors that occur during test cleanup
// const originalError = console.error;
// console.error = (...args) => {
//   // Suppress specific Material-UI Slider focus errors that occur during test cleanup
//   if (
//     typeof args[0] === 'string' &&
//     (args[0].includes('Cannot read properties of null (reading \'focus\')') ||
//      args[0].includes('focusThumb') ||
//      args[0].includes('useSlider'))
//   ) {
//     return;
//   }
//   originalError.call(console, ...args);
// };

// // Mock ResizeObserver which is used by Material-UI components
// global.ResizeObserver = class ResizeObserver {
//   observe() {}
//   unobserve() {}
//   disconnect() {}
// };

// // Mock IntersectionObserver which is used by Material-UI components
// global.IntersectionObserver = class IntersectionObserver {
//   constructor() {}
//   observe() {}
//   unobserve() {}
//   disconnect() {}
//   root = null;
//   rootMargin = '';
//   thresholds = [];
//   takeRecords() { return []; }
// } as any;

// // Add global error handler for unhandled promise rejections
// process.on('unhandledRejection', (reason, promise) => {
//   // Suppress Material-UI Slider related unhandled rejections
//   if (reason && typeof reason === 'object' && 'message' in reason) {
//     const message = String(reason.message);
//     if (message.includes('focusThumb') || message.includes('useSlider')) {
//       return;
//     }
//   }
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });

// // Add global error handler for uncaught exceptions
// process.on('uncaughtException', (error) => {
//   // Suppress Material-UI Slider related uncaught exceptions
//   if (error.message.includes('focusThumb') || error.message.includes('useSlider')) {
//     return;
//   }
//   console.error('Uncaught Exception:', error);
// }); 