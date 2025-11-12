param(
  [string]$SQLiteExe           = "C:\sqlite\sqlite3.exe",
  [string]$DbPath              = "C:\Users\Chris Miguez\projects\SMEPro_Backend\backend\instance\smepro.db",
  [string]$MigrationSql        = "C:\Users\Chris Miguez\projects\SMEPro_Frontend\smepro_migration.sql",
  [string]$BackendRoot         = "C:\Users\Chris Miguez\projects\SMEPro_Backend",
  [string]$StripeApiKey        = $env:STRIPE_API_KEY,           # Set in your user/machine environment
  [string]$StripeWebhookSecret = $env:STRIPE_WEBHOOK_SECRET,    # Set in your user/machine environment
  [string]$WebhookEndpoint     = "https://studio67.app/api/stripe/webhook", # Your deployed webhook endpoint
  [switch]$SeedDemoData
)

function Write-Section($text) {
  Write-Host "=== $text ===" -ForegroundColor Cyan
}

function Invoke-Migration {
  Write-Section "Applying SMEPro migration"
  $dbDir = Split-Path -Parent $DbPath
  if (-not (Test-Path $dbDir)) {
    New-Item -ItemType Directory -Path $dbDir | Out-Null
    Write-Host "Created directory: $dbDir"
  }

  if (-not (Test-Path $MigrationSql)) {
    Write-Error "Migration file not found: $MigrationSql"
    exit 1
  }

  # Feed the .sql file directly into sqlite3 (reliable in PowerShell)
  & $SQLiteExe $DbPath < $MigrationSql

  if ($LASTEXITCODE -ne 0) {
    Write-Error "Migration failed (exit code $LASTEXITCODE)."
    exit $LASTEXITCODE
  }
  Write-Host "Migration applied successfully."
}

function Seed-BaselineData {
  Write-Section "Seeding baseline demo data (optional)"
  $seedSql = @"
BEGIN TRANSACTION;

-- Baseline user
INSERT OR IGNORE INTO users (email, stripe_customer_id)
VALUES ('csmhoutx78@gmail.com', 'cus_demo_001');

-- Solo + Business subscriptions for that user
INSERT OR IGNORE INTO subscriptions (user_id, customer_id, subscription_id, price_id, status)
SELECT u.id, 'cus_demo_001', 'sub_solo001', 'price_solo25', 'active' FROM users u WHERE u.email = 'csmhoutx78@gmail.com';

INSERT OR IGNORE INTO subscriptions (user_id, customer_id, subscription_id, price_id, status)
SELECT u.id, 'cus_demo_001', 'sub_business001', 'price_business55', 'active' FROM users u WHERE u.email = 'csmhoutx78@gmail.com';

COMMIT;
"@

  & $SQLiteExe $DbPath "$seedSql"
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Seeding failed (exit code $LASTEXITCODE)."
    exit $LASTEXITCODE
  }
  Write-Host "Baseline demo data seeded."
}

function Print-Views {
  Write-Section "Reporting layer — reviewer-ready outputs"

  $queries = @(
    @{Name="active_subscriptions_view";     Sql="SELECT * FROM active_subscriptions_view;"},
    @{Name="plan_revenue_view";             Sql="SELECT * FROM plan_revenue_view;"},
    @{Name="user_monthly_spend_view";       Sql="SELECT * FROM user_monthly_spend_view;"},
    @{Name="plan_user_breakdown_view";      Sql="SELECT * FROM plan_user_breakdown_view;"},
    @{Name="plan_churn_view";               Sql="SELECT * FROM plan_churn_view;"}
  )

  foreach ($q in $queries) {
    Write-Host "`n-- $($q.Name) --" -ForegroundColor Green
    & $SQLiteExe $DbPath $q.Sql
    if ($LASTEXITCODE -ne 0) {
      Write-Error "Query $($q.Name) failed (exit code $LASTEXITCODE)."
      exit $LASTEXITCODE
    }
  }
}

function Set-BackendEnv {
  Write-Section "Exporting backend environment variables"
  if ($StripeApiKey) {
    $env:STRIPE_API_KEY = $StripeApiKey
    Write-Host "STRIPE_API_KEY set."
  } else {
    Write-Warning "STRIPE_API_KEY not provided. Set it before running live."
  }

  if ($StripeWebhookSecret) {
    $env:STRIPE_WEBHOOK_SECRET = $StripeWebhookSecret
    Write-Host "STRIPE_WEBHOOK_SECRET set."
  } else {
    Write-Warning "STRIPE_WEBHOOK_SECRET not provided. Set it before running live."
  }

  $env:SMEPRO_DB_PATH = $DbPath
  Write-Host "SMEPRO_DB_PATH set to $DbPath"
}

function Register-StripeWebhook {
  Write-Section "Registering Stripe webhook (optional)"
  if (-not $StripeApiKey -or -not $WebhookEndpoint) {
    Write-Warning "Missing STRIPE_API_KEY or WebhookEndpoint. Skipping webhook registration."
    return
  }

  $body = @{
    url   = $WebhookEndpoint
    enabled_events = @(
      "customer.created",
      "customer.updated",
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.paid",
      "invoice.payment_failed"
    )
  } | ConvertTo-Json

  try {
    $resp = Invoke-RestMethod -Method Post `
      -Uri "https://api.stripe.com/v1/webhook_endpoints" `
      -Headers @{ Authorization = "Bearer $StripeApiKey" } `
      -ContentType "application/x-www-form-urlencoded" `
      -Body @{
        url = $WebhookEndpoint
        "enabled_events[]" = "customer.created"
        "enabled_events[]" = "customer.updated"
        "enabled_events[]" = "checkout.session.completed"
        "enabled_events[]" = "customer.subscription.created"
        "enabled_events[]" = "customer.subscription.updated"
        "enabled_events[]" = "customer.subscription.deleted"
        "enabled_events[]" = "invoice.paid"
        "enabled_events[]" = "invoice.payment_failed"
      }

    Write-Host ("Webhook registered: " + ($resp.id)) -ForegroundColor Green
  } catch {
    Write-Warning "Webhook registration failed: $($_.Exception.Message)"
  }
}

function Run-Backend {
  Write-Section "Starting backend locally (optional demo)"
  if (-not (Test-Path $BackendRoot)) {
    Write-Warning "Backend root not found: $BackendRoot"
    return
  }

  Push-Location $BackendRoot
  try {
    # Example: start your backend API (adapt to your stack)
    # If using Python/Flask:
    # $env:FLASK_APP = "backend.app"
    # $env:FLASK_ENV = "development"
    # python -m flask run

    # If using FastAPI/Uvicorn:
    # uvicorn backend.main:app --host 0.0.0.0 --port 8000

    Write-Host "Backend start command placeholder — integrate with your actual start script."
  } finally {
    Pop-Location
  }
}

# =========================
# Orchestration
# =========================

Set-BackendEnv
Invoke-Migration

if ($SeedDemoData) {
  Seed-BaselineData
}

Print-Views

# Optional: register webhook (uncomment to enable live registration)
# Register-StripeWebhook

# Optional: start backend locally for a demo (uncomment and adapt)
# Run-Backend

Write-Section "Bootstrap complete"
