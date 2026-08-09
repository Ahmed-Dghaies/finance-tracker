import {
  CURRENCIES,
  COUNTRIES,
  COUNTRY_FLAGS,
  COUNTRY_CURRENCIES,
  getCountryFlag,
  getCurrencyByCountry,
} from "../constants";

describe("constants", () => {
  describe("CURRENCIES", () => {
    it("should have unique currency values", () => {
      const values = CURRENCIES.map((c) => c.value);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });

    it("should include common currencies", () => {
      const currencyValues = CURRENCIES.map((c) => c.value);
      expect(currencyValues).toContain("EUR");
      expect(currencyValues).toContain("USD");
      expect(currencyValues).toContain("GBP");
      expect(currencyValues).toContain("JPY");
    });

    it("should include North African currencies", () => {
      const currencyValues = CURRENCIES.map((c) => c.value);
      expect(currencyValues).toContain("MAD"); // Morocco
      expect(currencyValues).toContain("TND"); // Tunisia
      expect(currencyValues).toContain("TRY"); // Turkey
    });

    it("should have value and label for each currency", () => {
      CURRENCIES.forEach((currency) => {
        expect(currency.value).toBeDefined();
        expect(currency.label).toBeDefined();
        expect(typeof currency.value).toBe("string");
        expect(typeof currency.label).toBe("string");
      });
    });
  });

  describe("COUNTRIES", () => {
    it("should have required properties for each country", () => {
      COUNTRIES.forEach((country) => {
        expect(country.value).toBeDefined();
        expect(country.label).toBeDefined();
        expect(country.flag).toBeDefined();
        expect(country.currency).toBeDefined();
      });
    });

    it("should include common countries", () => {
      const countryCodes = COUNTRIES.map((c) => c.value);
      expect(countryCodes).toContain("US");
      expect(countryCodes).toContain("GB");
      expect(countryCodes).toContain("JP");
      expect(countryCodes).toContain("DE");
      expect(countryCodes).toContain("FR");
    });

    it("should include Morocco, Turkey, and Tunisia", () => {
      const countryCodes = COUNTRIES.map((c) => c.value);
      expect(countryCodes).toContain("MA"); // Morocco
      expect(countryCodes).toContain("TR"); // Turkey
      expect(countryCodes).toContain("TN"); // Tunisia
    });

    it("should have labels that include emoji flags", () => {
      COUNTRIES.forEach((country) => {
        expect(country.label).toContain(country.flag);
      });
    });

    it("should map countries to correct currencies", () => {
      const us = COUNTRIES.find((c) => c.value === "US");
      const gb = COUNTRIES.find((c) => c.value === "GB");
      const jp = COUNTRIES.find((c) => c.value === "JP");
      const de = COUNTRIES.find((c) => c.value === "DE");
      const ma = COUNTRIES.find((c) => c.value === "MA");

      expect(us?.currency).toBe("USD");
      expect(gb?.currency).toBe("GBP");
      expect(jp?.currency).toBe("JPY");
      expect(de?.currency).toBe("EUR");
      expect(ma?.currency).toBe("MAD");
    });
  });

  describe("COUNTRY_FLAGS", () => {
    it("should map country codes to emoji flags", () => {
      expect(COUNTRY_FLAGS["US"]).toBe("🇺🇸");
      expect(COUNTRY_FLAGS["GB"]).toBe("🇬🇧");
      expect(COUNTRY_FLAGS["JP"]).toBe("🇯🇵");
      expect(COUNTRY_FLAGS["MA"]).toBe("🇲🇦");
      expect(COUNTRY_FLAGS["TR"]).toBe("🇹🇷");
      expect(COUNTRY_FLAGS["TN"]).toBe("🇹🇳");
    });

    it("should have entries for all countries", () => {
      COUNTRIES.forEach((country) => {
        expect(COUNTRY_FLAGS[country.value]).toBe(country.flag);
      });
    });
  });

  describe("COUNTRY_CURRENCIES", () => {
    it("should map country codes to currencies", () => {
      expect(COUNTRY_CURRENCIES["US"]).toBe("USD");
      expect(COUNTRY_CURRENCIES["GB"]).toBe("GBP");
      expect(COUNTRY_CURRENCIES["DE"]).toBe("EUR");
      expect(COUNTRY_CURRENCIES["MA"]).toBe("MAD");
    });

    it("should have entries for all countries", () => {
      COUNTRIES.forEach((country) => {
        expect(COUNTRY_CURRENCIES[country.value]).toBe(country.currency);
      });
    });
  });

  describe("getCountryFlag", () => {
    it("should return flag for valid country code", () => {
      expect(getCountryFlag("US")).toBe("🇺🇸");
      expect(getCountryFlag("GB")).toBe("🇬🇧");
      expect(getCountryFlag("MA")).toBe("🇲🇦");
    });

    it("should return world emoji for undefined country", () => {
      expect(getCountryFlag(undefined)).toBe("🌍");
    });

    it("should return world emoji for unknown country code", () => {
      expect(getCountryFlag("XX")).toBe("🌍");
      expect(getCountryFlag("INVALID")).toBe("🌍");
    });

    it("should return world emoji for empty string", () => {
      expect(getCountryFlag("")).toBe("🌍");
    });
  });

  describe("getCurrencyByCountry", () => {
    it("should return currency for valid country code", () => {
      expect(getCurrencyByCountry("US")).toBe("USD");
      expect(getCurrencyByCountry("GB")).toBe("GBP");
      expect(getCurrencyByCountry("DE")).toBe("EUR");
      expect(getCurrencyByCountry("MA")).toBe("MAD");
    });

    it("should return undefined for unknown country code", () => {
      expect(getCurrencyByCountry("XX")).toBeUndefined();
      expect(getCurrencyByCountry("INVALID")).toBeUndefined();
    });
  });

  describe("Country-Currency consistency", () => {
    it("should ensure all country currencies exist in CURRENCIES", () => {
      const currencyValues = CURRENCIES.map((c) => c.value);

      COUNTRIES.forEach((country) => {
        expect(currencyValues).toContain(country.currency);
      });
    });

    it("should have Eurozone countries using EUR", () => {
      const eurozoneCountries = ["DE", "FR", "IT", "ES"];

      eurozoneCountries.forEach((code) => {
        const country = COUNTRIES.find((c) => c.value === code);
        expect(country?.currency).toBe("EUR");
      });
    });
  });
});
