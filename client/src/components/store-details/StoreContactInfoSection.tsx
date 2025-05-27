"use client";

import type { ReactElement } from 'react';
import type { StoreDetails } from '@/types/store';
import { AtSign, Building, ExternalLink, Facebook, Instagram, MapPin, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

/**
 * @file src/components/store-details/StoreContactInfoSection.tsx
 * @description Section displaying store contact information and address.
 */

/**
 * Props for StoreContactInfoSection.
 * @interface StoreContactInfoSectionProps
 * @property {Pick<StoreDetails, 'name' | 'addressLine1' | 'addressLine2' | 'postalCode' | 'city' | 'phone' | 'email' | 'website' | 'socialMediaLinks'>} store - Store contact data.
 */
interface StoreContactInfoSectionProps {
  store: Pick<StoreDetails, 'name' | 'addressLine1' | 'addressLine2' | 'postalCode' | 'city' | 'phone' | 'email' | 'website' | 'socialMediaLinks'>;
}

interface ContactItemProps {
  icon: ReactElement;
  label: string;
  value?: string | ReactElement;
  href?: string;
}

const ContactItem = ({ icon, label, value, href }: ContactItemProps): ReactElement | null => {
  if (!value) return null;

  const content = href ? (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 transition-colors group inline-flex items-center text-sm"
    >
      {typeof value === 'string' && (value.startsWith("http") || value.startsWith("mailto:") || value.startsWith("tel:")) 
        ? value.replace(/^(https?:\/\/|mailto:|tel:)/, '') 
        : value}
      <ExternalLink className="ml-1.5 h-3 w-3 opacity-70 group-hover:opacity-100" />
    </a>
  ) : (
    <span className="text-sm text-foreground">{value}</span>
  );

  return (
    <div className="flex items-start space-x-3 py-2">
      <div className="flex-shrink-0 text-primary mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
        {content}
      </div>
    </div>
  );
};

/**
 * Renders the contact information section for a store.
 *
 * @param {StoreContactInfoSectionProps} props - The props for the component.
 * @returns {ReactElement} The rendered contact info section.
 */
export default function StoreContactInfoSection({ store }: StoreContactInfoSectionProps): ReactElement {
  // const t = useTranslations('StoreDetailsPage'); // Removed
  // const tStoreData = useTranslations('StoreData'); // Removed

  const fullAddress = [
    store.addressLine1,
    store.addressLine2,
    `${store.postalCode} ${store.city}`,
  ].filter(Boolean).join(', ');

  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + ", " + store.name)}`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-3 flex items-center">
          <Building className="h-4 w-4 mr-2 text-primary" />
          Contact Information
        </h3>
        
        <div className="space-y-1 divide-y divide-border/40">
          <ContactItem 
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value={fullAddress}
            href={googleMapsLink}
          />
          
          {store.phone && (
            <ContactItem 
              icon={<Phone className="h-4 w-4" />}
              label="Phone" 
              value={store.phone} 
              href={`tel:${store.phone}`}
            />
          )}
          
          {store.email && (
            <ContactItem 
              icon={<AtSign className="h-4 w-4" />}
              label="Email" 
              value={store.email} 
              href={`mailto:${store.email}`}
            />
          )}
          
          {store.website && (
            <ContactItem 
              icon={<Globe className="h-4 w-4" />}
              label="Website" 
              value={store.website} 
              href={store.website}
            />
          )}
        </div>
      </div>

      {(store.socialMediaLinks?.instagram || store.socialMediaLinks?.facebook) && (
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center">
            <Globe className="h-4 w-4 mr-2 text-primary" />
            Social Media
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {store.socialMediaLinks.instagram && (
              <a 
                href={store.socialMediaLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-full text-xs font-medium text-foreground transition-colors"
              >
                <Instagram className="h-3.5 w-3.5 text-pink-500" />
                <span>Instagram</span>
              </a>
            )}
            
            {store.socialMediaLinks.facebook && (
              <a 
                href={store.socialMediaLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-full text-xs font-medium text-foreground transition-colors"
              >
                <Facebook className="h-3.5 w-3.5 text-blue-600" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}