// components/Success.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Success: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Subscription Successful</h1>
      <p className="text-lg mb-6 text-center max-w-xl">
        Your subscription is active. Configure your SME expert to get started.
      </p>
      <button
        onClick={() => navigate("/sme-selector")}
        className="bg-white text-green-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200"
      >
        Configure SME Expert
      </button>
    </div>
  );
};

export default Success;
