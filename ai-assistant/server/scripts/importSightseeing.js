import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Sightseeing from '../models/sightseeing.js'; // Adjust the path to your Sightseeing model

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_assistant_chat';
const JSON_FILE_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), 'sb_sights.json'); // Assumes sb_sights.json is in the same directory

async function importSightseeing() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for sightseeing import...');

    // Read the JSON file
    const sightseeingData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
    console.log(`Found ${sightseeingData.length} sightseeing spots in the JSON file.`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const sightJson of sightseeingData) {
      // Basic data validation/transformation
      if (!sightJson.name || !sightJson.location || typeof sightJson.location.latitude !== 'number' || typeof sightJson.location.longitude !== 'number') {
        // Handle cases where location might be null
        if (!sightJson.name || (!sightJson.location && (sightJson.location?.latitude !== undefined && sightJson.location?.longitude !== undefined))) {
            console.warn(`Skipping sightseeing spot due to missing name or invalid location data: ${sightJson.name || 'Unnamed Sightseeing Spot'}`);
            skippedCount++;
            continue;
        }
      }

      const sightseeingToSave = {
        name: sightJson.name,
        categories: sightJson.category || [], // category in JSON is an array
        address: sightJson.address,
        contactDetails: {
          phone: sightJson.contact?.phone,
          email: sightJson.contact?.email,
          webContactForm: sightJson.contact?.web_contact_form,
        },
        openingHours: sightJson.opening_hours || {},
        websites: sightJson.websites || [], // websites in JSON is an array
        description: sightJson.description,
        imageUrls: sightJson.images || [], // images in JSON is an array
        location: sightJson.location ? {
          type: 'Point',
          // Ensure correct order [longitude, latitude]
          coordinates: [sightJson.location.longitude, sightJson.location.latitude],
        } : undefined, // Handle null location gracefully
      };

      // Remove location if it's undefined (e.g. if coordinates were null)
      if (!sightseeingToSave.location?.coordinates?.[0] && !sightseeingToSave.location?.coordinates?.[1]) {
          delete sightseeingToSave.location;
      }

      // Additional check for required location if it was deleted
      if (!sightseeingToSave.location && (sightJson.location?.latitude !== null && sightJson.location?.longitude !== null)){
          console.warn(`Skipping sightseeing spot due to missing name or invalid location data after processing: ${sightJson.name || 'Unnamed Sightseeing Spot'}`);
          skippedCount++;
          continue;
      }
       if (!sightseeingToSave.location && (sightJson.location === null )){
        // It's okay to not have a location if the source is null
      } else if (!sightseeingToSave.location){
        console.warn(`Skipping sightseeing spot due to missing name or invalid location data after processing: ${sightJson.name || 'Unnamed Sightseeing Spot'}`);
        skippedCount++;
        continue;
      }


      try {
        // Optional: Check if sightseeing spot already exists (e.g., by name and address) to avoid duplicates
        // const existingSightseeing = await Sightseeing.findOne({ name: sightseeingToSave.name, address: sightseeingToSave.address });
        // if (existingSightseeing) {
        //   console.log(`Sightseeing spot "${sightseeingToSave.name}" already exists. Skipping.`);
        //   skippedCount++;
        //   continue;
        // }

        const sightseeing = new Sightseeing(sightseeingToSave);
        await sightseeing.save();
        importedCount++;
        // console.log(`Imported sightseeing spot: ${sightseeing.name}`);
      } catch (saveError) {
        console.error(`Error saving sightseeing spot "${sightseeingToSave.name}":`, saveError.message);
        // If error is due to location being required, and it was null in source, log differently or handle
        if (saveError.message.includes('location is required') && sightJson.location === null){
             console.warn(`Skipped sightseeing spot "${sightJson.name}" because location is null in source and required by schema.`);
        } else {
            console.error(`Error saving sightseeing spot "${sightseeingToSave.name}":`, saveError.message);
        }
        skippedCount++;
      }
    }

    console.log('----------------------------------------');
    console.log('Sightseeing import process completed.');
    console.log(`Successfully imported ${importedCount} sightseeing spots.`);
    console.log(`Skipped ${skippedCount} sightseeing spots (due to errors, duplicates, or missing required location).`);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error during the sightseeing import process:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected from sightseeing import.');
  }
}

// Run the import function
importSightseeing(); 