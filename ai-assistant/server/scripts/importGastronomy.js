import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Gastronomy from '../models/gastronomy.js'; // Adjust the path to your Gastronomy model

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_assistant_chat';
const JSON_FILE_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), 'sb_gastro.json'); // Assumes sb_gastro.json is in the same directory

async function importGastronomy() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for gastronomy import...');

    // Drop existing indexes to avoid conflicts
    try {
      await Gastronomy.collection.dropIndexes();
      console.log('Dropped existing indexes');
    } catch (indexError) {
      console.warn('No indexes to drop or error dropping indexes:', indexError.message);
    }

    // Read the JSON file
    const gastronomyData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
    console.log(`Found ${gastronomyData.length} gastronomy items in the JSON file.`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const gastroJson of gastronomyData) {
      // Basic data validation/transformation
      if (!gastroJson.name) {
        console.warn(`Skipping gastronomy item due to missing name`);
        skippedCount++;
        continue;
      }

      const gastronomyToSave = {
        name: gastroJson.name,
        categories: gastroJson.categories || [],
        address: gastroJson.address,
        contactDetails: {
          phone: gastroJson.contact?.phone,
        },
        openingHours: gastroJson.opening_hours || {},
        website: gastroJson.website,
        description: gastroJson.description,
        imageUrls: gastroJson.images || [],
        diets: gastroJson.diets || [],
        cuisines: gastroJson.cuisines || [],
        features: gastroJson.features || [],
        paymentMethods: gastroJson.payment_methods || [],
      };

      // Only add location if valid coordinates exist
      if (gastroJson.location && 
          typeof gastroJson.location.latitude === 'number' && 
          typeof gastroJson.location.longitude === 'number' &&
          !isNaN(gastroJson.location.latitude) && 
          !isNaN(gastroJson.location.longitude)) {
        gastronomyToSave.location = {
          type: 'Point',
          coordinates: [gastroJson.location.longitude, gastroJson.location.latitude],
        };
      }

      try {
        const gastronomy = new Gastronomy(gastronomyToSave);
        await gastronomy.save();
        importedCount++;
        console.log(`Imported gastronomy item: ${gastronomy.name}`);
      } catch (saveError) {
        console.error(`Error saving gastronomy item "${gastronomyToSave.name}":`, saveError.message);
        skippedCount++;
      }
    }

    // Recreate necessary indexes after import
    try {
      await Gastronomy.collection.createIndex({ location: '2dsphere' });
      await Gastronomy.collection.createIndex({ 
        name: 'text', 
        description: 'text',
        categories: 'text',
        cuisines: 'text'
      });
      console.log('Recreated indexes successfully');
    } catch (indexError) {
      console.error('Error recreating indexes:', indexError.message);
    }

    console.log('----------------------------------------');
    console.log('Gastronomy import process completed.');
    console.log(`Successfully imported ${importedCount} gastronomy items.`);
    console.log(`Skipped ${skippedCount} gastronomy items (due to errors or duplicates).`);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error during the gastronomy import process:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected from gastronomy import.');
  }
}

// Run the import function
importGastronomy(); 