import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5175",
    viewport: { width: 1280, height: 1024 },
    colorScheme: "light",
    trace: "retain-on-failure",
  },
  reporter: [["list"]],
  webServer: [
    {
      command: "node scripts/test-server.mjs",
      url: "http://127.0.0.1:3101/users",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5175 --strictPort",
      url: "http://127.0.0.1:5175",
      env: {
        VITE_API_URL: "http://127.0.0.1:3101",
        VITE_WEATHER_PROVIDER: "open-meteo",
        VITE_ALLOW_MOCK_WEATHER: "false",
      },
      reuseExistingServer: false,
    },
  ],
});
