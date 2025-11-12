-- SMEPro Consolidated Migration
-- Idempotent: safe to re-run (IF NOT EXISTS, INSERT OR IGNORE)

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- =========================
-- Core tables
-- =========================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Auto-incrementing integer ID
    email TEXT UNIQUE,                      -- User email
    stripe_customer_id TEXT UNIQUE,         -- Stripe customer ID for linkage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Auto-incrementing integer ID
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Link to users table
    customer_id TEXT,                       -- Stripe customer ID
    subscription_id TEXT UNIQUE,            -- Stripe subscription ID
    price_id TEXT,                          -- Stripe price ID (plan code)
    status TEXT,                            -- Subscription status (active, canceled, trialing, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lookup table for SMEPro subscription plans
CREATE TABLE IF NOT EXISTS plans (
    price_id TEXT PRIMARY KEY,              -- Stripe price_id
    plan_name TEXT,                         -- Human-readable plan name
    monthly_cost DECIMAL(10,2)              -- Monthly cost in USD
);

-- =========================
-- Seed data
-- =========================

-- Seed SMEPro Subscriptions
INSERT OR IGNORE INTO plans (price_id, plan_name, monthly_cost) VALUES
('price_solo25', 'SMEPro Solo', 25.00),
('price_business55', 'SMEPro Business', 55.00);

-- Seed SMEPro Advanced Features
INSERT OR IGNORE INTO plans (price_id, plan_name, monthly_cost) VALUES
('price_builder45', 'SMEBuilder', 45.00),
('price_vault35', 'SMEVault', 35.00),
('price_analyzer25', 'SMEAnalyzer', 25.00),
('price_workbench25', 'SMEWorkbench', 25.00);

-- =========================
-- Indexes
-- =========================

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
    ON users (stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id
    ON subscriptions (subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
    ON subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_price_id
    ON subscriptions (price_id);

-- =========================
-- Reporting views
-- =========================

-- 1) Active subscriptions with plan details
CREATE VIEW IF NOT EXISTS active_subscriptions_view AS
SELECT u.email,
       s.subscription_id,
       p.plan_name,
       p.monthly_cost,
       s.status,
       s.created_at
FROM users u
JOIN subscriptions s ON u.id = s.user_id
JOIN plans p ON s.price_id = p.price_id
WHERE s.status = 'active';

-- 2) Revenue aggregation by plan (active only)
CREATE VIEW IF NOT EXISTS plan_revenue_view AS
SELECT p.plan_name,
       SUM(p.monthly_cost) AS total_revenue,
       COUNT(*) AS subscriber_count
FROM subscriptions s
JOIN plans p ON s.price_id = p.price_id
WHERE s.status = 'active'
GROUP BY p.plan_name;

-- 3) Monthly spend per user (active only)
CREATE VIEW IF NOT EXISTS user_monthly_spend_view AS
SELECT u.email,
       SUM(p.monthly_cost) AS total_monthly_spend,
       COUNT(*) AS active_subscriptions
FROM users u
JOIN subscriptions s ON u.id = s.user_id
JOIN plans p ON s.price_id = p.price_id
WHERE s.status = 'active'
GROUP BY u.email;

-- 4) Plan + user breakdown (active only)
CREATE VIEW IF NOT EXISTS plan_user_breakdown_view AS
SELECT p.plan_name,
       u.email,
       s.subscription_id,
       s.status,
       s.created_at
FROM users u
JOIN subscriptions s ON u.id = s.user_id
JOIN plans p ON s.price_id = p.price_id
WHERE s.status = 'active'
ORDER BY p.plan_name, u.email;

-- 5) Subscription churn by plan (all statuses)
CREATE VIEW IF NOT EXISTS plan_churn_view AS
SELECT p.plan_name,
       SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) AS active_count,
       SUM(CASE WHEN s.status = 'canceled' THEN 1 ELSE 0 END) AS canceled_count,
       COUNT(*) AS total_subscriptions
FROM subscriptions s
JOIN plans p ON s.price_id = p.price_id
GROUP BY p.plan_name;

COMMIT;
