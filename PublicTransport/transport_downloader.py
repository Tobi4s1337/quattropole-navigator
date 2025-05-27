import requests
import json
import os
from datetime import datetime
import time
import csv

class TransportDownloader:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.all_features = []
        
        # Trier Bounding Box (ungefähr)
        self.trier_bbox = {
            'south': 49.7200,
            'west': 6.6200,
            'north': 49.7800,
            'east': 6.6800
        }
        
    def query_overpass_api(self, query, description):
        """Führt eine Overpass API Abfrage aus"""
        print(f"\nLade {description} von OpenStreetMap...")
        
        overpass_url = "http://overpass-api.de/api/interpreter"
        
        try:
            response = requests.post(overpass_url, data=query, timeout=60)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'elements' in data:
                        print(f"  ✓ {len(data['elements'])} Objekte gefunden")
                        return data['elements']
                    else:
                        print(f"  ✗ Keine Elemente in der Antwort")
                        return []
                except json.JSONDecodeError:
                    print(f"  ✗ JSON-Parse-Fehler")
                    return []
            else:
                print(f"  ✗ HTTP-Fehler: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"  ✗ Fehler: {e}")
            return []

    def download_bus_stops(self):
        """Lädt alle Bushaltestellen in Trier"""
        query = f"""
        [out:json][timeout:60];
        (
          node["highway"="bus_stop"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["public_transport"="stop_position"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["public_transport"="platform"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
        );
        out body;
        """
        
        elements = self.query_overpass_api(query, "Bushaltestellen")
        
        for element in elements:
            if element.get('lat') and element.get('lon'):
                tags = element.get('tags', {})
                name = tags.get('name', tags.get('ref', f"Haltestelle {element['id']}"))
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "type": "Bushaltestelle",
                        "source": "OpenStreetMap",
                        "operator": tags.get('operator', ''),
                        "network": tags.get('network', ''),
                        "ref": tags.get('ref', ''),
                        "shelter": tags.get('shelter', ''),
                        "wheelchair": tags.get('wheelchair', ''),
                        "osm_id": element['id']
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [element['lon'], element['lat']]
                    }
                }
                self.all_features.append(feature)

    def download_train_stations(self):
        """Lädt alle Bahnhöfe in Trier"""
        query = f"""
        [out:json][timeout:60];
        (
          node["railway"="station"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["railway"="halt"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["public_transport"="station"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
        );
        out body;
        """
        
        elements = self.query_overpass_api(query, "Bahnhöfe und Bahnhaltestellen")
        
        for element in elements:
            if element.get('lat') and element.get('lon'):
                tags = element.get('tags', {})
                name = tags.get('name', f"Bahnhof {element['id']}")
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "type": "Bahnhof",
                        "source": "OpenStreetMap",
                        "operator": tags.get('operator', ''),
                        "railway": tags.get('railway', ''),
                        "public_transport": tags.get('public_transport', ''),
                        "wheelchair": tags.get('wheelchair', ''),
                        "osm_id": element['id']
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [element['lon'], element['lat']]
                    }
                }
                self.all_features.append(feature)

    def download_parking(self):
        """Lädt Parkplätze und Park+Ride"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="parking"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          way["amenity"="parking"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["park_ride"="yes"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          way["park_ride"="yes"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
        );
        out center;
        """
        
        elements = self.query_overpass_api(query, "Parkplätze")
        
        for element in elements:
            lat = element.get('lat') or (element.get('center', {}).get('lat'))
            lon = element.get('lon') or (element.get('center', {}).get('lon'))
            
            if lat and lon:
                tags = element.get('tags', {})
                name = tags.get('name', f"Parkplatz {element['id']}")
                
                park_type = "Park+Ride" if tags.get('park_ride') == 'yes' else "Parkplatz"
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "type": park_type,
                        "source": "OpenStreetMap",
                        "operator": tags.get('operator', ''),
                        "capacity": tags.get('capacity', ''),
                        "fee": tags.get('fee', ''),
                        "wheelchair": tags.get('wheelchair', ''),
                        "surface": tags.get('surface', ''),
                        "osm_id": element['id']
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    }
                }
                self.all_features.append(feature)

    def download_bike_infrastructure(self):
        """Lädt Fahrrad-Infrastruktur"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="bicycle_parking"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["amenity"="bicycle_rental"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["amenity"="charging_station"]["motorcar"!="yes"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
        );
        out body;
        """
        
        elements = self.query_overpass_api(query, "Fahrrad-Infrastruktur")
        
        for element in elements:
            if element.get('lat') and element.get('lon'):
                tags = element.get('tags', {})
                amenity = tags.get('amenity', '')
                
                if amenity == 'bicycle_parking':
                    name = tags.get('name', f"Fahrradparkplatz {element['id']}")
                    type_name = "Fahrradparkplatz"
                elif amenity == 'bicycle_rental':
                    name = tags.get('name', f"Fahrradverleih {element['id']}")
                    type_name = "Fahrradverleih"
                elif amenity == 'charging_station':
                    name = tags.get('name', f"E-Bike Ladestation {element['id']}")
                    type_name = "E-Bike Ladestation"
                else:
                    continue
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "type": type_name,
                        "source": "OpenStreetMap",
                        "operator": tags.get('operator', ''),
                        "capacity": tags.get('capacity', ''),
                        "fee": tags.get('fee', ''),
                        "covered": tags.get('covered', ''),
                        "osm_id": element['id']
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [element['lon'], element['lat']]
                    }
                }
                self.all_features.append(feature)

    def download_ev_charging(self):
        """Lädt E-Auto Ladestationen"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="charging_station"]["motorcar"="yes"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
          node["amenity"="charging_station"][!"bicycle"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
        );
        out body;
        """
        
        elements = self.query_overpass_api(query, "E-Auto Ladestationen")
        
        for element in elements:
            if element.get('lat') and element.get('lon'):
                tags = element.get('tags', {})
                name = tags.get('name', f"E-Auto Ladestation {element['id']}")
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "type": "E-Auto Ladestation",
                        "source": "OpenStreetMap",
                        "operator": tags.get('operator', ''),
                        "network": tags.get('network', ''),
                        "capacity": tags.get('capacity', ''),
                        "fee": tags.get('fee', ''),
                        "socket": tags.get('socket:type2', tags.get('socket:type3', '')),
                        "osm_id": element['id']
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [element['lon'], element['lat']]
                    }
                }
                self.all_features.append(feature)

    def download_taxi_stands(self):
        """Lädt Taxistände"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="taxi"]({self.trier_bbox['south']},{self.trier_bbox['west']},{self.trier_bbox['north']},{self.trier_bbox['east']});
        );
        out body;
        """
        
        elements = self.query_overpass_api(query, "Taxistände")
        
        for element in elements:
            if element.get('lat') and element.get('lon'):
                tags = element.get('tags', {})
                name = tags.get('name', f"Taxistand {element['id']}")
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "name": name,
                        "type": "Taxistand",
                        "source": "OpenStreetMap",
                        "operator": tags.get('operator', ''),
                        "phone": tags.get('phone', ''),
                        "osm_id": element['id']
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [element['lon'], element['lat']]
                    }
                }
                self.all_features.append(feature)

    def download_gtfs_data(self):
        """Versucht GTFS-Daten zu finden"""
        print("\nSuche nach GTFS-Daten für Trier...")
        
        # Bekannte GTFS-Quellen für deutsche ÖPNV
        gtfs_sources = [
            {
                'name': 'VRT (Verkehrsverbund Region Trier)',
                'url': 'https://www.vrt-info.de/open-data',
                'type': 'info'
            },
            {
                'name': 'SWT (Stadtwerke Trier)',
                'url': 'https://www.swt.de/verkehr/fahrplaene',
                'type': 'info'
            }
        ]
        
        for source in gtfs_sources:
            print(f"  → {source['name']}: {source['url']}")
        
        print("  ℹ️  GTFS-Daten müssen manuell von den Verkehrsbetrieben angefragt werden")

    def save_results(self):
        """Speichert alle gesammelten Daten"""
        if not self.all_features:
            print("\nKeine Daten zum Speichern gefunden")
            return
            
        # Ausgabeverzeichnis erstellen
        output_dir = os.path.join(self.base_dir, 'data')
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Nach Typ gruppieren
        types_count = {}
        for feature in self.all_features:
            feature_type = feature['properties']['type']
            types_count[feature_type] = types_count.get(feature_type, 0) + 1
        
        print(f"\n=== Gesammelte Daten ===")
        print(f"Gesamt: {len(self.all_features)} Features")
        for type_name, count in sorted(types_count.items()):
            print(f"  {type_name}: {count}")
        
        # GeoJSON speichern
        geojson = {
            "type": "FeatureCollection",
            "features": self.all_features,
            "metadata": {
                "generated": datetime.now().isoformat(),
                "source": "OpenStreetMap via Overpass API",
                "area": "Trier, Germany",
                "bbox": self.trier_bbox,
                "total_features": len(self.all_features),
                "types": types_count
            }
        }
        
        geojson_file = f"trier_transport_{timestamp}.geojson"
        geojson_path = os.path.join(output_dir, geojson_file)
        
        with open(geojson_path, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        
        # CSV speichern
        csv_file = f"trier_transport_{timestamp}.csv"
        csv_path = os.path.join(output_dir, csv_file)
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile, delimiter=';')
            writer.writerow(['Name', 'Typ', 'Längengrad', 'Breitengrad', 'Quelle', 'Operator', 'Details'])
            
            for feature in self.all_features:
                props = feature['properties']
                coords = feature['geometry']['coordinates']
                
                # Details zusammenfassen
                details = []
                for key in ['capacity', 'fee', 'wheelchair', 'network', 'ref']:
                    if props.get(key):
                        details.append(f"{key}: {props[key]}")
                
                writer.writerow([
                    props.get('name', ''),
                    props.get('type', ''),
                    coords[0] if len(coords) > 0 else '',
                    coords[1] if len(coords) > 1 else '',
                    props.get('source', ''),
                    props.get('operator', ''),
                    '; '.join(details)
                ])
        
        print(f"\n✓ Daten gespeichert:")
        print(f"  GeoJSON: {geojson_file}")
        print(f"  CSV: {csv_file}")
        print(f"  Pfad: {output_dir}")

    def run(self):
        """Hauptmethode - lädt alle Daten"""
        print("=== Trier Transport Data Downloader ===")
        print("Datenquelle: OpenStreetMap (Overpass API)")
        print(f"Gebiet: {self.trier_bbox}")
        
        # Verschiedene Datentypen laden
        self.download_bus_stops()
        time.sleep(2)  # Pause zwischen Requests
        
        self.download_train_stations()
        time.sleep(2)
        
        self.download_parking()
        time.sleep(2)
        
        self.download_bike_infrastructure()
        time.sleep(2)
        
        self.download_ev_charging()
        time.sleep(2)
        
        self.download_taxi_stands()
        time.sleep(2)
        
        self.download_gtfs_data()
        
        # Ergebnisse speichern
        self.save_results()

def main():
    downloader = TransportDownloader()
    downloader.run()

if __name__ == "__main__":
    main() 