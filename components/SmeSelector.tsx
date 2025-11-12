import React, { useState, useEffect, useMemo } from 'react';
import { SmeConfig } from '../types';
import { SubscriptionPlan } from '../App';
import SubscribeButton from './SubscribeButton'; // ✅ import the Stripe button

interface SmeSelectorProps {
  onStartChat: (config: SmeConfig, sessionId: string) => void;
  plan: SubscriptionPlan;
}

const SmeSelector: React.FC<SmeSelectorProps> = ({ onStartChat, plan }) => {
  const [level1, setLevel1] = useState('');
  const [level2, setLevel2] = useState('');
  const [level3, setLevel3] = useState('');
  
  const [schema, setSchema] = useState<any>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState(false);

  useEffect(() => {
    const schemaPath = plan === 'business' 
      ? '/schemas/business_categories.json' 
      : '/schemas/solo_categories.json';
      
    setIsLoadingSchema(true);
    setSchema(null);
    setSchemaError(false);
    fetch(schemaPath)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setSchema(data))
      .catch(err => {
        console.error(`Failed to load ${plan} schema`, err);
        setSchemaError(true);
      })
      .finally(() => setIsLoadingSchema(false));

    setLevel1('');
    setLevel2('');
    setLevel3('');
  }, [plan]);

  useEffect(() => {
    setLevel2('');
    setLevel3('');
  }, [level1]);

  useEffect(() => {
    setLevel3('');
  }, [level2]);

  const isBusiness = plan === 'business';
  const level1Prop = isBusiness ? 'industry' : 'category';
  const level2Prop = isBusiness ? 'subType' : 'subCategory';
  const level3Prop = isBusiness ? 'organizationalSegment' : 'specificOption';

  const level1Options = useMemo(() => {
    if (!schema) return [];
    return schema.properties[level1Prop]?.enum || [];
  }, [schema, level1Prop]);

  const level2Options = useMemo(() => {
    if (!level1 || !schema) return [];
    const rule = schema.allOf.find((r: any) => r.if.properties?.[level1Prop]?.const === level1);
    return rule?.then.properties[level2Prop]?.enum || [];
  }, [schema, level1, level1Prop, level2Prop]);

  const level3Options = useMemo(() => {
    if (!schema) return [];
    if (isBusiness) {
      return schema.properties[level3Prop]?.enum || [];
    }
    if (!level2) return [];
    const rule = schema.allOf.find((r: any) => r.if.properties?.[level2Prop]?.const === level2);
    return rule?.then.properties[level3Prop]?.enum || [];
  }, [schema, isBusiness, level2, level2Prop, level3Prop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (level1 && level2 && level3) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      onStartChat({ industry: level1, subType: level2, segment: level3 }, newSessionId);
    }
  };

  const isFormComplete = level1 && level2 && level3;
  const selectStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:border-slate-700";

  const renderSelectorContent = () => {
    if (isLoadingSchema) return (
      <div className="flex flex-col items-center justify-center min-h-[294px]">
        <div className="w-8 h-8 border-4 border-t-cyan-500 border-slate-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400">Loading expert configurations...</p>
      </div>
    );

    if (schemaError) return (
      <div className="min-h-[294px] flex flex-col justify-center text-left bg-red-900/20 border border-red-800 p-4 rounded-lg">
        <h4 className="font-bold text-red-400 mb-2">Configuration Error</h4>
        <p className="text-sm text-red-300">We couldn't load the expert configurations for your plan. Please try refreshing.</p>
      </div>
    );
    
    if (!schema) return null;

    const labels = {
      level1: isBusiness ? '1. Select Industry' : '1. Select Category',
      level2: isBusiness ? '2. Select Industry Sub-Type' : '2. Select Sub-Category',
      level3: isBusiness ? '3. Select Organizational Segment' : '3. Select Specific Option',
    };
    
    const placeholders = {
      level1: isBusiness ? 'Choose an industry...' : 'Choose a category...',
      level2: isBusiness ? 'Choose a sub-type...' : 'Choose a sub-category...',
      level3: isBusiness ? 'Choose a segment...' : 'Choose a specific option...',
    };

    return (
      <>
        <div>
          <label htmlFor="level1" className="block text-sm font-medium text-slate-300 text-left mb-2">{labels.level1}</label>
          <select id="level1" value={level1} onChange={(e) => setLevel1(e.target.value)} className={selectStyles}>
            <option value="" disabled>{placeholders.level1}</option>
            {level1Options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="level2" className="block text-sm font-medium text-slate-300 text-left mb-2">{labels.level2}</label>
          <select id="level2" value={level2} onChange={(e) => setLevel2(e.target.value)} className={selectStyles} disabled={!level1}>
            <option value="" disabled>{placeholders.level2}</option>
            {level2Options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="level3" className="block text-sm font-medium text-slate-300 text-left mb-2">{labels.level3}</label>
          <select id="level3" value={level3} onChange={(e) => setLevel3(e.target.value)} className={selectStyles} disabled={!level2}>
            <option value="" disabled>{placeholders.level3}</option>
            {level3Options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-800 rounded-2xl">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-white mb-1">SMEPro</h1>
          <p className="text-slate-300 text-lg mb-2 capitalize">Configure Your {plan} Expert</p>
          <p className="text-slate-400">Select your area of focus to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderSelectorContent()}
          <button
            type="submit"
            disabled={!isFormComplete || isLoadingSchema || schemaError}
            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:bg-slate-600"
          >
            Start Collaborative Session
          </button>
        </form>

        {/* ✅ Stripe Subscribe Button */}
        <div className="mt-6">
          {plan === 'solo' ? (
            <SubscribeButton priceId="price_SOLO_MONTHLY" label="Subscribe to Solo Plan" />
          ) : (
            <SubscribeButton priceId="price_BUSINESS_ANNUAL" label="Subscribe to Business Plan" />
          )}
        </div>
      </div>
    </div>
  );
};

export default SmeSelector;
``