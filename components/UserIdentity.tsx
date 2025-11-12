import React, { useState } from 'react';
import { UserProfile, SubscriptionPlan } from '../types';

interface UserIdentityProps {
  onConfirm: (profile: Omit<UserProfile, 'billingCycle'>) => void;
  initialPlan?: SubscriptionPlan;
}

const UserIdentity: React.FC<UserIdentityProps> = ({ onConfirm, initialPlan }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<SubscriptionPlan | null>(initialPlan || null);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return true; // Don't show error for empty field yet
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };
  
  const isFormComplete = name.trim() && email.trim() && accountType && !emailError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormComplete) {
      onConfirm({ 
        name: name.trim(), 
        email: email.trim(), 
        accountType 
      });
    }
  };
  
  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300";

  const getCardClasses = (type: SubscriptionPlan) => {
    const baseClasses = 'p-4 rounded-lg text-left plan-card';
    if (accountType === type) {
      return `${baseClasses} border-4 plan-card-selected`;
    }
    return `${baseClasses} border-2 bg-slate-700/50 border-slate-600`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-800 rounded-2xl">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Tell us who you are</h1>
        <p className="text-slate-300 mb-8">Let's get started by setting up your profile.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 text-left mb-2">Name</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className={inputStyles}
              placeholder="e.g., Jane Doe"
              required 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 text-left mb-2">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={handleEmailChange}
              className={`${inputStyles} ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., jane.doe@example.com"
              required 
            />
             {emailError && <p className="text-red-400 text-xs mt-2 text-left">{emailError}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setAccountType('solo')}
                className={getCardClasses('solo')}
                disabled={!!initialPlan}
              >
                  <h3 className="font-bold text-white">SMEPro Solo</h3>
                  <p className="text-sm text-slate-300 mt-1">Independent Professional / Creator</p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('business')}
                className={getCardClasses('business')}
                disabled={!!initialPlan}
              >
                  <h3 className="font-bold text-white">SMEPro Business</h3>
                  <p className="text-sm text-slate-300 mt-1">Business / Organization</p>
              </button>
          </div>
          <button
            type="submit"
            disabled={!isFormComplete}
            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:bg-slate-600"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserIdentity;