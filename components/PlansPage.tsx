import React, { useState, useEffect, useRef } from 'react';
import { SubscriptionPlan } from '../types';
import { PLAN_DETAILS } from '../constants';

interface PlansPageProps {
  onChoosePlan: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual') => void;
}

const PlanCard: React.FC<{
  plan: SubscriptionPlan | 'oem';
  billingCycle: 'monthly' | 'annual';
  onChoosePlan: () => void;
  isFeatured?: boolean;
}> = ({ plan, billingCycle, onChoosePlan, isFeatured = false }) => {
  const details = PLAN_DETAILS[plan];
  const price = billingCycle === 'annual' ? details.prices.annual : details.prices.monthly;
  const isOem = plan === 'oem';

  return (
    <div className={`p-8 rounded-2xl border h-full flex flex-col ${isFeatured ? 'bg-slate-800 border-cyan-500 plan-highlight' : 'bg-slate-800/50 border-slate-700'}`}>
      <h3 className="text-2xl font-bold text-white">{details.name}</h3>
      <p className="text-slate-400 mt-2 min-h-[40px]">{details.description}</p>
      
      {!isOem && (
        <div className="my-6">
          <span className="text-5xl font-extrabold text-white">${price}</span>
          <span className="text-slate-400">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
        </div>
      )}
      
      <div className="border-t border-slate-700 my-6"></div>

      <ul className="space-y-3 text-sm text-slate-300 flex-grow">
        {details.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-px">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <button
          onClick={onChoosePlan}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 text-center ${
            isFeatured
              ? 'bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50'
              : 'bg-slate-700 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/50'
          }`}
        >
          {isOem ? 'Contact Sales' : 'Choose Plan'}
        </button>
      </div>
    </div>
  );
};


const PlansPage: React.FC<PlansPageProps> = ({ onChoosePlan }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
    const sectionsRef = useRef<Array<HTMLElement | null>>([]);
    
    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on page change
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const currentSections = sectionsRef.current.filter(Boolean);
        currentSections.forEach((section) => {
            if (section) observer.observe(section);
        });
        
        return () => {
            currentSections.forEach((section) => {
                if (section) observer.unobserve(section);
            });
        };
    }, []);

    return (
        <div className="min-h-screen pt-20 text-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <header ref={el => { sectionsRef.current[0] = el; }} className="text-center py-20 scroll-fade-in-section">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                       Find the Right Plan for You
                    </h1>
                    <p className="mt-6 text-lg max-w-2xl mx-auto text-slate-300">
                       Start for free, then choose a plan that fits your goals. Simple, transparent pricing for individuals and teams.
                    </p>
                </header>

                {/* Toggle and Plans */}
                <section ref={el => { sectionsRef.current[1] = el; }} className="py-12 scroll-fade-in-section">
                    <div className="flex justify-center items-center gap-4 mb-12">
                        <span className={`font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            role="switch"
                            aria-checked={billingCycle === 'annual'}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'}`}/>
                        </button>
                        <span className={`font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
                            Annual <span className="text-xs bg-cyan-800 text-cyan-200 font-bold px-2 py-0.5 rounded-full">Save 16%</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        <PlanCard 
                            plan="solo" 
                            billingCycle={billingCycle} 
                            onChoosePlan={() => onChoosePlan('solo', billingCycle)}
                        />
                         <PlanCard 
                            plan="business" 
                            billingCycle={billingCycle} 
                            onChoosePlan={() => onChoosePlan('business', billingCycle)}
                            isFeatured={true}
                        />
                         <PlanCard 
                            plan="oem" 
                            billingCycle={billingCycle} 
                            onChoosePlan={() => { window.location.href = 'mailto:sales@smepro.ai'; }}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PlansPage;
