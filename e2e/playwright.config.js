import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 90000,
  use: {
    baseURL: 'https://care-exchange.onrender.com',
    headless: true,
  },
})
