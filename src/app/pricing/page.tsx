import React from 'react';
import { PricingTable } from '@/components/marketing/PricingTable';

export const metadata = {
  title: 'Pricing Plans — OmniMail & OmniBey',
  description: 'Flexible, low-cost pricing for personal privacy, developer QA automation, and enterprise email routing.',
};

export default function PricingPage() {
  return (
    <div className="py-8 flex-1">
      <PricingTable />
    </div>
  );
}
