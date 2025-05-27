import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  findShopsByNames,
  findSightseeingByNames,
  findGastronomyByNames
} from "./findByNames.js";

// Import models directly
import Shop from "../../models/shop.js";
import Gastronomy from "../../models/gastronomy.js";
import Sightseeing from "../../models/sightseeing.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.error("GEMINI_API_KEY is not set in the environment variables. Please ensure it's available for the application to function.");
}

// Load all places directly from the database
const getAllPlaces = async () => {
  try {
    console.log("[handlePrompt] Loading places from database...");
    
    // Query all records from each model with all fields
    const shops = await Shop.find({}).lean();
    const gastronomy = await Gastronomy.find({}).lean();
    const sightseeing = await Sightseeing.find({}).lean();
    
    console.log(`[handlePrompt] Loaded ${shops.length} shops, ${gastronomy.length} gastronomy places, and ${sightseeing.length} sightseeing spots from database`);
    
    return {
      shops,
      gastronomy,
      sightseeing
    };
  } catch (error) {
    console.error("[handlePrompt] Error loading places from database:", error);
    return { shops: [], gastronomy: [], sightseeing: [] };
  }
};

// Define function declarations for Gemini
const placeFunctionDeclarations = [
  {
    name: "select_places",
    description: "Selects the most relevant places from Saarbrücken based on the user's request",
    parameters: {
      type: "object",
      properties: {
        shops: { 
          type: "array", 
          items: { type: "string" },
          description: "Array of shop names from the available places that match the user's request"
        },
        gastronomy: { 
          type: "array", 
          items: { type: "string" },
          description: "Array of restaurant/cafe names from the available places that match the user's request"
        },
        sightseeing: { 
          type: "array", 
          items: { type: "string" },
          description: "Array of sightseeing spot names from the available places that match the user's request"
        },
        explanation: { 
          type: "string", 
          description: "Brief explanation of why these places were selected based on the user's request"
        }
      },
      required: ["explanation"]
    }
  }
];

const markdownFunctionDeclarations = [
  {
    name: "generate_journey_description",
    description: "Generates a personalized Markdown journey description for the selected places",
    parameters: {
      type: "object",
      properties: {
        markdown: { 
          type: "string", 
          description: "A beautiful, engaging Markdown description of the journey with all the selected places"
        }
      },
      required: ["markdown"]
    }
  }
];

/**
 * Uses Gemini to select relevant places from the available options based on user request
 */
