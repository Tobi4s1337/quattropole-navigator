export interface Place {
  name: string;
  categories: string[];
  address: string;
  phone: string;
  openingHours: Record<string, string>;
  website: string;
  description: string;
  imageUrls: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  // Optional fields that might come from MongoDB like _id
  _id?: string;
} 

export interface MapDetails {
  places?: Place[];
  route?: any; // For now, can be GeoJSON LineString or FeatureCollection features
  center?: { latitude: number; longitude: number };
  zoom?: number;
} 