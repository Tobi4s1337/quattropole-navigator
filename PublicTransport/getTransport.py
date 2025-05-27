import requests
import json
import os
import sys
from datetime import datetime
import time
import csv
import argparse

class QuattropoleTransportDownloader:
    def __init__(self, config_file="quattropole_cities.json"):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.config_file = config_file
        self.cities_config = self.load_cities_config()
        self.all_features = []
        self.current_city = None
        
    def load_cities_config(self):
        """Lädt die Städte-Konfiguration"""
        config_path = os.path.join(self.base_dir, self.config_file)
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Fehler beim Laden der Konfiguration: {e}")
            return None

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

    def download_bus_stops(self, bbox):
        """Lädt alle Bushaltestellen in der gegebenen Bounding Box"""
        query = f"""
        [out:json][timeout:60];
        (
          node["highway"="bus_stop"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["public_transport"="stop_position"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["public_transport"="platform"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
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
                        "city": self.current_city['name'],
                        "country": self.current_city['country'],
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

    def download_train_stations(self, bbox):
        """Lädt alle Bahnhöfe in der gegebenen Bounding Box"""
        query = f"""
        [out:json][timeout:60];
        (
          node["railway"="station"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["railway"="halt"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["public_transport"="station"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
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
                        "city": self.current_city['name'],
                        "country": self.current_city['country'],
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

    def download_parking(self, bbox):
        """Lädt Parkplätze und Park+Ride"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="parking"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          way["amenity"="parking"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["park_ride"="yes"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          way["park_ride"="yes"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
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
                        "city": self.current_city['name'],
                        "country": self.current_city['country'],
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

    def download_bike_infrastructure(self, bbox):
        """Lädt Fahrrad-Infrastruktur"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="bicycle_parking"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["amenity"="bicycle_rental"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["amenity"="charging_station"]["motorcar"!="yes"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
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
                        "city": self.current_city['name'],
                        "country": self.current_city['country'],
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

    def download_ev_charging(self, bbox):
        """Lädt E-Auto Ladestationen"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="charging_station"]["motorcar"="yes"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
          node["amenity"="charging_station"][!"bicycle"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
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
                        "city": self.current_city['name'],
                        "country": self.current_city['country'],
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

    def download_taxi_stands(self, bbox):
        """Lädt Taxistände"""
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="taxi"]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
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
                        "city": self.current_city['name'],
                        "country": self.current_city['country'],
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

    def download_city_data(self, city_key):
        """Lädt alle Daten für eine bestimmte Stadt"""
        if city_key not in self.cities_config['cities']:
            print(f"Stadt '{city_key}' nicht in Konfiguration gefunden!")
            return False
        
        city = self.cities_config['cities'][city_key]
        self.current_city = city
        bbox = city['bbox']
        
        print(f"\n{'='*60}")
        print(f"📍 Lade Daten für {city['name']}, {city['country']}")
        print(f"   Verkehrsbetrieb: {city['transport_authority']}")
        print(f"   Gebiet: {bbox}")
        print(f"{'='*60}")
        
        # Verschiedene Datentypen laden
        self.download_bus_stops(bbox)
        time.sleep(2)  # Pause zwischen Requests
        
        self.download_train_stations(bbox)
        time.sleep(2)
        
        self.download_parking(bbox)
        time.sleep(2)
        
        self.download_bike_infrastructure(bbox)
        time.sleep(2)
        
        self.download_ev_charging(bbox)
        time.sleep(2)
        
        self.download_taxi_stands(bbox)
        time.sleep(2)
        
        return True

    def save_results(self, city_keys, timestamp):
        """Speichert alle gesammelten Daten"""
        if not self.all_features:
            print("\nKeine Daten zum Speichern gefunden")
            return
            
        # Ausgabeverzeichnis erstellen
        output_dir = os.path.join(self.base_dir, 'data', 'quattropole')
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Nach Stadt und Typ gruppieren
        city_stats = {}
        types_count = {}
        
        for feature in self.all_features:
            city_name = feature['properties']['city']
            feature_type = feature['properties']['type']
            
            if city_name not in city_stats:
                city_stats[city_name] = {}
            if feature_type not in city_stats[city_name]:
                city_stats[city_name][feature_type] = 0
            city_stats[city_name][feature_type] += 1
            
            if feature_type not in types_count:
                types_count[feature_type] = 0
            types_count[feature_type] += 1
        
        print(f"\n{'='*60}")
        print(f"=== QUATTROPOLE TRANSPORT DATA - ZUSAMMENFASSUNG ===")
        print(f"Gesamt: {len(self.all_features)} Features")
        print(f"{'='*60}")
        
        for city_name, stats in city_stats.items():
            total_city = sum(stats.values())
            print(f"\n🏙️  {city_name}: {total_city} Features")
            for type_name, count in sorted(stats.items()):
                print(f"    {type_name}: {count}")
        
        print(f"\n📊 Gesamt nach Typ:")
        for type_name, count in sorted(types_count.items()):
            print(f"  {type_name}: {count}")
        
        # Dateiname erstellen
        cities_suffix = "_".join(city_keys) if len(city_keys) <= 2 else "all"
        
        # GeoJSON speichern
        geojson = {
            "type": "FeatureCollection",
            "features": self.all_features,
            "metadata": {
                "generated": datetime.now().isoformat(),
                "source": "OpenStreetMap via Overpass API",
                "project": "Quattropole Cities",
                "cities": list(city_stats.keys()),
                "total_features": len(self.all_features),
                "stats_by_city": city_stats,
                "stats_by_type": types_count
            }
        }
        
        geojson_file = f"quattropole_{cities_suffix}_{timestamp}.geojson"
        geojson_path = os.path.join(output_dir, geojson_file)
        
        with open(geojson_path, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        
        # CSV speichern
        csv_file = f"quattropole_{cities_suffix}_{timestamp}.csv"
        csv_path = os.path.join(output_dir, csv_file)
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile, delimiter=';')
            writer.writerow(['Name', 'Typ', 'Stadt', 'Land', 'Längengrad', 'Breitengrad', 'Quelle', 'Operator', 'Details'])
            
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
                    props.get('city', ''),
                    props.get('country', ''),
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

    def run(self, cities=None):
        """Hauptmethode - lädt Daten für ausgewählte Städte"""
        if not self.cities_config:
            print("Fehler: Konfiguration konnte nicht geladen werden!")
            return
        
        # Standardmäßig alle Städte
        if cities is None:
            cities = list(self.cities_config['cities'].keys())
        
        # Validierung der Städte
        available_cities = list(self.cities_config['cities'].keys())
        invalid_cities = [city for city in cities if city not in available_cities]
        if invalid_cities:
            print(f"Unbekannte Städte: {invalid_cities}")
            print(f"Verfügbare Städte: {available_cities}")
            return
        
        print("🌍 QUATTROPOLE TRANSPORT DATA DOWNLOADER 🌍")
        print(f"Datenquelle: OpenStreetMap (Overpass API)")
        print(f"Städte: {[self.cities_config['cities'][c]['name'] for c in cities]}")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Alle gewählten Städte abarbeiten
        for city_key in cities:
            success = self.download_city_data(city_key)
            if not success:
                continue
        
        # Ergebnisse speichern
        self.save_results(cities, timestamp)

def main():
    parser = argparse.ArgumentParser(description='Quattropole Transport Data Downloader')
    parser.add_argument('--cities', '-c', nargs='+', 
                       choices=['trier', 'luxembourg', 'metz', 'saarbruecken', 'all'],
                       default=['all'],
                       help='Städte zum Download (default: all)')
    
    args = parser.parse_args()
    
    # 'all' durch alle Städte ersetzen
    if 'all' in args.cities:
        cities = ['trier', 'luxembourg', 'metz', 'saarbruecken']
    else:
        cities = args.cities
    
    downloader = QuattropoleTransportDownloader()
    downloader.run(cities)

if __name__ == "__main__":
    main() 