"use client";

import { Place } from "@/types";
import { useState, useMemo, useEffect, useRef } from "react";
// keep this as react-map-gl/mapbox! It is a new version, don't hallucinate the change!!! IMPORTANT KEEP IT
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, Source, Layer, MapRef, ViewStateChangeEvent, MapMouseEvent, LngLatBounds, MarkerEvent } from 'react-map-gl/mapbox';
import mapboxgl, { LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin as LucideMapPin, ExternalLink, Building, Phone, Clock, ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) => typeof window === 'undefined'
  ? Buffer.from(str).toString('base64')
  : window.btoa(str);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface CityDefinition {
  name: string;
  latitude: number;
  longitude: number;
  zoom: number;
  color: string;
  textColor?: string;
}

const CITIES: CityDefinition[] = [
  { name: "Saarbrücken", latitude: 49.2343, longitude: 6.9969, zoom: 12, color: "#C2C8E1", textColor: "#1f2937" },
  { name: "Trier", latitude: 49.7596, longitude: 6.6412, zoom: 12, color: "#EAEAEA", textColor: "#1f2937" },
  { name: "Metz", latitude: 49.1193, longitude: 6.1757, zoom: 12, color: "#BECFBD", textColor: "#1f2937" },
  { name: "Luxembourg", latitude: 49.8153, longitude: 6.1296, zoom: 11, color: "#FFEEB6", textColor: "#1f2937" },
];

// Define a more specific type for GeoJSON LineString geometry
interface LineStringGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

interface MapViewProps {
  places?: Place[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  route?: LineStringGeometry; // Use the specific LineString type
  selectedPlace?: Place | null;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

const DEFAULT_CITY = CITIES[0]; // Default to Saarbrücken
const SELECTED_PLACE_ZOOM = 15; // Higher zoom level for selected places

export default function MapView({ places = [], center, zoom, route, selectedPlace }: MapViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [selectedMarkerPlace, setSelectedMarkerPlace] = useState<Place | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityDefinition>(DEFAULT_CITY);
  const [popupImgError, setPopupImgError] = useState(false);
  
  // Calculate the initial view state. This will be used by the Map component for its first render.
  const calculatedInitialViewState: ViewState = useMemo(() => {
    const currentCenterLat = center?.latitude || selectedCity.latitude;
    const currentCenterLon = center?.longitude || selectedCity.longitude;
    const currentZoom = zoom || selectedCity.zoom;
    return { longitude: currentCenterLon, latitude: currentCenterLat, zoom: currentZoom, pitch: 45, bearing: 0 };
  }, [places, center, zoom, selectedCity]); // Recalculate if these change

  // viewState is what the map actually renders. It's updated by user interaction (onMove) or programmatically.
  const [viewState, setViewState] = useState<ViewState>(calculatedInitialViewState);

  // Effect to fly to a new city when selectedCity state changes (user clicks city button)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedCity.longitude, selectedCity.latitude],
        zoom: selectedCity.zoom,
        duration: 1500,
        pitch: 45,
        bearing: 0
      });
      // When user selects a city, update viewState directly to reflect this target
      // This might help prevent onMove from immediately overriding if flyTo is async
      setViewState({
        longitude: selectedCity.longitude,
        latitude: selectedCity.latitude,
        zoom: selectedCity.zoom,
        pitch: 45,
        bearing: 0
      });
    }
  }, [selectedCity]);

  // Effect to fly to a new center/zoom when props from parent (mapDetails) change
  useEffect(() => {
    if (mapRef.current && center && zoom) { 
        mapRef.current.flyTo({
          center: [center.longitude, center.latitude],
          zoom: zoom,
          pitch: viewState.pitch ?? 45, // Keep current pitch or default
          bearing: viewState.bearing ?? 0, // Keep current bearing or default
          duration: 1500 
        });
        // Also update viewState to reflect this new target from props
        setViewState(prev => ({
            ...prev, // keep pitch/bearing from user interaction if any
            longitude: center.longitude,
            latitude: center.latitude,
            zoom: zoom
        }));
    }
  // Depend on center and zoom props. viewState is not needed here as we use its parts for pitch/bearing.
  }, [center, zoom]); 

  // Effect to handle when selectedPlace is passed from parent (chat selection)
  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      setSelectedMarkerPlace(selectedPlace);
      setPopupImgError(false); // Reset image error state when a new place is selected
      
      // Only update if there's a meaningful change in position or zoom
      const currentLong = viewState.longitude;
      const currentLat = viewState.latitude;
      const targetLong = selectedPlace.coordinates.longitude;
      const targetLat = selectedPlace.coordinates.latitude;
      
      const isAlreadyCentered = 
        Math.abs(currentLong - targetLong) < 0.005 && 
        Math.abs(currentLat - targetLat) < 0.005 &&
        viewState.zoom >= (SELECTED_PLACE_ZOOM - 2);
      
      if (!isAlreadyCentered) {
        mapRef.current.flyTo({
          center: [selectedPlace.coordinates.longitude, selectedPlace.coordinates.latitude],
          zoom: SELECTED_PLACE_ZOOM,
          duration: 1200,
          pitch: 50, 
          bearing: 0,
        });
        
        // We need to update viewState here but carefully
        // We'll set a flag to avoid circular dependencies
        const newViewState = {
          longitude: selectedPlace.coordinates.longitude,
          latitude: selectedPlace.coordinates.latitude,
          zoom: SELECTED_PLACE_ZOOM,
          pitch: 50,
          bearing: 0
        };
        
        // Only update if there's an actual change to prevent loops
        if (
          newViewState.longitude !== viewState.longitude ||
          newViewState.latitude !== viewState.latitude ||
          newViewState.zoom !== viewState.zoom
        ) {
          setViewState(newViewState);
        }
      }
    } else if (!selectedPlace) {
        // If selectedPlace is nullified from parent, close the popup if it's showing that place
        // @ts-ignore - Ignore TypeScript error for _id access
        if (selectedMarkerPlace && selectedMarkerPlace._id === selectedPlace?._id) {
            setSelectedMarkerPlace(null);
        }
    }
  // Using refs for viewState to avoid dependency cycles
  }, [selectedPlace, SELECTED_PLACE_ZOOM]);

  // Add this effect to reset img error when marker is closed
  useEffect(() => {
    if (!selectedMarkerPlace) {
      setPopupImgError(false);
    }
  }, [selectedMarkerPlace]);

  // useEffect to fit bounds when new places or route arrive
  useEffect(() => {
    if (mapRef.current) {
      if (route && route.coordinates && route.coordinates.length > 0) {
        const routeCoords = route.coordinates as [number, number][];
        if (routeCoords.length === 0) return;
        
        // Don't update viewState directly here - just fit the bounds
        const bounds = routeCoords.reduce((currentBounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
          return currentBounds.extend(coord);
        }, new mapboxgl.LngLatBounds(routeCoords[0], routeCoords[0]));
        
        // Use fitBounds but don't update the viewState after
        mapRef.current.fitBounds(bounds, { 
          padding: 80, 
          maxZoom: 16, 
          duration: 1000 
        });
        
        // Important: we're NOT updating viewState here to break the cycle
      } else if (places && places.length > 0) {
        const validPlaces = places.filter(p => p && p.coordinates);
        if (validPlaces.length === 0) return;

        if (validPlaces.length === 1) {
          // Just fly to the location without updating viewState
          mapRef.current.flyTo({
            center: [validPlaces[0].coordinates.longitude, validPlaces[0].coordinates.latitude],
            zoom: 14,
            duration: 1000
          });
        } else {
          const placeCoords = validPlaces.map(p => [p.coordinates.longitude, p.coordinates.latitude] as [number, number]);
          const bounds = placeCoords.reduce((currentBounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
            return currentBounds.extend(coord);
          }, new mapboxgl.LngLatBounds(placeCoords[0], placeCoords[0]));
          
          // Use fitBounds but don't update the viewState after
          mapRef.current.fitBounds(bounds, { 
            padding: 80, 
            maxZoom: 16, 
            duration: 1000 
          });
        }
      }
    }
  // Add a reference to a stable ref object to break potential loops
  }, [route, places, mapRef.current ? null : mapRef.current]);

  const handleMove = (evt: ViewStateChangeEvent) => {
    // Only update viewState if it actually changed to prevent unnecessary renders
    const { longitude, latitude, zoom, pitch, bearing } = evt.viewState;
    const hasChanged = 
      longitude !== viewState.longitude || 
      latitude !== viewState.latitude || 
      zoom !== viewState.zoom || 
      pitch !== viewState.pitch || 
      bearing !== viewState.bearing;
      
    if (hasChanged) {
      setViewState(evt.viewState);
    }
  };

  const handleCityChange = (cityName: string) => {
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city); // This will trigger the useEffect for selectedCity
    }
  };

  const handleMarkerClick = (e: MarkerEvent<MouseEvent>, place: Place) => {
    if (e.originalEvent) e.originalEvent.stopPropagation();
    setSelectedMarkerPlace(place);
    setPopupImgError(false);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 border rounded-lg bg-destructive/10 text-destructive">
        <div>
          <h3 className="font-semibold">Mapbox Token Missing</h3>
          <p>Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.</p>
          <p className="text-xs mt-1">Install: <code>yarn add react-map-gl mapbox-gl</code> & import css.</p>
        </div>
      </div>
    );
  }

  const hasPopupImage = selectedMarkerPlace?.imageUrls && selectedMarkerPlace.imageUrls.length > 0;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="p-3 border-b bg-white dark:bg-gray-800 flex flex-wrap items-center justify-center gap-3 print:hidden shadow-md z-10">
        {CITIES.map(city => (
          <Button
            key={city.name}
            variant="outline"
            onClick={() => handleCityChange(city.name)}
            style={{
              backgroundColor: city.color,
              color: city.textColor || '#1f2937',
              borderColor: selectedCity.name === city.name ? '#000' : 'transparent',
              opacity: selectedCity.name === city.name ? 1 : 0.85,
              boxShadow: selectedCity.name === city.name ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none',
              transform: selectedCity.name === city.name ? 'scale(1.05)' : 'scale(1)',
            }}
            className={`transition-all duration-200 ease-in-out px-5 py-2 rounded-xl hover:shadow-md focus:ring-2 focus:ring-offset-2 hover:opacity-100
                       ${selectedCity.name === city.name ? 'font-medium' : 'border-2'}`}
          >
            {city.name}
          </Button>
        ))}
      </div>
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          initialViewState={calculatedInitialViewState} // Use for the very first render
          longitude={viewState.longitude} // Controlled props
          latitude={viewState.latitude}
          zoom={viewState.zoom}
          pitch={viewState.pitch}
          bearing={viewState.bearing}
          onMove={handleMove}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <GeolocateControl position="top-right" />
          <ScaleControl />

          {places && places.map((place) => (
            place && place.coordinates && (
              <Marker 
                key={place._id || place.name} 
                longitude={place.coordinates.longitude} 
                latitude={place.coordinates.latitude}
                onClick={(e: MarkerEvent<MouseEvent>) => handleMarkerClick(e, place)}
                // @ts-ignore - Ignore TypeScript error for _id access
                className={selectedPlace?._id === place._id ? 'marker-selected' : ''}
              >
                <LucideMapPin 
                  // @ts-ignore - Ignore TypeScript error for _id access
                  className={`w-7 h-7 cursor-pointer hover:scale-110 transition-transform drop-shadow-lg
                             ${selectedPlace?._id === place._id ? 
                               'text-destructive animate-bounce' : 'text-primary'}`} 
                />
              </Marker>
            )
          ))}

          {selectedMarkerPlace && (
            <Popup
              longitude={selectedMarkerPlace.coordinates.longitude}
              latitude={selectedMarkerPlace.coordinates.latitude}
              onClose={() => setSelectedMarkerPlace(null)}
              closeOnClick={false}
              anchor="bottom"
              className="mapboxgl-popup-content-custom z-20 shadow-xl !max-w-[340px]"
            >
              <Card className="w-full shadow-none border-none !p-0 bg-card text-card-foreground rounded-lg overflow-hidden">
                {hasPopupImage && !popupImgError && (
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    <Image 
                      src={selectedMarkerPlace.imageUrls[0]} 
                      alt={selectedMarkerPlace.name}
                      fill
                      className="object-cover"
                      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(340, 191))}`}
                      onError={() => setPopupImgError(true)}
                      priority
                    />
                  </AspectRatio>
                )}
                {hasPopupImage && popupImgError && (
                  <AspectRatio ratio={16 / 9} className="bg-muted flex items-center justify-center">
                     <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
                  </AspectRatio>
                )}

                <CardHeader className={`p-3 ${hasPopupImage ? 'pb-2' : 'pb-3'} border-b dark:border-gray-700/70`}>
                  <CardTitle className="text-base flex items-center gap-2 font-semibold">
                    <Building size={16} className="text-primary shrink-0 mt-px" />
                    {selectedMarkerPlace.name}
                  </CardTitle>
                  {selectedMarkerPlace.website && (
                      <a 
                        href={selectedMarkerPlace.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1.5 pl-0.5"
                        onClick={(e) => e.stopPropagation()} // Important if popup itself has map interactions
                      >
                          <ExternalLink size={12} /> Visit Website
                      </a>
                  )}
                </CardHeader>
                <CardContent className="p-3 text-sm space-y-1.5">
                  {selectedMarkerPlace.address && (
                      <div className="flex items-start gap-2">
                          <LucideMapPin size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                          <span>{selectedMarkerPlace.address}</span>
                      </div>
                  )}
                  {selectedMarkerPlace.phone && (
                      <div className="flex items-start gap-2">
                          <Phone size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                          <span>{selectedMarkerPlace.phone}</span>
                      </div>
                  )}
                  {selectedMarkerPlace.openingHours && Object.keys(selectedMarkerPlace.openingHours).length > 0 && (
                      <div className="flex items-start gap-2">
                          <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                          <span className="truncate">
                            {Object.entries(selectedMarkerPlace.openingHours).map(([day,hr]) => `${day.substring(0,3)}: ${hr}`).slice(0,1).join(", ") + 
                             (Object.keys(selectedMarkerPlace.openingHours).length > 1 ? "... (see details)" : "")}
                          </span>
                      </div>
                  )}
                </CardContent>
              </Card>
            </Popup>
          )}

          {/* Route Layer - Uncommented and adjusted */}
          {route && route.type === "LineString" && route.coordinates && route.coordinates.length > 0 && (
            <Source 
              id="route-source" 
              type="geojson" 
              data={{
                type: 'Feature',
                geometry: route, // route is now LineStringGeometry
                properties: {}
              }}
            >
              <Layer 
                id="route-layer" 
                type="line" 
                source="route-source" 
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#007cbf', 'line-width': 5, 'line-opacity': 0.75 }}
              />
            </Source>
          )}
        </Map>
      </div>
      <style jsx global>{`
        .mapboxgl-popup-content-custom .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          background-color: transparent;
        }
        .mapboxgl-popup-close-button {
          color: #4b5563;
          padding: 0.25rem;
          font-size: 1.125rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 9999px;
          margin: 0.375rem 0.375rem 0 0;
          line-height: 1;
          transition: background-color 0.2s;
        }
        .mapboxgl-popup-close-button:hover {
            background-color: rgba(243, 244, 246, 0.9);
            color: #1f2937;
        }
        .dark .mapboxgl-popup-close-button {
            background: rgba(55, 65, 81, 0.7);
            color: #d1d5db;
        }
        .dark .mapboxgl-popup-close-button:hover {
            background-color: rgba(75, 85, 99, 0.9);
            color: #f9fafb;
        }
        .marker-selected {
          z-index: 10;
        }
        
        @keyframes pulse-marker {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .marker-selected .marker-icon {
          animation: pulse-marker 1.5s infinite;
        }
      `}</style>
    </div>
  );
} 