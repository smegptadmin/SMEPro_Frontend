# deployment.vars.ps1
$PROJECT_ID = "gen-lang-client-0531826676"      # Your GCP project ID
$REGION = "us-central1"                         # Cloud Run & Artifact Registry region
$REPO = "smepro-backend"                        # Artifact Registry repository name
$SERVICE_NAME = "smepro-api"                    # Cloud Run service name
$SERVICE_ACCOUNT_NAME = "smepro-runner"         # Cloud Run service account (local name)
$SERVICE_ACCOUNT_EMAIL = "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# OAuth
$GOOGLE_OAUTH_CLIENT_ID = "748515429645-uv6m8g2gj3ffgn3m09u140nbahceggm4.apps.googleusercontent.com"
$OAUTH_REDIRECT_URI_PROD = "https://api.smepro.app/oauth2/callback"
$SESSION_COOKIE_NAME = "smepro_session"

# Secrets (paste securely; do not commit)
$GOOGLE_OAUTH_CLIENT_SECRET = "REPLACE_WITH_REAL_CLIENT_SECRET"  # keep private
$JWT_SIGNING_SECRET = "change-this-in-prod"

# Frontend
$FRONTEND_DIR = "C:\Users\Chris Miguez\projects\SMEPro_Frontend" # adjust path
$BACKEND_DIR = "C:\Users\Chris Miguez\projects\SMEPro_Backend"   # adjust path
