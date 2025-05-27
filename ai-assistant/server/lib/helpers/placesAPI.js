import Shop from '../../models/shop.js';
import Gastronomy from '../../models/gastronomy.js';
import Sightseeing from '../../models/sightseeing.js';
import Parking from '../../models/parking.js';

const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_RADIUS_METERS = 50000; // 50km

/**
 * Helper function to build a MongoDB query for common search options.
 * @param {object} options - The search options.
 * @param {string} [options.name] - Name to search for (case-insensitive, partial match).
 * @param {string | string[]} [options.categories] - Categories to filter by (matches if any category in the list is present).
 * @param {number} [options.latitude] - Latitude for location-based search.
 * @param {number} [options.longitude] - Longitude for location-based search.
 * @param {number} [options.radius=1000] - Radius in meters for location-based search (max 50000m).
 * @param {string[]} [options.ids] - Array of specific document IDs to fetch.
 * @returns {object} The MongoDB query object.
 */
function buildCommonQuery(options) {
  const query = {};
  if (options.ids && options.ids.length > 0) {
    query._id = { $in: options.ids };
    return query; // If IDs are provided, other filters are usually secondary
  }

  if (options.name) {
    query.name = { $regex: options.name, $options: 'i' };
  }
  if (options.categories) {
    const categoriesArray = Array.isArray(options.categories) ? options.categories : [options.categories];
    if (categoriesArray.length > 0) {
      query.categories = { $in: categoriesArray };
    }
  }

  if (options.latitude !== undefined && options.longitude !== undefined) {
    const radius = Math.min(options.radius || 1000, MAX_SEARCH_RADIUS_METERS);
    query.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [options.longitude, options.latitude],
        },
        $maxDistance: radius,
      },
    };
  }
  return query;
}

/**
 * @typedef {object} PlaceLocation
 * @property {'Point'} type - The GeoJSON type, always 'Point'.
 * @property {number[]} coordinates - Array containing [longitude, latitude].
 */

/**
 * @typedef {object} ShopDocument
 * @property {string} _id - The unique identifier for the shop.
 * @property {string} name - The name of the shop.
 * @property {string[]} [categories] - Categories the shop belongs to.
 * @property {string} [address] - The address of the shop.
 * @property {string} [phone] - The phone number of the shop.
 * @property {object} [openingHours] - Object describing opening hours.
 * @property {string} [website] - The shop's website.
 * @property {string} [description] - A description of the shop.
 * @property {string[]} [imageUrls] - URLs of images for the shop.
 * @property {PlaceLocation} location - The geographical location of the shop.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

/**
 * Finds shops based on specified criteria.
 * @param {object} options - The search options.
 * @param {string} [options.name] - Name to search for (case-insensitive, partial match).
 * @param {string | string[]} [options.categories] - Categories to filter by.
 * @param {number} [options.latitude] - Latitude for location-based search.
 * @param {number} [options.longitude] - Longitude for location-based search.
 * @param {number} [options.radius=1000] - Radius in meters for location-based search.
 * @param {string[]} [options.ids] - Array of specific shop IDs to fetch.
 * @param {number} [options.limit=20] - Maximum number of results to return.
 * @returns {Promise<ShopDocument[]>} A promise that resolves to an array of shop documents.
 * @example
 * // Find shops named "Kaffeebohne" within 5km of a location
 * findShops({ name: "Kaffeebohne", latitude: 49.234, longitude: 6.994, radius: 5000 });
 * // Find shops by category "Lebensmittel"
 * findShops({ categories: "Lebensmittel" });
 */
export async function findShops(options = {}) {
  const query = buildCommonQuery(options);
  const limit = options.limit || DEFAULT_SEARCH_LIMIT;
  return Shop.find(query).limit(limit).lean().exec();
}

/**
 * @typedef {object} GastronomyContactDetails
 * @property {string} [phone] - Phone number.
 */

