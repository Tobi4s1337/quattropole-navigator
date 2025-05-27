"use client";

import type { ReactElement } from 'react';
// import { useTranslations } from 'next-intl'; // Removed

import { Badge } from "@/components/ui/badge";
import { CreditCard, Landmark, Smartphone } from 'lucide-react'; 

/**
 * @file src/components/store-details/StorePaymentMethodsSection.tsx
 * @description Section displaying accepted payment methods (English strings hardcoded).
 */

interface StorePaymentMethodsSectionProps {
  paymentMethods: string[]; // Changed from paymentMethodsKeys
}

/**
 * Maps payment method names to Lucide icons.
 */
const getPaymentIcon = (methodName: string): ReactElement => {
  const method = methodName.toLowerCase();
  if (method.includes('card')) return <CreditCard className="h-4 w-4 mr-1.5" />;
  if (method.includes('cash')) return <Landmark className="h-4 w-4 mr-1.5" />;
  if (method.includes('mobile') || method.includes('pay')) return <Smartphone className="h-4 w-4 mr-1.5" />;
  return <CreditCard className="h-4 w-4 mr-1.5" />;
};

/**
 * Renders the payment methods section for a store.
 */
export default function StorePaymentMethodsSection({ paymentMethods }: StorePaymentMethodsSectionProps): ReactElement {
  // const t = useTranslations('StoreDetailsPage'); // Removed
  // const tPayment = useTranslations('PaymentMethods'); // Removed

  if (!paymentMethods || paymentMethods.length === 0) {
    return <></>; 
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold flex items-center">
        <CreditCard className="h-4 w-4 mr-2 text-primary" />
        Payment Methods
      </h3>
      
      <div className="flex flex-wrap gap-1.5">
        {paymentMethods.map((method) => (
          <Badge 
            key={method} 
            variant="secondary" 
            className="px-2 py-1 text-xs bg-muted/70 hover:bg-muted flex items-center"
          >
            {getPaymentIcon(method)}
            <span>{method}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
} 