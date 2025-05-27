/**
 * @file entities.ts
 * @description Defines common entity types for the QuattroPole Navigator application.
 */

/**
 * Represents a city with its associated information.
 * @interface City
 * @property {string} id - A unique identifier for the city (e.g., "luxembourg").
 * @property {string} nameKey - The translation key for the city's name (e.g., "Cities.luxembourg").
 * @property {string} descriptionKey - The translation key for the city's short description.
 * @property {string} color - Tailwind CSS class for the city's light theme background color (e.g., "bg-[#FFEEB6]").
 * @property {string} darkColor - Tailwind CSS class for the city's dark theme background color (e.g., "dark:bg-yellow-900").
 * @property {string} imageUrl - URL for the city's representative image.
 * @property {string} href - The navigation path for the city's page (e.g., "/explore/luxembourg").
 */
export interface City {
  id: string;
  nameKey: string;
  descriptionKey: string;
  color: string;
  darkColor: string;
  imageUrl: string;
  href: string;
}