/**
 * @typedef {object} GastronomyDocument
 * @property {string} _id - The unique identifier for the gastronomy spot.
 * @property {string} name - The name of the spot.
 * @property {string[]} [categories] - Categories (e.g., "Restaurant", "Bar").
 * @property {string} [address] - Address.
 * @property {GastronomyContactDetails} [contactDetails] - Contact information.
 * @property {object} [openingHours] - Opening hours.
 * @property {string} [website] - Website URL.
 * @property {string} [description] - Description.
 * @property {string[]} [imageUrls] - Image URLs.
 * @property {string[]} [diets] - Supported diets (e.g., "Vegan", "Glutenfrei").
 * @property {string[]} [cuisines] - Types of cuisine (e.g., "Französisch", "Saarländisch").
 * @property {string[]} [features] - Features (e.g., "Barrierefrei", "Hundefreundlich").
 * @property {string[]} [paymentMethods] - Accepted payment methods.
 * @property {PlaceLocation} location - Geographical location.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

/**
 * Finds gastronomy spots based on specified criteria.
 * @param {object} options - The search options.
 * @param {string} [options.name] - Name to search for.
 * @param {string | string[]} [options.categories] - Categories to filter by.
 * @param {number} [options.latitude] - Latitude for location search.
 * @param {number} [options.longitude] - Longitude for location search.
 * @param {number} [options.radius=1000] - Radius in meters for location search.
 * @param {string | string[]} [options.diets] - Filter by supported diets.
 * @param {string | string[]} [options.cuisines] - Filter by cuisine types.
 * @param {string | string[]} [options.features] - Filter by features.
 * @param {string[]} [options.ids] - Array of specific IDs to fetch.
 * @param {number} [options.limit=20] - Maximum number of results.
 * @returns {Promise<GastronomyDocument[]>} A promise that resolves to an array of gastronomy documents.
 * @example
 * // Find vegan restaurants near a location
 * findGastronomy({ diets: "Vegan", latitude: 49.23, longitude: 6.99, radius: 2000 });
 * // Find gastronomy spots with "Französisch" cuisine
 * findGastronomy({ cuisines: "Französisch" });
 */
export async function findGastronomy(options = {}) {
  const query = buildCommonQuery(options);
  const limit = options.limit || DEFAULT_SEARCH_LIMIT;

  if (options.diets) {
    const dietsArray = Array.isArray(options.diets) ? options.diets : [options.diets];
    if (dietsArray.length > 0) query.diets = { $in: dietsArray };
  }
  if (options.cuisines) {
    const cuisinesArray = Array.isArray(options.cuisines) ? options.cuisines : [options.cuisines];
    if (cuisinesArray.length > 0) query.cuisines = { $in: cuisinesArray };
  }
  if (options.features) {
    const featuresArray = Array.isArray(options.features) ? options.features : [options.features];
    if (featuresArray.length > 0) query.features = { $in: featuresArray };
  }

  return Gastronomy.find(query).limit(limit).lean().exec();
}

/**
 * @typedef {object} SightseeingContactDetails
 * @property {string} [phone] - Phone number.
 * @property {string} [email] - Email address.
 * @property {boolean} [webContactForm] - Indicates if a web contact form is available.
 */

