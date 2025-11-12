import os
import stripe
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load keys from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@app.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.get_json()
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": data["priceId"], "quantity": 1}],
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
        )
        return jsonify({"url": checkout_session.url})
    except Exception as e:
        return jsonify(error=str(e)), 400

@app.route("/webhook", methods=["POST"])
def webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        return "Invalid signature", 400

    # Handle subscription events
    if event["type"] == "customer.subscription.created":
        print("✅ Subscription created:", event["data"]["object"]["id"])

    return "Success", 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)
