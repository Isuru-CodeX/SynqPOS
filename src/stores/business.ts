import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BusinessProfile {
  name: string;
  legalName: string;
  taxId: string;
  industry: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  currency: string;
  taxRate: number;
  taxName: string;
  pointsPerThousand: number;
  allowNegativeStock: boolean;
  devMode: boolean;
  logoUrl?: string;
}

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: 'SynqPOS',
  legalName: 'SynqPOS Global Technologies Inc.',
  taxId: 'SYNQ-8921-TAX',
  industry: 'Restaurant & Retail',
  description: 'Next-generation AI omnichannel Point of Sale & ERP platform',
  email: 'isururathnayaka999@gmail.com',
  phone: '+1 (555) 234-5678',
  website: 'https://synqpos.io',
  address: '742 Evergreen Terrace, Suite 100',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'United States',
  currency: 'USD',
  taxRate: 8.0,
  taxName: 'Sales Tax (VAT)',
  pointsPerThousand: 10,
  allowNegativeStock: false,
  devMode: false,
};

interface BusinessState {
  profile: BusinessProfile;
  setProfile: (updates: Partial<BusinessProfile>) => void;
  resetToDefaults: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      profile: DEFAULT_BUSINESS_PROFILE,
      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
      resetToDefaults: () => set({ profile: DEFAULT_BUSINESS_PROFILE }),
    }),
    {
      name: 'synqpos-business-profile',
    }
  )
);
