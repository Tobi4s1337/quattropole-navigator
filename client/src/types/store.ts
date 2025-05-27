/**
 * @file src/types/store.ts
 * @description Type definitions for store-related data.
 */

import type { OpeningHoursSpecification } from "schema-dts";
import type { LatLngLiteral } from "@/types/common"; // Assuming you have a common types file

/**
 * Represents an image with a URL and alt text.
 * @interface Image
 * @property {string} url - The URL of the image.
 * @property {string} altText - The image's alt text.
 */
export interface Image {
  url: string;
  altText: string;
}

/**
 * Represents accessibility features of a store.
 * @interface AccessibilityFeature
 * @property {string} feature - Name of the feature.
 * @property {boolean | 'partial' | 'unknown'} status - True if fully available, partial, false, or unknown.
 * @property {string} [details] - Optional more details.
 * @property {string} [icon] - Optional Lucide icon name for the feature.
 */
export interface AccessibilityFeature {
  feature: string;
  status: boolean | "partial" | "unknown";
  details?: string;
  icon?: string; // e.g., 'Accessibility', 'Users', 'ParkingCircle'
}

/**
 * Represents a parking option near the store.
 * @interface ParkingOption
 * @property {string} name - The parking facility name.
 * @property {string} address - The parking address.
 * @property {string} [distance] - Distance/time (e.g., "5minWalk").
 * @property {LatLngLiteral} [coordinates] - Optional coordinates for map display.
 * @property {AccessibilityFeature[]} [accessibilityFeatures] - Accessibility features of the parking.
 */
export interface ParkingOption {
  name: string;
  address: string;
  distance?: string;
  coordinates?: LatLngLiteral;
  accessibilityFeatures?: AccessibilityFeature[];
}

/**
 * Represents a public transport stop.
 * @interface PublicTransportStop
 * @property {string} name - The stop name.
 * @property {('bus' | 'tram' | 'train' | 'subway')[]} modes - Transport modes available at this stop.
 * @property {string} [lines] - Relevant lines (e.g., "Lines: 10, 12").
 * @property {string} [distance] - Distance/time.
 * @property {AccessibilityFeature[]} [accessibilityFeatures] - Accessibility features of the stop.
 */
export interface PublicTransportStop {
  name: string;
  modes: ("bus" | "tram" | "train" | "subway")[];
  lines?: string;
  distance?: string;
  accessibilityFeatures?: AccessibilityFeature[];
}

/**
 * Represents detailed information about a store.
 * @interface StoreDetails
 * @property {string} id - Unique identifier for the store.
 * @property {string} slug - URL-friendly slug for the store.
 * @property {string} name - The store's name.
 * @property {string} shortDescription - A brief description.
 * @property {string} longDescription - A detailed "about us" section.
 * @property {string} category - Store category (e.g., "Zero-Waste Store").
 * @property {Image} [logo] - Optional store logo.
 * @property {Image[]} heroImages - Images for the hero section/gallery.
 * @property {string} addressLine1 - Street address.
 * @property {string} [addressLine2] - Optional address line 2.
 * @property {string} postalCode - Postal code.
 * @property {string} city - City.
 * @property {LatLngLiteral} coordinates - Geographical coordinates.
 * @property {string} [phone] - Phone number.
 * @property {string} [email] - Email address.
 * @property {string} [website] - Website URL.
 * @property {{ [platform: string]: string }} [socialMediaLinks] - Key-value pairs of social media platform and URL.
 * @property {OpeningHoursSpecification[]} openingHours - Array of opening hours specifications.
 * @property {AccessibilityFeature[]} accessibilityFeatures - List of accessibility features.
 * @property {ParkingOption[]} nearbyParking - Information about nearby parking.
 * @property {PublicTransportStop[]} nearbyPublicTransport - Information about nearby public transport.
 * @property {string[]} paymentMethods - Accepted payment methods.
 * @property {string[]} tags - Relevant tags or keywords.
 */
export interface StoreDetails {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  logo?: Image;
  heroImages: Image[];
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  coordinates: LatLngLiteral;
  phone?: string;
  email?: string;
  website?: string;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    // add more as needed
  };
  openingHours: OpeningHoursSpecification[]; // Using schema-dts type
  accessibilityFeatures: AccessibilityFeature[];
  nearbyParking: ParkingOption[];
  nearbyPublicTransport: PublicTransportStop[];
  paymentMethods: string[]; // e.g., ["paymentCash", "paymentCreditCard"]
  tags: string[]; // e.g., ["organic", "regional", "fairTrade"]
}