const selectPlacesWithAI = async (userPrompt, chatId, availablePlaces) => {
  if (!genAI) {
    console.error("[handlePrompt] Gemini AI not initialized due to missing API key.");
    return { 
      selectedPlaces: { shops: [], gastronomy: [], sightseeing: [], explanation: "Service unavailable" },
      textResponse: "I'm currently unable to process requests due to a configuration issue. Please contact support." 
    };
  }

  try {
    // Prepare place information for the AI
    const placeInfoForAI = {
      shops: availablePlaces.shops.map(shop => ({
        name: shop.name,
        categories: shop.categories || [],
        description: shop.description || "",
        diets: [], // Shops don't have diets
        cuisines: [], // Shops don't have cuisines
        features: [] // Shops don't have features
      })),
      gastronomy: availablePlaces.gastronomy.map(place => ({
        name: place.name,
        categories: place.categories || [],
        description: place.description || "",
        diets: place.diets || [],
        cuisines: place.cuisines || [],
        features: place.features || []
      })),
      sightseeing: availablePlaces.sightseeing.map(place => ({
        name: place.name,
        categories: place.categories || [],
        description: place.description || ""
      }))
    };

    // Format available places for the prompt
    const shopInfo = placeInfoForAI.shops.map(s => 
      `- ${s.name}: ${s.categories.join(", ")}${s.description ? ` (${s.description.substring(0, 100)}${s.description.length > 100 ? "..." : ""})` : ""}`
    ).join("\n");
    
    const gastronomyInfo = placeInfoForAI.gastronomy.map(g => 
      `- ${g.name}: ${g.categories.join(", ")}${g.cuisines.length > 0 ? ` [Cuisines: ${g.cuisines.join(", ")}]` : ""}${g.diets.length > 0 ? ` [Diets: ${g.diets.join(", ")}]` : ""}${g.description ? ` (${g.description.substring(0, 100)}${g.description.length > 100 ? "..." : ""})` : ""}`
    ).join("\n");
    
    const sightseeingInfo = placeInfoForAI.sightseeing.map(s => 
      `- ${s.name}: ${s.categories.join(", ")}${s.description ? ` (${s.description.substring(0, 100)}${s.description.length > 100 ? "..." : ""})` : ""}`
    ).join("\n");

    const placesContext = `
AVAILABLE PLACES IN SAARBRÜCKEN:

Shops:
${shopInfo.length ? shopInfo : "No shop data available"}

Gastronomy (Restaurants, Cafes, Bars):
${gastronomyInfo.length ? gastronomyInfo : "No gastronomy data available"}

Sightseeing Spots:
${sightseeingInfo.length ? sightseeingInfo : "No sightseeing data available"}
`;

    // Initialize Gemini model with tool definitions
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
# Saarbrücken Visit Planner (ChatID: ${chatId})

${placesContext}

## Your Task
You are an expert local guide for Saarbrücken. Your goal is to analyze the user's request and select the most relevant places from the available options above. Choose places that would create a cohesive, enjoyable visit experience.

## Selection Guidelines:
- Select 1-3 places of each type that best match the user's request
- If the user doesn't mention or need a specific type, don't select any places of that type
- Be specific and selective - don't just list everything
- Consider proximity and logical visit order when possible
- Select places that complement each other for a cohesive journey
- Pay attention to categories, diets, cuisines, and features to match specific user requirements
- Be particularly attentive to dietary needs (vegan, vegetarian, gluten-free, etc.)
- For gastronomy, match cuisine types to what the user is looking for
`,
      tools: [{ functionDeclarations: placeFunctionDeclarations }],
      toolConfig: { functionCallingConfig: { mode: "ANY" } },
    });

    // Configuration for generation
    const generationConfig = {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    };

    // Start chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    console.log(`[handlePrompt] Selecting places for chat ${chatId} using function calling: "${userPrompt}"`);
    
    // Send user prompt to model
    const result = await chatSession.sendMessage(userPrompt);
    
    // Process response
    let selectedPlaces = { shops: [], gastronomy: [], sightseeing: [], explanation: "" };
    let textResponse = "";
    
    // Extract function call and text responses
    if (result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.functionCall && part.functionCall.name === "select_places") {
            selectedPlaces = part.functionCall.args;
            console.log(`[handlePrompt] Function call result:`, JSON.stringify(selectedPlaces));
          } else if (part.text) {
            textResponse += part.text;
            console.log(`[handlePrompt] Text response: ${textResponse}`);
          }
        }
      }
    }
    
    return { selectedPlaces, textResponse };
  } catch (error) {
    console.error(`[handlePrompt] Error selecting places with AI for chat ${chatId}:`, error);
    return { 
      selectedPlaces: { shops: [], gastronomy: [], sightseeing: [], explanation: "Error processing request" },
      textResponse: "I encountered an issue processing your request. Please try again later."
    };
  }
};

/**
 * Uses Gemini to generate a beautiful Markdown journey description
 */
const generateJourneyMarkdown = async (userPrompt, placesData) => {
  if (!genAI) {
    return "I'm currently unable to process requests due to a configuration issue.";
  }

  try {
    // Format places for the prompt with all available metadata
    const placesForPrompt = [];
    
    placesData.shops.forEach(shop => {
      placesForPrompt.push({
        type: "shop",
        name: shop.name,
        address: shop.address || "",
        categories: shop.categories || [],
        description: shop.description || "",
        website: shop.website || "",
        openingHours: shop.openingHours || {}
      });
    });
    
    placesData.gastronomy.forEach(place => {
      placesForPrompt.push({
        type: "restaurant/cafe",
        name: place.name,
        address: place.address || "",
        categories: place.categories || [],
        description: place.description || "",
        website: place.website || "",
        cuisines: place.cuisines || [],
        diets: place.diets || [], 
        features: place.features || [],
        openingHours: place.openingHours || {}
      });
    });
    
    placesData.sightseeing.forEach(sight => {
      placesForPrompt.push({
        type: "attraction",
        name: sight.name,
        address: sight.address || "",
        categories: sight.categories || [],
        description: sight.description || "",
        website: sight.websites && sight.websites.length > 0 ? sight.websites[0] : "",
        openingHours: sight.openingHours || {}
      });
    });

    // Create a JSON string of the places data
    const placesJson = JSON.stringify(placesForPrompt, null, 2);
    const explanationText = placesData.explanation || "These places were selected based on your request.";
    
    // Initialize Gemini model with tool definitions
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
# Markdown Journey Generator for Saarbrücken Visit

You are an expert tour guide for Saarbrücken creating personalized travel itineraries. Your task is to create an engaging, personalized Markdown response for a visitor.

## User Request:
"${userPrompt}"

## Selected Places:
${placesJson}

## Selection Explanation:
${explanationText}

## Guidelines:
1. Generate beautiful, structured Markdown that presents the places in a coherent, engaging narrative
2. Include an introduction that acknowledges the user's request and introduces the selected places
3. For each place, create a section with:
   - Heading with place name (use ### for each place)
   - Brief, engaging description that highlights its appeal
   - Practical details (address, website) formatted nicely
   - Opening Hours: Summarize the opening hours into a short, concise sentence (e.g., "Usually open 9 AM - 5 PM on weekdays and 10 AM - 2 PM on Saturdays."). Avoid using bullet points or raw data for opening hours.
   - Any special features or recommendations
   - For restaurants, highlight cuisines and dietary options
   - For attractions, mention key aspects from categories
   - For shops, highlight what makes them special
4. Suggest a logical order to visit the places based on location and type
5. Include a friendly conclusion
6. Use Markdown formatting effectively (headers, emphasis, lists)
7. Keep the tone conversational, enthusiastic and helpful
8. Include the explanation of why these places were selected, woven naturally into the narrative
`,
      tools: [{ functionDeclarations: markdownFunctionDeclarations }],
      toolConfig: { functionCallingConfig: { mode: "ANY" } },
    });

    // Configuration for generation
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 4096,
    };

    console.log(`[handlePrompt] Generating journey markdown with function calling`);
    
    // Generate content
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Generate a personalized journey description" }] }],
      generationConfig
    });

    // Extract function call result
    let markdown = "";
    
    if (response.response.candidates && response.response.candidates.length > 0) {
      const candidate = response.response.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.functionCall && part.functionCall.name === "generate_journey_description") {
            markdown = part.functionCall.args.markdown;
            console.log(`[handlePrompt] Generated markdown function response (first 150 chars): ${markdown.substring(0, 150)}...`);
          } else if (part.text) {
            // Fallback to text response if function call fails
            markdown = part.text;
            console.log(`[handlePrompt] Generated markdown text response (first 150 chars): ${markdown.substring(0, 150)}...`);
          }
        }
      }
    }

    return markdown || "I encountered an issue creating your personalized itinerary.";
  } catch (error) {
    console.error("[handlePrompt] Error generating journey markdown:", error);
    return "I encountered an issue creating your personalized itinerary. Please try again.";
  }
};

