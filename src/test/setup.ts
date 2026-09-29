import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// jsdom has no matchMedia; motion uses it for prefers-reduced-motion.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom lacks ResizeObserver and pointer-capture APIs used by Radix/vaul.
if (typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => undefined
Element.prototype.setPointerCapture ??= () => undefined
Element.prototype.scrollIntoView ??= () => undefined