/**
 * @typedef {object} SightseeingDocument
 * @property {string} _id - The unique identifier for the sightseeing spot.
 * @property {string} name - The name of the spot.
 * @property {string[]} [categories] - Categories (e.g., "Historisches Gebäude", "Museum").
 * @property {SightseeingContactDetails} [contactDetails] - Contact information.
 * @property {string} [address] - Address.
 * @property {object} [openingHours] - Opening hours.
 * @property {string[]} [websites] - Website URLs.
 * @property {string} [description] - Description.
 * @property {string[]} [imageUrls] - Image URLs.
 * @property {PlaceLocation} location - Geographical location.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

/**
 * Finds sightseeing spots based on specified criteria.
 * @param {object} options - The search options.
 * @param {string} [options.name] - Name to search for.
 * @param {string | string[]} [options.categories] - Categories to filter by.
 * @param {number} [options.latitude] - Latitude for location search.
 * @param {number} [options.longitude] - Longitude for location search.
 * @param {number} [options.radius=1000] - Radius in meters for location search.
 * @param {string[]} [options.ids] - Array of specific IDs to fetch.
 * @param {number} [options.limit=20] - Maximum number of results.
 * @returns {Promise<SightseeingDocument[]>} A promise that resolves to an array of sightseeing documents.
 * @example
 * // Find museums near a location
 * findSightseeing({ categories: "Museum", latitude: 49.23, longitude: 6.99, radius: 3000 });
 */
export async function findSightseeing(options = {}) {
  const query = buildCommonQuery(options);
  const limit = options.limit || DEFAULT_SEARCH_LIMIT;
  return Sightseeing.find(query).limit(limit).lean().exec();
}

/**
 * @typedef {object} ParkingDocument
 * @property {string} _id - The unique identifier for the parking spot.
 * @property {string} name - The name of the parking spot.
 * @property {number} [capacity] - Parking capacity.
 * @property {string} [address] - Address.
 * @property {object} [openingHours] - Opening hours (can be null).
 * @property {string} [email] - Contact email.
 * @property {string} [website] - Website URL.
 * @property {string[]} [imageUrls] - Image URLs.
 * @property {PlaceLocation} location - Geographical location.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

/**
 * Finds parking lots based on specified criteria.
 * @param {object} options - The search options.
 * @param {string} [options.name] - Name to search for.
 * @param {number} [options.latitude] - Latitude for location search.
 * @param {number} [options.longitude] - Longitude for location search.
 * @param {number} [options.radius=1000] - Radius in meters for location search.
 * @param {number} [options.minCapacity] - Minimum parking capacity.
 * @param {string[]} [options.ids] - Array of specific IDs to fetch.
 * @param {number} [options.limit=20] - Maximum number of results.
 * @returns {Promise<ParkingDocument[]>} A promise that resolves to an array of parking documents.
 * @example
 * // Find parking lots with at least 50 spaces near a location
 * findParking({ minCapacity: 50, latitude: 49.23, longitude: 6.99, radius: 500 });
 */
export async function findParking(options = {}) {
  const query = buildCommonQuery(options);
  const limit = options.limit || DEFAULT_SEARCH_LIMIT;

  if (options.minCapacity !== undefined) {
    query.capacity = { $gte: options.minCapacity };
  }

  return Parking.find(query).limit(limit).lean().exec();
}

/**
 * Finds the closest parking spots to a given location.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @param {object} [options] - Additional options.
 * @param {number} [options.maxDistance=5000] - Maximum distance in meters to search for parking (default 5km).
 * @param {number} [options.limit=5] - Maximum number of parking spots to return (default 5).
 * @param {number} [options.minCapacity] - Optional minimum capacity for parking spots.
 * @returns {Promise<ParkingDocument[]>} A promise that resolves to an array of parking documents, sorted by distance.
 * @example
 * // Find the 3 closest parking spots within 2km
 * findClosestParking(49.232270, 6.996690, { maxDistance: 2000, limit: 3 });
 */
export async function findClosestParking(latitude, longitude, options = {}) {
  if (latitude === undefined || longitude === undefined) {
    throw new Error('Latitude and longitude are required to find closest parking.');
  }

  const maxDistance = options.maxDistance || 5000;
  const limit = options.limit || 5;
  
  const query = {
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: Math.min(maxDistance, MAX_SEARCH_RADIUS_METERS),
      },
    },
  };

  if (options.minCapacity !== undefined) {
    query.capacity = { $gte: options.minCapacity };
  }

  return Parking.find(query).limit(limit).lean().exec();
}