/**
 * Formats places data for map display
 */
const formatPlacesForMap = (placesData) => {
  const allPlacesForMap = [];
  
  // Format shops
  placesData.shops.forEach(place => {
    const mapPlace = { 
      ...place, 
      placeType: 'shop',
      sourceTool: 'find_shops'
    };
    
    if (place.location && place.location.coordinates && place.location.coordinates.length === 2) {
      mapPlace.coordinates = {
        latitude: place.location.coordinates[1],
        longitude: place.location.coordinates[0]
      };
      delete mapPlace.location; // Clean up original GeoJSON structure
    }
    
    allPlacesForMap.push(mapPlace);
  });
  
  // Format gastronomy places
  placesData.gastronomy.forEach(place => {
    const mapPlace = { 
      ...place, 
      placeType: 'gastronomy',
      sourceTool: 'find_gastronomy'
    };
    
    if (place.location && place.location.coordinates && place.location.coordinates.length === 2) {
      mapPlace.coordinates = {
        latitude: place.location.coordinates[1],
        longitude: place.location.coordinates[0]
      };
      delete mapPlace.location;
    }
    
    allPlacesForMap.push(mapPlace);
  });
  
  // Format sightseeing places
  placesData.sightseeing.forEach(place => {
    const mapPlace = { 
      ...place, 
      placeType: 'sightseeing',
      sourceTool: 'find_sightseeing'
    };
    
    if (place.location && place.location.coordinates && place.location.coordinates.length === 2) {
      mapPlace.coordinates = {
        latitude: place.location.coordinates[1],
        longitude: place.location.coordinates[0]
      };
      delete mapPlace.location;
    }
    
    allPlacesForMap.push(mapPlace);
  });
  
  return allPlacesForMap;
};

