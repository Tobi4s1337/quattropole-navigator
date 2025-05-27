import fs from 'fs';
import path from 'path';

const JSON_FILE_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), 'sb_shops.json');

async function extractAndFormatCategories() {
  try {
    // Read the JSON file
    const shopsData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
    
    const allCategories = new Set();
    shopsData.forEach(shop => {
      if (shop.category && Array.isArray(shop.category)) {
        shop.category.forEach(cat => {
          if (typeof cat === 'string') {
            allCategories.add(cat.trim());
          }
        });
      }
    });

    const sortedCategories = Array.from(allCategories).sort();
    
    // Format for inclusion in the prompt
    // Option 1: Simple comma-separated list
    // const formattedCategories = sortedCategories.join(', ');
    // console.log('Comma-separated categories:\n', formattedCategories);

    // Option 2: Formatted as a list within the prompt text
    // This is generally more readable if the list is long.
    const promptFormattedCategories = sortedCategories.map(cat => `"${cat}"`).join(', ');
    console.log('\n// --- Begin Auto-Generated Categories for Prompt ---');
    console.log(`// Extracted from ${path.basename(JSON_FILE_PATH)} on ${new Date().toISOString()}`);
    console.log('// Example shop categories include (but are not limited to):');
    console.log(`const availableShopCategories = [${promptFormattedCategories}];`);
    console.log('// You can use these categories to guide the user or to be more precise in your function calls.');
    console.log('// --- End Auto-Generated Categories for Prompt ---');

    // Option 3: Just the raw array string for direct insertion
    // console.log('\nRaw array string:');
    // console.log(`[${promptFormattedCategories}]`);


  } catch (error) {
    console.error('Error extracting or formatting categories:', error);
  }
}

extractAndFormatCategories(); 