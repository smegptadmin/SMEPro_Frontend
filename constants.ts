import { SubscriptionPlan } from './types';

interface PlanDetails {
  name: string;
  prices: {
    monthly: string;
    annual: string;
  };
  description: string;
  features: string[];
}

export const PLAN_DETAILS: Record<SubscriptionPlan | 'oem', PlanDetails> = {
  solo: {
    name: 'SMEPro Solo',
    prices: {
      monthly: '9.99',
      annual: '99.99',
    },
    description: 'For individuals, artists, and freelancers seeking specialized knowledge.',
    features: [
      '1 User Account',
      'Access to all Solo SMEs',
      'Standard Guided Sessions',
      'SMEPro Vault (1GB)',
      'Community Support',
    ],
  },
  business: {
    name: 'SMEPro Business',
    prices: {
      monthly: '17.99',
      annual: '179.99',
    },
    description: 'For teams, startups, and established companies needing deep operational insights.',
    features: [
      'Up to 5 User Accounts',
      'Access to all Business SMEs',
      'Advanced Guided Sessions',
      'Collaborative Workspaces',
      'SMEPro Vault (10GB)',
      'Priority Email Support',
    ],
  },
  oem: {
    name: 'SMEPro OEM',
    prices: {
      monthly: 'Custom',
      annual: 'Custom',
    },
    description: 'For enterprises seeking to integrate specialized AI into their own platforms.',
    features: [
      'Unlimited User Accounts',
      'Custom-Trained SMEs',
      'Full API Access',
      'White-labeling Options',
      'Dedicated Support & Onboarding',
      'Enterprise-grade Security',
    ],
  },
};
