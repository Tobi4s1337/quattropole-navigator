import Shop from '../../models/shop.js';
import Sightseeing from '../../models/sightseeing.js';
import Gastronomy from '../../models/gastronomy.js';

const findShopsByNames = async (names) => {
  try {
    const shops = await Shop.find({ name: { $in: names } });
    return shops;
  } catch (error) {
    console.error('Error finding shops by names:', error);
    throw error;
  }
};

const findSightseeingByNames = async (names) => {
  try {
    const sights = await Sightseeing.find({ name: { $in: names } });
    return sights;
  } catch (error) {
    console.error('Error finding sightseeing by names:', error);
    throw error;
  }
};

const findGastronomyByNames = async (names) => {
  try {
    const gastronomyItems = await Gastronomy.find({ name: { $in: names } });
    return gastronomyItems;
  } catch (error) {
    console.error('Error finding gastronomy by names:', error);
    throw error;
  }
};

export {
  findShopsByNames,
  findSightseeingByNames,
  findGastronomyByNames,
};
