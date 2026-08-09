-- Migration: Add exchange rate tracking to currency_balances
-- This allows storing the exchange rate used and when it was last updated

-- Add exchange_rate column (the rate used to calculate eur_equivalent: 1 foreign currency = X EUR)
ALTER TABLE currency_balances
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 6);

-- Add timestamp for when the exchange rate was last updated
ALTER TABLE currency_balances
ADD COLUMN IF NOT EXISTS rate_updated_at TIMESTAMPTZ;

-- Add comments explaining the fields
COMMENT ON COLUMN currency_balances.exchange_rate IS 'Exchange rate used: 1 unit of currency = X EUR';
COMMENT ON COLUMN currency_balances.rate_updated_at IS 'Timestamp when the exchange rate was last fetched/updated';

-- The eur_equivalent can now be calculated as: amount * exchange_rate
-- We keep eur_equivalent as a cached value for performance and offline fallback
