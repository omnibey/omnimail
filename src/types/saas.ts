export type PlanTier = 'free_anonymous' | 'pro_monthly' | 'pro_annual' | 'enterprise';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  popular?: boolean;
  features: PlanFeature[];
  limits: {
    maxConcurrentMailboxes: number;
    emailRetentionHours: number;
    customDomains: boolean;
    webhookForwarding: boolean;
    apiAccess: boolean;
    storageMbPerMailbox: number;
  };
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  plan: PlanTier;
  createdAt: string;
}

export interface EmailProviderConfig {
  id: 'cloudflare' | 'gmail' | 'outlook' | 'mock';
  name: string;
  enabled: boolean;
  type: 'inbound' | 'outbound' | 'bidirectional';
  description: string;
}
