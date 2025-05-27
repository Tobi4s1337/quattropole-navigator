/**
 * @file explore.ts
 * @description Type definitions related to the city exploration features.
 */

/**
 * Represents the categories available for searching within a city.
 * @enum {string}
 */
export enum SearchCategory {
  Shopping = "shopping",
  Gastronomy = "gastronomy",
  Events = "events",
  Sightseeing = "sightseeing",
}

/**
 * Represents a filter option under a main search category.
 * @interface CategoryFilter
 * @property {string} id - Unique identifier for the filter.
 * @property {string} translationKey - Key for a localized display name.
 * @property {SearchCategory} parentCategory - The main category this filter belongs to.
 */
export interface CategoryFilter {
  id: string;
  translationKey: string;
  parentCategory: SearchCategory;
}

/**
 * Represents an event item.
 * @interface EventType
 * @property {string} id - Unique identifier for the event.
 * @property {string} nameKey - Translation key for the event\'s name.
 * @property {string} descriptionKey - Translation key for the event\'s description.
 * @property {string} dateStringKey - Translation key for a human-readable date/time (e.g., "Events.saarbruecken.event1.date").
 * @property {string} imageUrl - URL for the event\'s image.
 * @property {string} [link] - Optional link for more details about the event.
 * @property {string[]} [tagsKeys] - Optional array of translation keys for tags/categories related to the event.
 * @property {{ lat: number; lng: number }} [coordinates] - Optional coordinates for map view.
 */
export interface EventType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  dateStringKey: string;
  imageUrl: string;
  link?: string;
  tagsKeys?: string[];
  coordinates?: { lat: number; lng: number };
}

/**
 * Represents a sightseeing spot.
 * @interface SightseeingSpotType
 * @property {string} id - Unique identifier for the spot.
 * @property {string} nameKey - Translation key for the spot\'s name.
 * @property {string} descriptionKey - Translation key for the spot\'s description.
 * @property {string} imageUrl - URL for the spot\'s image.
 * @property {string} [addressKey] - Optional translation key for the spot\'s address.
 * @property {string} [link] - Optional link for more details.
 * @property {string[]} [categoryKeys] - Optional array of translation keys for categories (e.g., "museum", "historical").
 * @property {{ lat: number; lng: number }} [coordinates] - Optional coordinates for map view.
 */
export interface SightseeingSpotType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  imageUrl: string;
  addressKey?: string;
  link?: string;
  categoryKeys?: string[];
  coordinates?: { lat: number; lng: number };
}

/**
 * Represents the days of the week an item might be open or available.
 * @enum {string}
 */
export enum OpeningDays {
  Monday = "monday",
  Tuesday = "tuesday",
  Wednesday = "wednesday",
  Thursday = "thursday",
  Friday = "friday",
  Saturday = "saturday",
  Sunday = "sunday",
}

/**
 * Represents a shopping item (store, market, etc.).
 * @interface ShoppingItemType
 * @property {string} id - Unique identifier for the shopping item.
 * @property {string} nameKey - Translation key for the item\'s name.
 * @property {string} descriptionKey - Translation key for the item\'s description.
 * @property {string} imageUrl - URL for the item\'s image.
 * @property {string} addressKey - Translation key for the item\'s address.
 * @property {string} openingHoursKey - Translation key for general opening hours.
 * @property {string[]} typeKeys - Array of translation keys for shopping types (e.g., ["Filters.Shopping.fashion", "Filters.Shopping.books"]).
 * @property {string} [link] - Optional link to the shop\'s own page or detail page.
 * @property {string} [districtKey] - Optional translation key for the district (e.g., "Filters.Districts.villeHaute").
 * @property {OpeningDays[]} [openingDays] - Optional array of days the shop is open.
 * @property {string[]} [labels] - Optional array of translation keys for labels (e.g., ["Filters.Labels.madeInLuxembourg"]).
 * @property {string[]} [services] - Optional array of translation keys for services (e.g., ["Filters.Services.clickAndCollect"]).
 * @property {string[]} [paymentMethods] - Optional array of translation keys for payment methods (e.g., ["Filters.PaymentMethods.visa"]).
 * @property {{ lat: number; lng: number }} [coordinates] - Optional coordinates for map view.
 */
