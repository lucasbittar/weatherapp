/**
 * Global test setup — Vitest runs this file before every test file
 * (configured via `test.setupFiles` in vite.config.ts).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// The line above (`@testing-library/jest-dom/vitest`) adds DOM-specific
// matchers to Vitest's `expect`, e.g.:
//   expect(button).toBeInTheDocument()
//   expect(button).toHaveClass('active')

// React Testing Library mounts components into `document.body`. Because we
// import `describe/it/expect` explicitly instead of enabling Vitest "globals",
// RTL can't register its automatic cleanup, so we unmount after each test
// ourselves. Without this, leftovers from one test would show up in the next.
afterEach(() => {
  cleanup();
});
