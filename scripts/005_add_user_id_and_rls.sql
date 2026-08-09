-- Migration: Add Supabase Auth ownership to finance tables.
-- Take a database backup before running this migration.

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE income ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE investment_contributions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE possessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE currency_exchanges ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE currency_balances ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE expenses ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE income ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE investments ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE investment_contributions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE possessions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE currency_exchanges ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE currency_balances ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE settings ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_contributions_user_id ON investment_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_possessions_user_id ON possessions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_exchanges_user_id ON currency_exchanges(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_balances_user_id ON currency_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_key;
ALTER TABLE currency_balances DROP CONSTRAINT IF EXISTS currency_balances_currency_key;

ALTER TABLE settings ADD CONSTRAINT settings_user_key_key UNIQUE (user_id, key);
ALTER TABLE currency_balances ADD CONSTRAINT currency_balances_user_currency_key UNIQUE (user_id, currency);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE possessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expenses_owner_policy ON expenses;
DROP POLICY IF EXISTS income_owner_policy ON income;
DROP POLICY IF EXISTS investments_owner_policy ON investments;
DROP POLICY IF EXISTS investment_contributions_owner_policy ON investment_contributions;
DROP POLICY IF EXISTS possessions_owner_policy ON possessions;
DROP POLICY IF EXISTS currency_exchanges_owner_policy ON currency_exchanges;
DROP POLICY IF EXISTS currency_balances_owner_policy ON currency_balances;
DROP POLICY IF EXISTS settings_owner_policy ON settings;

CREATE POLICY expenses_owner_policy ON expenses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY income_owner_policy ON income
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY investments_owner_policy ON investments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY investment_contributions_owner_policy ON investment_contributions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY possessions_owner_policy ON possessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY currency_exchanges_owner_policy ON currency_exchanges
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY currency_balances_owner_policy ON currency_balances
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY settings_owner_policy ON settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
