import "@testing-library/jest-dom";
import "whatwg-fetch";
import { resetSupabaseTables, server } from "./test/utils/msw-server";

// Set environment variables for Supabase client
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Mock ResizeObserver for Recharts ResponsiveContainer
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  resetSupabaseTables();
  server.resetHandlers();
});
afterAll(() => server.close());
