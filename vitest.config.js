import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/pages/**/*Page.jsx",
        "src/routes/ProtectedRoute.jsx",
        "src/components/records/**/*.jsx",
        "src/components/species/*.jsx",
        "src/components/well/*.jsx",
        "src/hooks/*.js",
        "src/components/admin/*.jsx",
        "src/components/chat/*.jsx",
        "src/repositories/chatRepository.js",
        "src/components/incidents/*.jsx",
        "src/services/incidentService.js",
        "src/config/{roles,permissions,navigation}.js",
        "src/repositories/createScopedRepository.js",
        "src/services/{auth,user,chat,delegation}Service.js",
        "src/services/sessionAccess.js",
      ],
      reporter: ["text", "html", "json-summary"],
    },
  },
});
