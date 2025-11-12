// components/Cancel.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Cancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
      <p className="text-lg mb-6 text-center max-w-xl">
        Your payment wasn’t completed. You can try again or choose a different plan.
      </p>
      <button
        onClick={() => navigate("/plans")}
        className="bg-white text-red-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200"
      >
        Return to Plans
      </button>
    </div>
  );
};

export default Cancel;
