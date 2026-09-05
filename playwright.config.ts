import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke testlar production build'ga qarshi ishlaydi — dev-rejimdagi
 * qo'shimcha renderlar natijani buzmasligi uchun.
 *
 * Brauzer: tizimdagi Google Chrome (`channel: "chrome"`), shuning uchun
 * alohida brauzer yuklab olish shart emas.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  timeout: 45_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    // Admin testlari uchun parol. Ishlab chiqarishda bu qiymat
    // `.env` dan keladi va hech qachon repoda saqlanmaydi.
    env: {
      ADMIN_PASSWORD: "playwright-test-parol",
      // `ADMIN_USERNAME` ataylab berilmagan — sukut bo'yicha "admin"
      // ishlashini ham shu bilan tekshiramiz.
      ADMIN_SESSION_SECRET: "0123456789abcdef0123456789abcdef",
    },
    url: "http://127.0.0.1:3100/ru",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
