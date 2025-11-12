import React from "react";

type SubscribeButtonProps = {
  priceId: string; // Stripe Price ID (e.g., "price_12345")
  label?: string;  // Optional button label
};

function SubscribeButton({ priceId, label = "Subscribe" }: SubscribeButtonProps) {
  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:5000/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("Error creating checkout session");
    }
  };

  return (
    <button onClick={handleClick} className="subscribe-btn">
      {label}
    </button>
  );
}

export default SubscribeButton;
