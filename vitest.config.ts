import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'virtual:pwa-register/react': fileURLToPath(
          new URL('./src/test/pwa-register-stub.ts', import.meta.url),
        ),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      env: { TZ: 'Europe/Belgrade' },
      // Full-app journeys type into many fields; allow for a loaded CI machine.
      testTimeout: 15_000,
    },
  }),
)
