-- Migration: Add country field to currency_balances table
-- This allows tracking which country the foreign currency is associated with

-- Add country column to currency_balances
ALTER TABLE currency_balances
ADD COLUMN IF NOT EXISTS country VARCHAR(2);

-- Add a comment explaining the field
COMMENT ON COLUMN currency_balances.country IS 'ISO 3166-1 alpha-2 country code (e.g., JP for Japan, US for USA)';

-- Create a mapping table for currency to default country (optional, for reference)
-- Common currency-country mappings:
-- USD -> US (United States)
-- EUR -> EU (European Union - use DE for Germany as default)
-- GBP -> GB (United Kingdom)
-- JPY -> JP (Japan)
-- CHF -> CH (Switzerland)
-- CAD -> CA (Canada)
-- AUD -> AU (Australia)
-- CNY -> CN (China)
-- KRW -> KR (South Korea)
-- THB -> TH (Thailand)
-- MAD -> MA (Morocco)
-- TRY -> TR (Turkey)
-- TND -> TN (Tunisia)

-- Update existing records with default country codes based on currency
UPDATE currency_balances SET country = 'US' WHERE currency = 'USD' AND country IS NULL;
UPDATE currency_balances SET country = 'DE' WHERE currency = 'EUR' AND country IS NULL;
UPDATE currency_balances SET country = 'GB' WHERE currency = 'GBP' AND country IS NULL;
UPDATE currency_balances SET country = 'JP' WHERE currency = 'JPY' AND country IS NULL;
UPDATE currency_balances SET country = 'CH' WHERE currency = 'CHF' AND country IS NULL;
UPDATE currency_balances SET country = 'CA' WHERE currency = 'CAD' AND country IS NULL;
UPDATE currency_balances SET country = 'AU' WHERE currency = 'AUD' AND country IS NULL;
UPDATE currency_balances SET country = 'CN' WHERE currency = 'CNY' AND country IS NULL;
UPDATE currency_balances SET country = 'KR' WHERE currency = 'KRW' AND country IS NULL;
UPDATE currency_balances SET country = 'TH' WHERE currency = 'THB' AND country IS NULL;
UPDATE currency_balances SET country = 'MA' WHERE currency = 'MAD' AND country IS NULL;
UPDATE currency_balances SET country = 'TR' WHERE currency = 'TRY' AND country IS NULL;
UPDATE currency_balances SET country = 'TN' WHERE currency = 'TND' AND country IS NULL;
