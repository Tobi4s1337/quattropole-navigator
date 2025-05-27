# Hackathon Project Plan: City Explorer & AI Copilot

## 1. Concept

A web application enabling users to discover and explore various points of interest within a city, including shops, restaurants, sights, parking, and public transport. Key features include:

*   **Categorization:** Items organized by type (Store, Gastronomy, Sightseeing, Parking, Transport) with potentially multiple levels of sub-categories (e.g., Gastronomy -> Restaurant -> Italian).
*   **Detailed Information:** Each item includes relevant details like name, description, address, opening hours, contact info, specific attributes (cuisine, parking fees, payment options, accessibility features like toilets/wifi, delivery service), and city district ('Viertel').
*   **Map Visualization:** Interactive map (Mapbox) displaying all items as markers.
*   **Proximity Search:** Ability to find items "close by" a given location (user's current location or a searched point) or within the current map view.
*   **Filtering:** Comprehensive filtering options based on category, sub-category, tags, opening times, location, etc.
*   **Admin Interface:** A dedicated section for managing (CRUD operations) all data points.
*   **Future AI Copilot:** An AI assistant (Phase 2) to help users plan their day or find specific recommendations using natural language queries, leveraging the structured data via Retrieval Augmented Generation (RAG).

## 2. Technology Stack

*   **Backend:**
    *   **Runtime:** Node.js
    *   **Framework:** Express.js
    *   **Database:** MongoDB (for primary structured data)
    *   **Vector Database:** Qdrant (for semantic search and RAG)
    *   **AI/LLM:** Google Gemini (for Phase 2 Copilot)
*   **Frontend:**
    *   **Framework:** Next.js
    *   **Styling:** Tailwind CSS
    *   **UI Components:** shadcn/ui
    *   **Animation:** tailwindcss-animate
    *   **Icons:** lucide-react
    *   **Map:** Mapbox GL JS (potentially with `react-map-gl` wrapper)
    *   **AI UI (Phase 2):** @assistant-ui/react

## 3. Data Models (MongoDB Schemas)

We'll use a base schema and extend it for specific types. GeoJSON `Point` will be used for location.

**Base Item Schema:**

```json
{
  "_id": "ObjectId",
  "type": "String", // 'store', 'restaurant', 'sight', 'parking', 'transport'
  "name": "String",
  "description": "String",
  "location": {
    "type": "Point",
    "coordinates": [Number, Number] // [longitude, latitude]
  },
  "address": {
    "street": "String",
    "zipCode": "String",
    "city": "String",
    "district": "String" // Viertel
  },
  "category": "String", // Main category (e.g., 'Fashion', 'Italian', 'Museum')
  "subCategory": "String", // Optional sub-category (e.g., 'Shoes', 'Pizzeria', 'Art Museum')
  "tags": ["String"], // e.g., ['free_wifi', 'toilets', 'delivery_service', 'accessible', 'outdoor_seating']
  "openingHours": [ // Array representing opening hours for different days/periods
    { "days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "open": "09:00", "close": "18:00" },
    { "days": ["Sat"], "open": "10:00", "close": "16:00" }
    // Special hours/closed days can be handled as needed
  ],
  "website": "String", // Optional URL
  "phone": "String", // Optional phone number
  "images": ["String"], // Array of image URLs
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**MongoDB Indexes:**

*   `location`: `2dsphere` index for geospatial queries.
*   `type`: Index for filtering by item type.
*   `category`, `subCategory`: Indexes for filtering.
*   `tags`: Index for filtering by tags.

**Type-Specific Fields:**

*   **Store:**
    *   `paymentOptions`: ["String"] // e.g., ['cash', 'visa', 'mastercard', 'amex', 'ec_card']
*   **Restaurant (Gastronomy):**
    *   `cuisine`: "String" // e.g., 'Italian', 'German', 'Vegan'
    *   `priceRange`: "String" // e.g., '$', '$$', '$$$'
    *   `deliveryService`: "Boolean"
    *   `menuUrl`: "String" // Optional URL to menu
    *   `paymentOptions`: ["String"]
*   **Sight:**
    *   `entryFee`: { "amount": Number, "currency": "String" } // Optional
    *   `historicalSignificance`: "String" // Optional brief text
*   **Parking:**
    *   `pricing`: { "rate": String, "details": String } // e.g., rate: "€2/hour", details: "First 30 mins free"
    *   `capacity`: Number // Optional
    *   `parkingType`: "String" // e.g., 'garage', 'street', 'lot'
    *   `heightRestriction`: Number // Optional, in meters
*   **TransportStop:**
    *   `lines`: ["String"] // e.g., ['U1', 'Bus 100', 'Tram M4']
    *   `transportType`: "String" // e.g., 'subway', 'bus', 'tram', 'train'

## 4. Vector Database (Qdrant)

*   **Purpose:** Enable semantic search ("coffee shop with cozy atmosphere") and provide context for the Phase 2 AI Copilot (RAG).
*   **Collection:** A single collection (e.g., `city_items`).
*   **Point Structure:**
    *   `id`: Matches the MongoDB `_id` (as string).
    *   `vector`: Embedding generated from combining fields like `name`, `description`, `category`, `subCategory`, `tags`, `cuisine`. We'll need an embedding model (e.g., from Gemini or a sentence-transformer).
    *   `payload`: Store filterable metadata directly in Qdrant for efficient pre-filtering during vector search.
        *   `type`: String
        *   `category`: String
        *   `subCategory`: String
        *   `tags`: List[String]
        *   `district`: String
        *   `geo`: GeoPoint (lat, lon) - *Qdrant supports geo-filtering*
        *   Potentially `isOpenNow` (needs careful handling/updates) or other highly relevant filters.

## 5. Backend API (Node.js/Express)

**Middleware:**

*   JSON body parsing (`express.json()`)
*   URL encoding parsing (`express.urlencoded()`)
*   CORS (`cors` package)
*   Error handling
*   Authentication middleware for `/api/admin/*` routes.

**API Routes:**

*   **Admin (Authentication Required):**
    *   `POST /api/admin/:type` - Create a new item (`type` = `stores`, `restaurants`, etc.)
        *   Request Body: JSON matching the corresponding schema.
        *   Response: Created item object / 201 Created.
        *   **Action:** Saves to MongoDB, generates embedding, saves to Qdrant.
    *   `GET /api/admin/:type` - List all items of a specific type.
        *   Response: Array of items / 200 OK.
    *   `GET /api/admin/:type/:id` - Get a single item by ID.
        *   Response: Item object / 200 OK or 404 Not Found.
    *   `PUT /api/admin/:type/:id` - Update an existing item.
        *   Request Body: JSON with fields to update.
        *   Response: Updated item object / 200 OK.
        *   **Action:** Updates MongoDB, re-generates embedding, updates Qdrant.
    *   `DELETE /api/admin/:type/:id` - Delete an item.
        *   Response: Success message / 200 OK or 204 No Content.
        *   **Action:** Deletes from MongoDB and Qdrant.

*   **Public API:**
    *   `GET /api/items` - Fetch items based on filters. This is the core endpoint for map/list view.
        *   **Query Parameters:**
            *   `types`: Comma-separated string (e.g., `restaurant,store`).
            *   `category`, `subCategory`: String.
            *   `tags`: Comma-separated string (match any).
            *   `paymentOptions`: Comma-separated string (match any).
            *   `cuisine`, `priceRange`: String (for restaurants).
            *   `isOpenNow`: Boolean (`true`/`false`). Requires logic to compare current time with `openingHours`.
            *   `nearLat`, `nearLng`: Number (latitude/longitude for center point).
            *   `radius`: Number (search radius in meters, requires `nearLat`/`nearLng`).
            *   `bbox`: String (`minLng,minLat,maxLng,maxLat`). For map bounds filtering.
            *   `q`: String (Text search query).
            *   `limit`: Number (default 20, max 100).
            *   `offset`: Number (default 0).
        *   **Logic:**
            1.  Parse query parameters.
            2.  If `q` is present:
                *   Generate embedding for `q`.
                *   Perform semantic search in Qdrant, applying any filterable payload criteria (type, category, tags, geo if possible) *before* the vector search for efficiency.
                *   Retrieve top N matching IDs.
                *   Fetch full details for these IDs from MongoDB.
            3.  If `q` is NOT present:
                *   Construct MongoDB query based on filters (`type`, `category`, `tags`, `paymentOptions`, etc.).
                *   Apply geospatial filter (`$nearSphere` if `nearLat`/`nearLng`/`radius` are present, or `$geoWithin` with `$box` if `bbox` is present).
                *   Apply `isOpenNow` filter if needed (requires date/time logic against `openingHours`).
                *   Execute MongoDB query with `limit` and `offset`.
            4.  Return results as JSON array / 200 OK.
    *   `GET /api/items/:id` - Fetch details for a single item by ID.
        *   Response: Item object / 200 OK or 404 Not Found.
    *   `GET /api/filters` - Fetch available filter options.
        *   **Purpose:** Populate dropdowns/checkboxes in the UI.
        *   **Response:** JSON object containing distinct values for `type`, `category`, `subCategory`, `tags`, `cuisine`, `paymentOptions`, `district` etc., aggregated from the database.
        *   ```json
            {
              "types": ["store", "restaurant", ...],
              "categories": {
                "store": ["Fashion", "Electronics", ...],
                "restaurant": ["Italian", "German", ...]
              },
              "tags": ["free_wifi", "toilets", ...],
              // ... other filter options
            }
            ```

*   **AI Copilot (Phase 2):**
    *   `POST /api/copilot/plan`
        *   Request Body: `{ "query": "Natural language request", "preferences": { ... } }`
        *   **Logic:**
            1.  Use Gemini to parse `query` and `preferences` into structured filters (location, categories, time, budget, keywords).
            2.  Embed keywords/query essence.
            3.  Query Qdrant using embeddings and structured filters (RAG step 1 - Retrieval).
            4.  Fetch details of retrieved items from MongoDB.
            5.  Construct a prompt for Gemini including the original request and the retrieved item data (RAG step 2 - Generation).
            6.  Return Gemini's generated plan.
        *   Response: `{ "plan": "Generated text plan with item suggestions..." }` / 200 OK.

## 6. Frontend (Next.js)

*   **Project Structure:** Use Next.js App Router (`app` directory).
*   **Pages/Routes:**
    *   `/app/page.tsx`: Main page (Map + List/Filter).
    *   `/app/item/[id]/page.tsx`: Item detail page.
    *   `/app/admin/layout.tsx`: Layout for admin section (includes auth check).
    *   `/app/admin/page.tsx`: Admin dashboard overview.
    *   `/app/admin/[type]/page.tsx`: List items for a type.
    *   `/app/admin/[type]/new/page.tsx`: Form to add new item.
    *   `/app/admin/[type]/[id]/edit/page.tsx`: Form to edit item.
    *   `/app/api/`: Backend API routes handled by Next.js (if colocating) OR separate Express server. (Decide on backend deployment strategy).
*   **Core Components:**
    *   `MapWrapper`: Loads Mapbox GL JS, handles map instance, markers, popups, events (move, zoom, click). Uses `react-map-gl` or direct Mapbox API.
    *   `FilterPanel`: Contains various inputs (selects, checkboxes, search bar) mapped to `api/items` query parameters. Manages filter state.
    *   `ItemList`: Displays a list of `ItemCard` components. Handles pagination or infinite scroll.
    *   `ItemCard`: Summary view of an item for the list.
    *   `ItemDetail`: Displays full details when an item is selected (could be a modal, sidebar, or dedicated page).
    *   `AdminAuth`: Component/HOC to protect admin routes.
    *   `AdminTable`: Reusable table component (using `shadcn/ui Table`) for displaying admin data.
    *   `ItemForm`: Reusable form (using `shadcn/ui Form`, `react-hook-form`, `zod`) for creating/editing items.
*   **State Management:**
    *   URL state for filters (sync filter panel state with URL query params).
    *   React Context or Zustand/Jotai for global state like map instance, currently selected item, fetched filter options.
    *   React Query (`@tanstack/react-query`) for data fetching, caching, and state management related to API calls.
*   **UI Implementation:**
    *   Build UI using `shadcn/ui` components.
    *   Use `lucide-react` for icons.
    *   Use `tailwindcss` for layout and custom styling.
    *   Use `tailwindcss-animate` for subtle animations.

## 7. Admin Interface

*   Built as part of the Next.js frontend under the `/admin` route.
*   Leverages the `AdminLayout`, `AdminTable`, and `ItemForm` components.
*   Requires a simple authentication mechanism (e.g., password protection via Next.js middleware, or a basic JWT login). For a hackathon, basic auth or a hardcoded secret might suffice initially.
*   Provides UI for performing CRUD operations via the `/api/admin/*` endpoints.

## 8. AI Copilot (Phase 2 Details)

*   Focus on the RAG pipeline described in the API section (`POST /api/copilot/plan`).
*   Requires setting up an embedding generation process (either via Gemini API or another model) during data ingestion/updates for Qdrant.
*   Prompt engineering will be crucial for Gemini to accurately interpret user requests and generate useful plans based *only* on the provided context from Qdrant/MongoDB.
*   Frontend integration using `@assistant-ui/react` to create a chat-like interface for the copilot.

## 9. Deployment Strategy (Initial Thoughts)

*   **Frontend:** Vercel (recommended for Next.js).
*   **Backend:**
    *   Option A: Vercel Serverless Functions (colocated with frontend). Good for simplicity.
    *   Option B: Separate Node/Express server deployed to Fly.io, Render, or similar PaaS. More flexible, better for potentially long-running AI tasks.
*   **MongoDB:** MongoDB Atlas (free tier available).
*   **Qdrant:** Qdrant Cloud (free tier available) or run via Docker on the backend host (if using Option B).

## 10. Hackathon Timeline & Priorities

*   **Goal:** Demonstrate core functionality: Map view, basic filtering, item details, data for 2-3 types.
*   **P0 (Must-Haves):**
    1.  Setup project structure (Next.js, Node/Express if separate).
    2.  Define core MongoDB schemas (Store, Restaurant).
    3.  Implement backend `/api/items` endpoint with basic type and bounding box (`bbox`) filtering.
    4.  Implement backend `/api/items/:id` endpoint.
    5.  Seed initial data for Stores/Restaurants.
    6.  Frontend: Basic Mapbox integration showing seeded markers.
    7.  Frontend: On marker click, show basic details (popup or sidebar).
    8.  Frontend: Map automatically refetches data when bounds change (`bbox` filter).
*   **P1 (Should-Haves):**
    1.  Add more data types (Sight, Parking). Seed data.
    2.  Implement more backend filters: `category`, `tags`, `near` (radius search).
    3.  Implement `/api/filters` endpoint.
    4.  Frontend: Implement `FilterPanel` using `/api/filters` data.
    5.  Frontend: Connect `FilterPanel` state to `/api/items` calls (update map/list).
    6.  Frontend: Implement basic `ItemList` view alongside the map.
    7.  Implement basic Admin UI (list + create/edit form for one type). Requires basic auth.
    8.  Integrate Qdrant: Add embedding generation on create/update. Implement basic text search (`q` parameter in `/api/items`).
*   **P2 (Nice-to-Haves):**
    1.  Implement `isOpenNow` filter (requires careful time/timezone handling).
    2.  Refine UI/UX polish.
    3.  Full Admin CRUD for all types.
    4.  User geolocation integration ("Find near me").
    5.  Basic AI Copilot prototype: `/api/copilot/plan` endpoint with simple RAG flow, basic chat UI.
# Hackathon Project Plan: City Explorer & AI Copilot

## 1. Concept

A web application enabling users to discover and explore various points of interest within a city, including shops, restaurants, sights, parking, and public transport. Key features include:

*   **Categorization:** Items organized by type (Store, Gastronomy, Sightseeing, Parking, Transport) with potentially multiple levels of sub-categories (e.g., Gastronomy -> Restaurant -> Italian).
*   **Detailed Information:** Each item includes relevant details like name, description, address, opening hours, contact info, specific attributes (cuisine, parking fees, payment options, accessibility features like toilets/wifi, delivery service), and city district ('Viertel').
*   **Map Visualization:** Interactive map (Mapbox) displaying all items as markers.
*   **Proximity Search:** Ability to find items "close by" a given location (user's current location or a searched point) or within the current map view.
*   **Filtering:** Comprehensive filtering options based on category, sub-category, tags, opening times, location, etc.
*   **Admin Interface:** A dedicated section for managing (CRUD operations) all data points.
*   **Future AI Copilot:** An AI assistant (Phase 2) to help users plan their day or find specific recommendations using natural language queries, leveraging the structured data via Retrieval Augmented Generation (RAG).

## 2. Technology Stack

*   **Backend:**
    *   **Runtime:** Node.js
    *   **Framework:** Express.js
    *   **Database:** MongoDB (for primary structured data)
    *   **Vector Database:** Qdrant (for semantic search and RAG)
    *   **AI/LLM:** Google Gemini (for Phase 2 Copilot)
*   **Frontend:**
    *   **Framework:** Next.js
    *   **Styling:** Tailwind CSS
    *   **UI Components:** shadcn/ui
    *   **Animation:** tailwindcss-animate
    *   **Icons:** lucide-react
    *   **Map:** Mapbox GL JS (potentially with `react-map-gl` wrapper)
    *   **AI UI (Phase 2):** @assistant-ui/react

## 3. Data Models (MongoDB Schemas)

We'll use a base schema and extend it for specific types. GeoJSON `Point` will be used for location.

**Base Item Schema:**

```json
{
  "_id": "ObjectId",
  "type": "String", // 'store', 'restaurant', 'sight', 'parking', 'transport'
  "name": "String",
  "description": "String",
  "location": {
    "type": "Point",
    "coordinates": [Number, Number] // [longitude, latitude]
  },
  "address": {
    "street": "String",
    "zipCode": "String",
    "city": "String",
    "district": "String" // Viertel
  },
  "category": "String", // Main category (e.g., 'Fashion', 'Italian', 'Museum')
  "subCategory": "String", // Optional sub-category (e.g., 'Shoes', 'Pizzeria', 'Art Museum')
  "tags": ["String"], // e.g., ['free_wifi', 'toilets', 'delivery_service', 'accessible', 'outdoor_seating']
  "openingHours": [ // Array representing opening hours for different days/periods
    { "days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "open": "09:00", "close": "18:00" },
    { "days": ["Sat"], "open": "10:00", "close": "16:00" }
    // Special hours/closed days can be handled as needed
  ],
  "website": "String", // Optional URL
  "phone": "String", // Optional phone number
  "images": ["String"], // Array of image URLs
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**MongoDB Indexes:**

*   `location`: `2dsphere` index for geospatial queries.
*   `type`: Index for filtering by item type.
*   `category`, `subCategory`: Indexes for filtering.
*   `tags`: Index for filtering by tags.

**Type-Specific Fields:**

*   **Store:**
    *   `paymentOptions`: ["String"] // e.g., ['cash', 'visa', 'mastercard', 'amex', 'ec_card']
*   **Restaurant (Gastronomy):**
    *   `cuisine`: "String" // e.g., 'Italian', 'German', 'Vegan'
    *   `priceRange`: "String" // e.g., '$', '$$', '$$$'
    *   `deliveryService`: "Boolean"
    *   `menuUrl`: "String" // Optional URL to menu
    *   `paymentOptions`: ["String"]
*   **Sight:**
    *   `entryFee`: { "amount": Number, "currency": "String" } // Optional
    *   `historicalSignificance`: "String" // Optional brief text
*   **Parking:**
    *   `pricing`: { "rate": String, "details": String } // e.g., rate: "€2/hour", details: "First 30 mins free"
    *   `capacity`: Number // Optional
    *   `parkingType`: "String" // e.g., 'garage', 'street', 'lot'
    *   `heightRestriction`: Number // Optional, in meters
*   **TransportStop:**
    *   `lines`: ["String"] // e.g., ['U1', 'Bus 100', 'Tram M4']
    *   `transportType`: "String" // e.g., 'subway', 'bus', 'tram', 'train'

## 4. Vector Database (Qdrant)

*   **Purpose:** Enable semantic search ("coffee shop with cozy atmosphere") and provide context for the Phase 2 AI Copilot (RAG).
*   **Collection:** A single collection (e.g., `city_items`).
*   **Point Structure:**
    *   `id`: Matches the MongoDB `_id` (as string).
    *   `vector`: Embedding generated from combining fields like `name`, `description`, `category`, `subCategory`, `tags`, `cuisine`. We'll need an embedding model (e.g., from Gemini or a sentence-transformer).
    *   `payload`: Store filterable metadata directly in Qdrant for efficient pre-filtering during vector search.
        *   `type`: String
        *   `category`: String
        *   `subCategory`: String
        *   `tags`: List[String]
        *   `district`: String
        *   `geo`: GeoPoint (lat, lon) - *Qdrant supports geo-filtering*
        *   Potentially `isOpenNow` (needs careful handling/updates) or other highly relevant filters.

## 5. Backend API (Node.js/Express)

**Middleware:**

*   JSON body parsing (`express.json()`)
*   URL encoding parsing (`express.urlencoded()`)
*   CORS (`cors` package)
*   Error handling
*   Authentication middleware for `/api/admin/*` routes.

**API Routes:**

*   **Admin (Authentication Required):**
    *   `POST /api/admin/:type` - Create a new item (`type` = `stores`, `restaurants`, etc.)
        *   Request Body: JSON matching the corresponding schema.
        *   Response: Created item object / 201 Created.
        *   **Action:** Saves to MongoDB, generates embedding, saves to Qdrant.
    *   `GET /api/admin/:type` - List all items of a specific type.
        *   Response: Array of items / 200 OK.
    *   `GET /api/admin/:type/:id` - Get a single item by ID.
        *   Response: Item object / 200 OK or 404 Not Found.
    *   `PUT /api/admin/:type/:id` - Update an existing item.
        *   Request Body: JSON with fields to update.
        *   Response: Updated item object / 200 OK.
        *   **Action:** Updates MongoDB, re-generates embedding, updates Qdrant.
    *   `DELETE /api/admin/:type/:id` - Delete an item.
        *   Response: Success message / 200 OK or 204 No Content.
        *   **Action:** Deletes from MongoDB and Qdrant.

*   **Public API:**
    *   `GET /api/items` - Fetch items based on filters. This is the core endpoint for map/list view.
        *   **Query Parameters:**
            *   `types`: Comma-separated string (e.g., `restaurant,store`).
            *   `category`, `subCategory`: String.
            *   `tags`: Comma-separated string (match any).
            *   `paymentOptions`: Comma-separated string (match any).
            *   `cuisine`, `priceRange`: String (for restaurants).
            *   `isOpenNow`: Boolean (`true`/`false`). Requires logic to compare current time with `openingHours`.
            *   `nearLat`, `nearLng`: Number (latitude/longitude for center point).
            *   `radius`: Number (search radius in meters, requires `nearLat`/`nearLng`).
            *   `bbox`: String (`minLng,minLat,maxLng,maxLat`). For map bounds filtering.
            *   `q`: String (Text search query).
            *   `limit`: Number (default 20, max 100).
            *   `offset`: Number (default 0).
        *   **Logic:**
            1.  Parse query parameters.
            2.  If `q` is present:
                *   Generate embedding for `q`.
                *   Perform semantic search in Qdrant, applying any filterable payload criteria (type, category, tags, geo if possible) *before* the vector search for efficiency.
                *   Retrieve top N matching IDs.
                *   Fetch full details for these IDs from MongoDB.
            3.  If `q` is NOT present:
                *   Construct MongoDB query based on filters (`type`, `category`, `tags`, `paymentOptions`, etc.).
                *   Apply geospatial filter (`$nearSphere` if `nearLat`/`nearLng`/`radius` are present, or `$geoWithin` with `$box` if `bbox` is present).
                *   Apply `isOpenNow` filter if needed (requires date/time logic against `openingHours`).
                *   Execute MongoDB query with `limit` and `offset`.
            4.  Return results as JSON array / 200 OK.
    *   `GET /api/items/:id` - Fetch details for a single item by ID.
        *   Response: Item object / 200 OK or 404 Not Found.
    *   `GET /api/filters` - Fetch available filter options.
        *   **Purpose:** Populate dropdowns/checkboxes in the UI.
        *   **Response:** JSON object containing distinct values for `type`, `category`, `subCategory`, `tags`, `cuisine`, `paymentOptions`, `district` etc., aggregated from the database.
        *   ```json
            {
              "types": ["store", "restaurant", ...],
              "categories": {
                "store": ["Fashion", "Electronics", ...],
                "restaurant": ["Italian", "German", ...]
              },
              "tags": ["free_wifi", "toilets", ...],
              // ... other filter options
            }
            ```

*   **AI Copilot (Phase 2):**
    *   `POST /api/copilot/plan`
        *   Request Body: `{ "query": "Natural language request", "preferences": { ... } }`
        *   **Logic:**
            1.  Use Gemini to parse `query` and `preferences` into structured filters (location, categories, time, budget, keywords).
            2.  Embed keywords/query essence.
            3.  Query Qdrant using embeddings and structured filters (RAG step 1 - Retrieval).
            4.  Fetch details of retrieved items from MongoDB.
            5.  Construct a prompt for Gemini including the original request and the retrieved item data (RAG step 2 - Generation).
            6.  Return Gemini's generated plan.
        *   Response: `{ "plan": "Generated text plan with item suggestions..." }` / 200 OK.

## 6. Frontend (Next.js)

*   **Project Structure:** Use Next.js App Router (`app` directory).
*   **Pages/Routes:**
    *   `/app/page.tsx`: Main page (Map + List/Filter).
    *   `/app/item/[id]/page.tsx`: Item detail page.
    *   `/app/admin/layout.tsx`: Layout for admin section (includes auth check).
    *   `/app/admin/page.tsx`: Admin dashboard overview.
    *   `/app/admin/[type]/page.tsx`: List items for a type.
    *   `/app/admin/[type]/new/page.tsx`: Form to add new item.
    *   `/app/admin/[type]/[id]/edit/page.tsx`: Form to edit item.
    *   `/app/api/`: Backend API routes handled by Next.js (if colocating) OR separate Express server. (Decide on backend deployment strategy).
*   **Core Components:**
    *   `MapWrapper`: Loads Mapbox GL JS, handles map instance, markers, popups, events (move, zoom, click). Uses `react-map-gl` or direct Mapbox API.
    *   `FilterPanel`: Contains various inputs (selects, checkboxes, search bar) mapped to `api/items` query parameters. Manages filter state.
    *   `ItemList`: Displays a list of `ItemCard` components. Handles pagination or infinite scroll.
    *   `ItemCard`: Summary view of an item for the list.
    *   `ItemDetail`: Displays full details when an item is selected (could be a modal, sidebar, or dedicated page).
    *   `AdminAuth`: Component/HOC to protect admin routes.
    *   `AdminTable`: Reusable table component (using `shadcn/ui Table`) for displaying admin data.
    *   `ItemForm`: Reusable form (using `shadcn/ui Form`, `react-hook-form`, `zod`) for creating/editing items.
*   **State Management:**
    *   URL state for filters (sync filter panel state with URL query params).
    *   React Context or Zustand/Jotai for global state like map instance, currently selected item, fetched filter options.
    *   React Query (`@tanstack/react-query`) for data fetching, caching, and state management related to API calls.
*   **UI Implementation:**
    *   Build UI using `shadcn/ui` components.
    *   Use `lucide-react` for icons.
    *   Use `tailwindcss` for layout and custom styling.
    *   Use `tailwindcss-animate` for subtle animations.

## 7. Admin Interface

*   Built as part of the Next.js frontend under the `/admin` route.
*   Leverages the `AdminLayout`, `AdminTable`, and `ItemForm` components.
*   Requires a simple authentication mechanism (e.g., password protection via Next.js middleware, or a basic JWT login). For a hackathon, basic auth or a hardcoded secret might suffice initially.
*   Provides UI for performing CRUD operations via the `/api/admin/*` endpoints.

## 8. AI Copilot (Phase 2 Details)

*   Focus on the RAG pipeline described in the API section (`POST /api/copilot/plan`).
*   Requires setting up an embedding generation process (either via Gemini API or another model) during data ingestion/updates for Qdrant.
*   Prompt engineering will be crucial for Gemini to accurately interpret user requests and generate useful plans based *only* on the provided context from Qdrant/MongoDB.
*   Frontend integration using `@assistant-ui/react` to create a chat-like interface for the copilot.

## 9. Deployment Strategy (Initial Thoughts)

*   **Frontend:** Vercel (recommended for Next.js).
*   **Backend:**
    *   Option A: Vercel Serverless Functions (colocated with frontend). Good for simplicity.
    *   Option B: Separate Node/Express server deployed to Fly.io, Render, or similar PaaS. More flexible, better for potentially long-running AI tasks.
*   **MongoDB:** MongoDB Atlas (free tier available).
*   **Qdrant:** Qdrant Cloud (free tier available) or run via Docker on the backend host (if using Option B).

## 10. Hackathon Timeline & Priorities

*   **Goal:** Demonstrate core functionality: Map view, basic filtering, item details, data for 2-3 types.
*   **P0 (Must-Haves):**
    1.  Setup project structure (Next.js, Node/Express if separate).
    2.  Define core MongoDB schemas (Store, Restaurant).
    3.  Implement backend `/api/items` endpoint with basic type and bounding box (`bbox`) filtering.
    4.  Implement backend `/api/items/:id` endpoint.
    5.  Seed initial data for Stores/Restaurants.
    6.  Frontend: Basic Mapbox integration showing seeded markers.
    7.  Frontend: On marker click, show basic details (popup or sidebar).
    8.  Frontend: Map automatically refetches data when bounds change (`bbox` filter).
*   **P1 (Should-Haves):**
    1.  Add more data types (Sight, Parking). Seed data.
    2.  Implement more backend filters: `category`, `tags`, `near` (radius search).
    3.  Implement `/api/filters` endpoint.
    4.  Frontend: Implement `FilterPanel` using `/api/filters` data.
    5.  Frontend: Connect `FilterPanel` state to `/api/items` calls (update map/list).
    6.  Frontend: Implement basic `ItemList` view alongside the map.
    7.  Implement basic Admin UI (list + create/edit form for one type). Requires basic auth.
    8.  Integrate Qdrant: Add embedding generation on create/update. Implement basic text search (`q` parameter in `/api/items`).
*   **P2 (Nice-to-Haves):**
    1.  Implement `isOpenNow` filter (requires careful time/timezone handling).
    2.  Refine UI/UX polish.
    3.  Full Admin CRUD for all types.
    4.  User geolocation integration ("Find near me").
    5.  Basic AI Copilot prototype: `/api/copilot/plan` endpoint with simple RAG flow, basic chat UI.
