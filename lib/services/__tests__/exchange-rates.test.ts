import { FALLBACK_RATES_TO_EUR, convertToEURWithFallback } from "../exchange-rates";

// These tests focus on the pure functions that don't require API calls
// API-dependent functions (convertToEUR, getEURRate, etc.) would need
// integration tests with proper MSW handlers for the exchange rates API
describe("exchange-rates service", () => {
  describe("FALLBACK_RATES_TO_EUR", () => {
    it("should have EUR rate of 1", () => {
      expect(FALLBACK_RATES_TO_EUR.EUR).toBe(1);
    });

    it("should have common currency rates defined", () => {
      expect(FALLBACK_RATES_TO_EUR.USD).toBeDefined();
      expect(FALLBACK_RATES_TO_EUR.GBP).toBeDefined();
      expect(FALLBACK_RATES_TO_EUR.JPY).toBeDefined();
      expect(FALLBACK_RATES_TO_EUR.CHF).toBeDefined();
    });

    it("should have North African currency rates", () => {
      expect(FALLBACK_RATES_TO_EUR.MAD).toBeDefined();
      expect(FALLBACK_RATES_TO_EUR.TND).toBeDefined();
      expect(FALLBACK_RATES_TO_EUR.TRY).toBeDefined();
    });

    it("should have reasonable rate values", () => {
      // EUR should be 1
      expect(FALLBACK_RATES_TO_EUR.EUR).toBe(1);
      // USD should be around 0.85-0.95 (1 USD = ~0.9 EUR)
      expect(FALLBACK_RATES_TO_EUR.USD).toBeGreaterThan(0.8);
      expect(FALLBACK_RATES_TO_EUR.USD).toBeLessThan(1);
      // GBP should be greater than EUR (1 GBP > 1 EUR)
      expect(FALLBACK_RATES_TO_EUR.GBP).toBeGreaterThan(1);
      // JPY should be much less (1 JPY << 1 EUR)
      expect(FALLBACK_RATES_TO_EUR.JPY).toBeLessThan(0.01);
    });

    it("should have positive rates for all currencies", () => {
      Object.values(FALLBACK_RATES_TO_EUR).forEach((rate) => {
        expect(rate).toBeGreaterThan(0);
      });
    });
  });

  describe("convertToEURWithFallback", () => {
    it("should return same amount for EUR", async () => {
      expect(await convertToEURWithFallback(100, "EUR")).toBe(100);
      expect(await convertToEURWithFallback(50.5, "EUR")).toBe(50.5);
    });

    it("should convert USD using fallback rate", async () => {
      const result = await convertToEURWithFallback(100, "USD");
      const expected = 100 * FALLBACK_RATES_TO_EUR.USD;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should convert GBP using fallback rate", async () => {
      const result = await convertToEURWithFallback(100, "GBP");
      const expected = 100 * FALLBACK_RATES_TO_EUR.GBP;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should convert MAD using fallback rate", async () => {
      const result = await convertToEURWithFallback(1000, "MAD");
      const expected = 1000 * FALLBACK_RATES_TO_EUR.MAD;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should convert TND using fallback rate", async () => {
      const result = await convertToEURWithFallback(500, "TND");
      const expected = 500 * FALLBACK_RATES_TO_EUR.TND;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should convert TRY using fallback rate", async () => {
      const result = await convertToEURWithFallback(2000, "TRY");
      const expected = 2000 * FALLBACK_RATES_TO_EUR.TRY;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should return input amount for unknown currency", async () => {
      const result = await convertToEURWithFallback(100, "UNKNOWN");
      expect(result).toBe(100);
    });

    it("should handle zero amount", async () => {
      expect(await convertToEURWithFallback(0, "USD")).toBe(0);
      expect(await convertToEURWithFallback(0, "EUR")).toBe(0);
    });

    it("should handle negative amounts", async () => {
      const result = await convertToEURWithFallback(-100, "USD");
      const expected = -100 * FALLBACK_RATES_TO_EUR.USD;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should handle decimal amounts", async () => {
      const result = await convertToEURWithFallback(123.45, "USD");
      const expected = 123.45 * FALLBACK_RATES_TO_EUR.USD;
      expect(result).toBeCloseTo(expected, 2);
    });
  });
});
