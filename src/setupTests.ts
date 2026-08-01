import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia.
window.matchMedia =
  window.matchMedia ||
  ((query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList);
