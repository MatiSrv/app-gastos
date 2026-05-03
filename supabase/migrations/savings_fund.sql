ALTER TABLE savings_contributions ADD COLUMN enters_fund BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE savings_fund_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL UNIQUE,
  tna NUMERIC(6,2) NOT NULL CHECK (tna > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE savings_fund_months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fund_months_select_authenticated" ON savings_fund_months
  FOR SELECT TO authenticated USING (true);