export interface ShoppingItemType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  imageUrl: string;
  addressKey: string;
  openingHoursKey: string;
  typeKeys: string[];
  link?: string;
  districtKey?: string;
  openingDays?: OpeningDays[];
  labels?: string[];
  services?: string[];
  paymentMethods?: string[];
  coordinates?: { lat: number; lng: number };
}

/**
 * Represents a gastronomy item (restaurant, cafe, bar, etc.).
 * @interface GastronomyItemType
 * @property {string} id - Unique identifier for the gastronomy item.
 * @property {string} nameKey - Translation key for the item\'s name.
 * @property {string} descriptionKey - Translation key for the item\'s description.
 * @property {string} imageUrl - URL for the item\'s image.
 * @property {string} [cuisineKey] - Optional translation key for the type of cuisine.
 * @property {string} [priceRange] - Optional price range (e.g., "$", "$$", "$$$").
 * @property {string} [addressKey] - Optional translation key for the item\'s address.
 * @property {string} [link] - Optional link for reservations or menu.
 * @property {boolean} [allowsReservations] - Optional flag indicating if reservations are allowed/recommended.
 * @property {{ lat: number; lng: number }} [coordinates] - Optional coordinates for map view.
 */
export interface GastronomyItemType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  imageUrl: string;
  cuisineKey?: string;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  addressKey?: string;
  link?: string;
  allowsReservations?: boolean;
  coordinates?: { lat: number; lng: number };
}

/**
 * Represents a generic filter option.
 * @interface FilterOption
 * @property {string} id - Unique identifier for the filter option (e.g., "fashion", "monday").
 * @property {string} translationKey - Translation key for the filter option\'s label.
 * @property {SearchCategory | string} parentCategory - The main category this filter belongs to (e.g., SearchCategory.Shopping, "OpeningDays").
 * @property {number} [count] - Optional count of items matching this filter.
 */
export interface FilterOption {
  id: string;
  translationKey: string;
  parentCategory: SearchCategory | string; // string for custom categories like "OpeningDays"
  count?: number;
}

/**
 * Defines the structure for a group of filters.
 * @interface FilterGroup
 * @property {string} id - Unique identifier for the filter group (e.g., "shopTypes", "services").
 * @property {string} translationKey - Translation key for the filter group\'s title (e.g., "Filters.shopTypesTitle").
 * @property {FilterOption[]} options - Array of filter options within this group.
 */
export interface FilterGroup {
  id: string;
  translationKey: string;
  options: FilterOption[];
}

/**
 * Represents all the data needed for a city\'s explore page and its listing pages.
 * @interface CityExploreData
 * @property {string} cityId - The unique identifier for the city (e.g., "saarbruecken").
 * @property {string} cityNameKey - Translation key for the city\'s name.
 * @property {string} heroBackgroundImageUrl - URL for the hero section\'s background image.
 * @property {string} [heroVideoUrl] - Optional video URL for hero section.
 * @property {string} [heroVideoPosterUrl] - Optional poster for hero video.
 * @property {SearchCategory[]} availableSearchCategories - List of main search categories available for this city.
 * @property {Record<SearchCategory, CategoryFilter[]>} searchCategoryFilters - Basic filters shown on the hero/explore page.
 * @property {EventType[]} events - List of events in the city.
 * @property {SightseeingSpotType[]} sights - List of sightseeing spots in the city.
 * @property {ShoppingItemType[]} shopping - Array of shopping items.
 * @property {GastronomyItemType[]} gastronomy - Array of gastronomy items.
 * @property {Record<SearchCategory, FilterGroup[]>} [listingPageFilters] - Detailed filters for listing pages (e.g., shopping, gastronomy).
 */
export interface CityExploreData {
  cityId: string;
  cityNameKey: string;
  heroBackgroundImageUrl: string;
  heroVideoUrl?: string;
  heroVideoPosterUrl?: string;
  availableSearchCategories: SearchCategory[];
  searchCategoryFilters: Record<SearchCategory, CategoryFilter[]>;
  events: EventType[];
  sights: SightseeingSpotType[];
  shopping: ShoppingItemType[];
  gastronomy: GastronomyItemType[];
  listingPageFilters?: Record<SearchCategory, FilterGroup[]>;
} 