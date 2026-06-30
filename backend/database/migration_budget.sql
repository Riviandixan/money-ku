-- Migration: Add budgets table
-- Run this after schema.sql is already applied

CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(10) NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly')),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, category, month, year, period)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year ON budgets(user_id, month, year);

COMMENT ON TABLE budgets IS 'Stores user budget limits per category per period';
