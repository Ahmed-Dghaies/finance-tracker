-- Add individual contribution entries for each investment.
-- This allows tracking one-off top-ups and includes them in total invested calculations.

CREATE TABLE IF NOT EXISTS investment_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investment_contributions_investment_id
  ON investment_contributions(investment_id);

CREATE INDEX IF NOT EXISTS idx_investment_contributions_date
  ON investment_contributions(date);
