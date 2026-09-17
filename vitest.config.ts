import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // e2e/*.spec.ts belongs to playwright, which vitest cannot run.
    exclude: [...defaultExclude, 'e2e/**'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      // istanbul, not v8: the domain tests read a structure on every case, so
      // openchemlib is loaded throughout, and v8 precise coverage profiles
      // every call inside it — which multiplies the run for the same numbers.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
