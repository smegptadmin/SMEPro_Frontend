

import React, { useState } from 'react';
import { UserProfile, SubscriptionPlan, SubscriptionType, SmeConfig } from '../types';
import PaymentModal from './PaymentModal';
import { PLAN_DETAILS } from '../constants';

interface LandingPageProps {
  userProfile: UserProfile;
  smeConfig: SmeConfig;
  onSubscribe: (plan: SubscriptionPlan) => void;
  onEditProfile: () => void;
  onChangeSmeConfig: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ userProfile, smeConfig, onSubscribe, onEditProfile, onChangeSmeConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType | null>(null);
  
  const selectedPlanDetails = PLAN_DETAILS[userProfile.accountType];
  const billingCycle = userProfile.billingCycle || 'monthly';
  const price = billingCycle === 'annual' ? selectedPlanDetails.prices.annual : selectedPlanDetails.prices.monthly;

  const handlePaymentSuccess = () => {
    onSubscribe(userProfile.accountType);
  };
  
  const openModal = (type: SubscriptionType) => {
    setSubscriptionType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-800 rounded-2xl overflow-y-auto">
        <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold text-white mb-2">Confirm Your Selections</h1>
            <p className="text-slate-300 mb-8">Welcome, <span className="font-semibold text-cyan-400">{userProfile.name}</span>! Please confirm your details to continue.</p>
            
            <div className="summary-card plan-highlight bg-slate-700/50 border rounded-xl p-6 text-left space-y-4 mb-8 transition-all duration-300">
                <div>
                    <span className="text-sm font-semibold text-slate-400">Account Type</span>
                    <p className="text-lg font-bold text-white">{selectedPlanDetails.name} ({billingCycle === 'annual' ? 'Annual' : 'Monthly'})</p>
                    <p className="text-slate-300 text-sm">{userProfile.email}</p>
                     <button onClick={onEditProfile} className="text-xs text-cyan-500 hover:underline mt-1">
                        Edit Profile
                    </button>
                </div>

                <div className="border-t border-slate-600"></div>

                <div>
                    <span className="text-sm font-semibold text-slate-400">Your SME Configuration</span>
                    <p className="text-slate-300 font-medium">{smeConfig.industry}</p>
                    <p className="text-slate-400 text-sm"> <span className="font-semibold">↳</span> {smeConfig.subType}</p>
                    <p className="text-slate-400 text-sm"> <span className="font-semibold">↳</span> {smeConfig.segment}</p>
                     <button onClick={onChangeSmeConfig} className="text-xs text-cyan-500 hover:underline mt-1">
                        Change configuration
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                 <button 
                    onClick={() => openModal('trial')}
                    className="action-button w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-500/50 transition-all duration-300"
                >
                    Proceed with Free 7-Day Trial
                </button>
                 <button 
                    onClick={() => openModal('payNow')}
                    className="action-button w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300"
                >
                    Pay Now to Activate Subscription
                </button>
            </div>
             <p className="mt-6 text-xs text-slate-500">
                This is a demonstration. All payment fields are pre-filled for convenience. By proceeding, you will start your subscription.
             </p>
        </div>
      </div>
      {isModalOpen && subscriptionType && (
        <PaymentModal 
          plan={userProfile.accountType}
          price={price}
          billingCycle={billingCycle}
          subscriptionType={subscriptionType}
          onClose={() => setIsModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default LandingPage;