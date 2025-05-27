"use client";

import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ShoppingItemType } from "@/types/explore"; // Will generalize later
import MapPopupCard from "./MapPopupCard";
import { MapPinIcon } from "lucide-react"; // Using Lucide for a consistent marker icon

/**
 * @file MapView.tsx
 * @description Component to display items on an interactive map.
 */

/**
 * Props for the MapView component.
 * @interface MapViewProps
 * @property {ShoppingItemType[]} items - The items to display on the map.
 */
interface MapViewProps {
  items: ShoppingItemType[]; // Generalize later to (ShoppingItemType | EventType | etc.)[]
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGZ6dG9iaWFzIiwiYSI6ImNsb3VhMmFubTBoeDQybHMxaDJyZ25wdTMifQ.F4eCYq5cTKmqOVU_02i0GQ';

// Saarbrücken Coordinates
const SAARBRUECKEN_LATITUDE = 49.2402;
const SAARBRUECKEN_LONGITUDE = 6.9969;

/**
 * Renders an interactive map view with markers for each item.
 *
 * @param {MapViewProps} props - The props for the component.
 * @returns {ReactElement} The rendered map view.
 */
export default function MapView({ items }: MapViewProps): ReactElement {
  const [selectedItem, setSelectedItem] = useState<ShoppingItemType | null>(null);
  const [viewport, setViewport] = useState({
    latitude: SAARBRUECKEN_LATITUDE,
    longitude: SAARBRUECKEN_LONGITUDE,
    zoom: 12.5,
    pitch: 45,
    bearing: 0,
  });

  useEffect(() => {
    // If there are items, and no item is selected, or selected item is not in new items list,
    // you might want to adjust the viewport to fit markers, or select a default item.
    // For now, we just center on Saarbrücken initially.
    // A more advanced implementation could use library like '@mapbox/geo-viewport' or 'fit-bounds' from react-map-gl
    // to dynamically adjust the viewport to show all markers.
  }, [items]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-destructive-foreground">
          Mapbox token is not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
        </p>
      </div>
    );
  }
  
  // Filter out items that don't have coordinates
  const itemsWithCoords = items.filter(item => item.coordinates && typeof item.coordinates.lat === 'number' && typeof item.coordinates.lng === 'number');

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg relative">
      <Map
        {...viewport}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12" // Standard street map style
        // mapStyle="mapbox://styles/mapbox/dark-v11" // Alternative: Dark mode style
        // mapStyle="mapbox://styles/mapbox/navigation-day-v1" // Navigation focused style
        style={{ width: '100%', height: '100%' }}
        onMove={evt => setViewport(evt.viewState)}
        // onClick={() => setSelectedItem(null)} // Optional: close popup on map click
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        
        {itemsWithCoords.map((item) => (
          <Marker
            key={item.id}
            latitude={item.coordinates!.lat}
            longitude={item.coordinates!.lng}
            anchor="bottom" // Replaces offsetLeft and offsetTop for correct pin positioning
          >
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent map click from closing popup immediately
                setSelectedItem(item);
              }}
              className="cursor-pointer p-0 bg-transparent border-none"
              aria-label={`View details for ${item.nameKey}`}
            >
              <MapPinIcon className="h-6 w-6 text-primary hover:text-primary/80 transition-colors" />
            </button>
          </Marker>
        ))}

        {selectedItem && selectedItem.coordinates && (
          <Popup
            latitude={selectedItem.coordinates.lat}
            longitude={selectedItem.coordinates.lng}
            onClose={() => setSelectedItem(null)}
            closeButton={true}
            closeOnClick={false} // Important: map click handled separately or disabled for popup
            anchor="bottom" // Anchors the bottom of the popup to the marker point
            offset={15} // Offset from the marker icon
            className="mapboxgl-popup-content-custom z-50"
          >
            <MapPopupCard item={selectedItem} />
          </Popup>
        )}
      </Map>
      {/* Custom Mapbox CSS for popup styling (optional) */} 
      <style jsx global>{`
        .mapboxgl-popup-content-custom .mapboxgl-popup-content {
          padding: 0;
          background: transparent;
          box-shadow: none;
          border-radius: 8px; /* Match MapPopupCard border radius */
        }
        .mapboxgl-popup-content-custom .mapboxgl-popup-close-button {
          color: hsl(var(--foreground));
          background-color: hsla(var(--background), 0.7);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 18px;
          line-height: 24px;
          text-align: center;
          margin: 5px;
          backdrop-filter: blur(4px);
        }
        .mapboxgl-popup-content-custom .mapboxgl-popup-close-button:hover {
          background-color: hsla(var(--muted), 0.8);
        }
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: hsl(var(--background)); /* Match popup background */
        }
        .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
          border-bottom-color: hsl(var(--background));
        }
        .mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
          border-right-color: hsl(var(--background));
        }
        .mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
          border-left-color: hsl(var(--background));
        }
      `}</style>
    </div>
  );
} 