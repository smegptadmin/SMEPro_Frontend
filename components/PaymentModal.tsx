import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, SubscriptionType } from '../types';
import { PLAN_DETAILS } from '../constants';

interface PaymentModalProps {
  plan: SubscriptionPlan;
  price: string;
  subscriptionType: SubscriptionType;
  billingCycle: 'monthly' | 'annual';
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, price, subscriptionType, billingCycle, onClose, onPaymentSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1500); // Show success message for 1.5s
    }, 2000); // Simulate 2s processing time
  };
  
  const planName = PLAN_DETAILS[plan].name;
  const isTrial = subscriptionType === 'trial';

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-t-cyan-500 border-slate-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-300">Processing...</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-green-500">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.75-3.75Z" clipRule="evenodd" />
            </svg>
            <h3 className="mt-4 text-2xl font-bold text-white">Success!</h3>
            <p className="mt-1 text-slate-300">Welcome to {planName}.</p>
          </div>
        );
      case 'idle':
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{isTrial ? 'Start Your Free Trial' : 'Checkout'}</h2>
                <p className="text-slate-400">
                  {isTrial ? 'You are starting a 7-day free trial for ' : 'You are subscribing to '} 
                  <span className="text-cyan-400 font-semibold">{planName}</span>.
                </p>
              </div>
              <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
              </button>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-slate-300 mb-1">Name on Card</label>
                <input type="text" id="cardName" defaultValue="John Doe" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" required />
              </div>
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-300 mb-1">Card Number</label>
                <input type="text" id="cardNumber" placeholder="**** **** **** 1234" defaultValue="4242 4242 4242 4242" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="expiry" className="block text-sm font-medium text-slate-300 mb-1">Expiry</label>
                  <input type="text" id="expiry" placeholder="MM/YY" defaultValue="12/28" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" required />
                </div>
                <div className="flex-1">
                  <label htmlFor="cvc" className="block text-sm font-medium text-slate-300 mb-1">CVC</label>
                  <input type="text" id="cvc" placeholder="123" defaultValue="123" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" required />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300">
                  {isTrial ? 'Start 7-Day Free Trial' : `Pay $${price}${billingCycle === 'annual' ? '/year' : '/month'}`}
                </button>
              </div>
            </form>
            {isTrial && (
              <p className="text-xs text-slate-500 mt-4 text-center">
                You won't be charged today. After 7 days, your subscription will begin at ${price}/{billingCycle === 'annual' ? 'year' : 'month'} unless you cancel.
              </p>
            )}
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-md p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentModal;