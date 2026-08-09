-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('necessary', 'pleasure')),
  date DATE NOT NULL,
  notes TEXT,
  recurring_day_of_month INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  category TEXT NOT NULL CHECK (category IN ('fixed', 'variable', 'refund', 'one-time', 'selling')),
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stocks', 'crypto', 'funds', 'fixed-income', 'custom')),
  initial_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  current_value DECIMAL(12, 2),
  expected_yearly_percentage DECIMAL(5, 2) NOT NULL,
  recurring_amount DECIMAL(12, 2),
  recurring_day_of_month INTEGER,
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create possessions table
CREATE TABLE IF NOT EXISTS possessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchase_price DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create currency_exchanges table
CREATE TABLE IF NOT EXISTS currency_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  from_currency VARCHAR(3) NOT NULL,
  from_amount DECIMAL(12, 2) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  to_amount DECIMAL(12, 2) NOT NULL,
  exchange_rate DECIMAL(10, 6) NOT NULL,
  fee DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create currency_balances table
CREATE TABLE IF NOT EXISTS currency_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  eur_equivalent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('defaultCurrency', 'EUR'),
  ('dateFormat', 'DD/MM/YYYY'),
  ('language', 'en'),
  ('startingBalance', '0'),
  ('netWorthGoalValue', '0'),
  ('netWorthGoalYear', EXTRACT(YEAR FROM CURRENT_DATE)::TEXT)
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_income_month ON income(month);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_currency_exchanges_date ON currency_exchanges(date);