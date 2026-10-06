import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
vi.mock("../services/taskService");
vi.mock("../services/touristService");
vi.mock("../services/maintenanceService");
vi.mock("../services/heritageService");
vi.mock("../services/speciesService");
vi.mock("../services/wellService");
vi.mock("../services/authService");
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  // jsdom has no layout or native dialog lifecycle.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  globalThis.localStorage?.clear();
});
afterEach(cleanup);
