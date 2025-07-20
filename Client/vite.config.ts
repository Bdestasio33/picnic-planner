/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        // Generated files (Orval)
        'src/types/generated/**',
        'src/hooks/picnicplanner-api/**',

        // hooks
        'src/hooks/**',
        
        // Entry points and configuration
        'src/main.tsx',
        'src/App.tsx',
        'src/vite-env.d.ts',
        'src/test-setup.ts',
        
        // Styles and assets
        'src/**/*.css',
        'src/assets/**',
        
        // Test files
        'src/tests/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        
        // Configuration files
        'src/config/**',
        'src/services/**',
        
        // Type definition files
        'src/**/*.d.ts',
        'src/schemas/**',
        
        // Theme/styling (optional - you can include if you want to test theme functions)
        'src/theme.ts',
        
        // Standard exclusions
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.config.*',
      ],
      // Set thresholds for meaningful coverage
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      // Include only source files
      include: [
        'src/**/*.{ts,tsx}',
      ]
    }
  },
})