export async function getPlaceSuggestionsAndParking(userPrompt, chatId) {
  console.log(`[handlePrompt] Starting suggestion process for chat ${chatId} with prompt: "${userPrompt}"`);
  
  if (!genAI) {
    return { 
      markdown: "I'm sorry, but I'm currently unable to process requests due to a configuration issue. Please ask the administrator to check the GEMINI_API_KEY.",
      placesForMap: [],
      rawResults: [],
      parkingSpot: null
    };
  }

  try {
    // Step 1: Get all available places directly from the database
    console.log(`[handlePrompt] Fetching all available places from database for chat ${chatId}`);
    const availablePlaces = await getAllPlaces();
    
    // Step 2: Use AI to select relevant places based on user prompt
    console.log(`[handlePrompt] Selecting places with AI for chat ${chatId}`);
    const { selectedPlaces, textResponse } = await selectPlacesWithAI(userPrompt, chatId, availablePlaces);

    console.log(`[handlePrompt] Selected places: ${JSON.stringify(selectedPlaces)}`);

    // Step 3: Fetch detailed information for selected places (filtering from all places)
    console.log(`[handlePrompt] Finding selected places in database: shops=${selectedPlaces.shops?.length || 0}, gastronomy=${selectedPlaces.gastronomy?.length || 0}, sightseeing=${selectedPlaces.sightseeing?.length || 0}`);
    
    const detailedPlaces = {
      shops: (selectedPlaces.shops && selectedPlaces.shops.length > 0) ? availablePlaces.shops.filter(shop => 
        selectedPlaces.shops.includes(shop.name)
      ) : [],
      
      gastronomy: (selectedPlaces.gastronomy && selectedPlaces.gastronomy.length > 0) ? availablePlaces.gastronomy.filter(place => 
        selectedPlaces.gastronomy.includes(place.name)
      ) : [],
      
      sightseeing: (selectedPlaces.sightseeing && selectedPlaces.sightseeing.length > 0) ? availablePlaces.sightseeing.filter(place => 
        selectedPlaces.sightseeing.includes(place.name)
      ) : [],
      
      explanation: selectedPlaces.explanation
    };
    
    // Step 4: Generate AI-powered Markdown journey description
    console.log(`[handlePrompt] Generating AI-powered journey markdown for chat ${chatId}`);
    const markdown = await generateJourneyMarkdown(userPrompt, detailedPlaces);
    
    // Step 5: Format places for map display
    const placesForMap = formatPlacesForMap(detailedPlaces);
    
    console.log(`[handlePrompt] Process completed for chat ${chatId}: found ${placesForMap.length} places to display`);
    
    // Return the results in the format expected by ChatHandler.js
    return {
      markdown,
      placesForMap,
      rawResults: detailedPlaces,
      parkingSpot: null // This can be enhanced later if needed
    };
  } catch (error) {
    console.error(`[handlePrompt] Error in getPlaceSuggestionsAndParking for chat ${chatId}:`, error);
    return {
      markdown: "I encountered an issue processing your request. Please try again.",
      placesForMap: [],
      rawResults: [],
      parkingSpot: null
    };
  }
}
