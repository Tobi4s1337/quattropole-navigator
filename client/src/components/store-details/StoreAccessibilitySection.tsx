"use client";

import type { ReactElement } from 'react';
// import { useTranslations } from 'next-intl'; // Removed
import type { AccessibilityFeature } from '@/types/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accessibility,
  CheckCircle2, 
  XCircle,      
  AlertTriangle, 
  Info,          
  Ban 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

/**
 * @file src/components/store-details/StoreAccessibilitySection.tsx
 * @description Section displaying store accessibility features (English strings hardcoded).
 */

/**
 * Props for the StoreAccessibilitySection component.
 * @interface StoreAccessibilitySectionProps
 * @property {AccessibilityFeature[]} features - Array of accessibility features.
 */
interface StoreAccessibilitySectionProps {
  features: AccessibilityFeature[];
}

/**
 * Dynamically get a Lucide icon component by its name.
 * @param {string} name - The name of the Lucide icon.
 * @param {object} [props] - Props to pass to the icon component.
 * @returns {ReactElement | null} The icon component or null if not found.
 */
const DynamicLucideIcon = ({ name, ...props }: { name: string } & LucideIcons.LucideProps): ReactElement | null => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    return <Accessibility {...props} />;
  }
  return <IconComponent {...props} />;
};

/**
 * Renders the accessibility features section for a store.
 */
export default function StoreAccessibilitySection({ features }: StoreAccessibilitySectionProps): ReactElement {
  // const t = useTranslations('StoreDetailsPage'); // Removed
  // const tAccessibility = useTranslations('Accessibility'); // Removed

  const getStatusText = (status: AccessibilityFeature['status']): string => {
    switch (status) {
      case true: return "Available";
      case false: return "Not Available";
      case "partial": return "Partially Available";
      case "unknown":
      default: return "Information Unknown";
    }
  };

  if (!features || features.length === 0) {
    return (
      <section aria-labelledby="accessibility-heading">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Accessibility className="h-6 w-6 text-primary" />
              <CardTitle id="accessibility-heading" className="text-2xl md:text-3xl">Accessibility</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Ban className="w-16 h-16 mb-4 opacity-50" />
                <p>No accessibility information provided for this store.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section aria-labelledby="accessibility-heading">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center space-x-3">
            <Accessibility className="h-6 w-6 text-primary" />
            <CardTitle id="accessibility-heading" className="text-2xl md:text-3xl">
              Accessibility Features
            </CardTitle>
          </div>
          <CardDescription className="pt-2 text-sm md:text-base">
            Detailed accessibility information for the store.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {features.map((featureItem, index) => {
              let StatusIcon, iconColor;

              switch (featureItem.status) {
                case true:
                  StatusIcon = CheckCircle2;
                  iconColor = "text-green-600 dark:text-green-500";
                  break;
                case false:
                  StatusIcon = XCircle;
                  iconColor = "text-red-600 dark:text-red-500";
                  break;
                case 'partial':
                  StatusIcon = AlertTriangle;
                  iconColor = "text-yellow-600 dark:text-yellow-500";
                  break;
                case 'unknown':
                default:
                  StatusIcon = AlertTriangle;
                  iconColor = "text-muted-foreground";
                  break;
              }
              const statusText = getStatusText(featureItem.status);

              return (
                <li key={index} className="p-4 md:p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={cn("flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted", iconColor)}>
                       <StatusIcon className={cn("w-5 h-5", iconColor === "text-muted-foreground" ? iconColor : "text-white dark:text-black")} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {featureItem.icon && (
                            <DynamicLucideIcon name={featureItem.icon} className="w-5 h-5 text-primary mr-1" />
                        )}
                        <h4 className="text-base md:text-lg font-semibold text-foreground">
                          {featureItem.feature} 
                        </h4>
                      </div>
                      <p className={cn("text-sm md:text-base", iconColor)}>
                        {statusText}
                      </p>
                      {featureItem.details && (
                        <p className="mt-1 text-xs md:text-sm text-muted-foreground italic flex items-start">
                          <Info className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
                          {featureItem.details}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
} 