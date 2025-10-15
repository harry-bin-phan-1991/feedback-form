import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reports: ['text', 'html'],
      all: false,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ]
    }
  }
});