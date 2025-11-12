import React from "react";
import { useNavigate } from "react-router-dom";

const PlanSelection: React.FC = () => {
  const navigate = useNavigate();

  // Call backend to create Stripe Checkout session
  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url; // redirect to Stripe Checkout
      } else {
        console.error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Choose Your SMEPro Plan</h1>
      <p className="text-slate-400 mb-12 text-center max-w-xl">
        Select the plan that fits your needs. After subscribing, you’ll configure your SME expert.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Solo Plan */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Solo Plan</h2>
            <p className="text-slate-400 mb-4">
              Perfect for individual professionals and freelancers.
            </p>
            <ul className="text-slate-300 space-y-2 mb-6">
              <li>✔ Access to SME expert categories</li>
              <li>✔ Monthly subscription</li>
              <li>✔ Configure solo workflows</li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe("price_SOLO_MONTHLY")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Subscribe to Solo Plan
          </button>
        </div>

        {/* Business Plan */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Business Plan</h2>
            <p className="text-slate-400 mb-4">
              Designed for teams and organizations needing advanced collaboration.
            </p>
            <ul className="text-slate-300 space-y-2 mb-6">
              <li>✔ Access to all industries</li>
              <li>✔ Annual subscription</li>
              <li>✔ Organizational segments & advanced workflows</li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe("price_BUSINESS_ANNUAL")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Subscribe to Business Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
