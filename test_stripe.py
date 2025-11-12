import os, stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

print("Stripe key loaded:", stripe.api_key[:10], "...")
print("Webhook secret loaded:", webhook_secret[:10], "...")
