import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Shop from '../models/shop.js'; // Adjust the path to your Shop model

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_assistant_chat';
const JSON_FILE_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), 'sb_shops.json'); // Assumes sb_shops.json is in the same directory

async function importShops() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for import...');

    // Read the JSON file
    const shopsData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
    console.log(`Found ${shopsData.length} shops in the JSON file.`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const shopJson of shopsData) {
      // Basic data validation/transformation
      if (!shopJson.name || !shopJson.location || typeof shopJson.location.latitude !== 'number' || typeof shopJson.location.longitude !== 'number') {
        console.warn(`Skipping shop due to missing name or invalid location data: ${shopJson.name || 'Unnamed Shop'}`);
        skippedCount++;
        continue;
      }

      const shopToSave = {
        name: shopJson.name,
        categories: shopJson.category || [], // Map category to categories
        address: shopJson.address,
        phone: shopJson.phone,
        openingHours: shopJson.opening_hours || {}, // Map opening_hours to openingHours
        website: shopJson.website,
        description: shopJson.description,
        imageUrls: shopJson.images || [], // Map images to imageUrls
        location: {
          type: 'Point',
          coordinates: [shopJson.location.longitude, shopJson.location.latitude], // Ensure correct order [longitude, latitude]
        },
      };

      try {
        // Optional: Check if shop already exists (e.g., by name and address) to avoid duplicates
        // const existingShop = await Shop.findOne({ name: shopToSave.name, address: shopToSave.address });
        // if (existingShop) {
        //   console.log(`Shop "${shopToSave.name}" already exists. Skipping.`);
        //   skippedCount++;
        //   continue;
        // }

        const shop = new Shop(shopToSave);
        await shop.save();
        importedCount++;
        // console.log(`Imported shop: ${shop.name}`);
      } catch (saveError) {
        console.error(`Error saving shop "${shopToSave.name}":`, saveError.message);
        skippedCount++;
      }
    }

    console.log('----------------------------------------');
    console.log('Shop import process completed.');
    console.log(`Successfully imported ${importedCount} shops.`);
    console.log(`Skipped ${skippedCount} shops (due to errors or duplicates).`);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error during the import process:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

// Run the import function
importShops();
