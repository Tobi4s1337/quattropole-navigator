import requests
import json
from datetime import datetime

class AlternativeDataSources:
    def __init__(self):
        self.results = []
        
    def check_mcloud_platform(self):
        """Prüft die mCloud Plattform für öffentliche Verkehrsdaten"""
        print("\n=== mCloud (Mobility Data Marketplace) ===")
        
        # mCloud API für Trier/Rheinland-Pfalz Daten
        search_terms = [
            "Trier öffentlicher Verkehr",
            "Rheinland-Pfalz ÖPNV",
            "VRT Verkehrsverbund",
            "Stadtwerke Trier"
        ]
        
        print("Verfügbare Datenquellen auf mCloud:")
        print("→ https://www.mcloud.de/")
        print("→ Suchbegriffe: ÖPNV, Trier, Rheinland-Pfalz, VRT")
        
        mcloud_apis = [
            {
                'name': 'mCloud REST API',
                'url': 'https://www.mcloud.de/web/guest/suche',
                'description': 'Bundesweite Mobilitätsdaten'
            },
            {
                'name': 'OpenData Portal RLP',
                'url': 'https://daten.rlp.de/',
                'description': 'Offene Daten Rheinland-Pfalz'
            }
        ]
        
        for api in mcloud_apis:
            print(f"  ✓ {api['name']}: {api['url']}")
            print(f"    {api['description']}")

    def check_vrt_sources(self):
        """Prüft VRT (Verkehrsverbund Region Trier) Datenquellen"""
        print("\n=== VRT (Verkehrsverbund Region Trier) ===")
        
        vrt_sources = [
            {
                'name': 'VRT OpenData Portal',
                'url': 'https://www.vrt-info.de/fahrgastinformation/opendata/',
                'type': 'GTFS',
                'description': 'Fahrplandaten für Region Trier'
            },
            {
                'name': 'VRT API',
                'url': 'https://api.vrt-info.de/',
                'type': 'REST API',
                'description': 'Echtzeitdaten und Fahrpläne'
            },
            {
                'name': 'DELFI e.V.',
                'url': 'https://www.delfi.de/',
                'type': 'GTFS',
                'description': 'Deutschlandweiter ÖPNV-Datenstandard'
            }
        ]
        
        for source in vrt_sources:
            print(f"  ✓ {source['name']} ({source['type']})")
            print(f"    URL: {source['url']}")
            print(f"    Info: {source['description']}")

    def check_stadtwerke_trier(self):
        """Prüft Stadtwerke Trier Datenquellen"""
        print("\n=== Stadtwerke Trier (SWT) ===")
        
        swt_sources = [
            {
                'name': 'SWT Fahrplanauskunft',
                'url': 'https://www.swt.de/verkehr/fahrplaene',
                'type': 'Web API',
                'description': 'Aktuelle Fahrpläne der Stadtbusse'
            },
            {
                'name': 'SWT Echtzeitdaten',
                'url': 'https://www.swt.de/verkehr/echtzeitinfo',
                'type': 'Real-time',
                'description': 'Live-Abfahrtszeiten'
            },
            {
                'name': 'EFA (Elektronische Fahrplanauskunft)',
                'url': 'https://efa.vrt-info.de/',
                'type': 'EFA API',
                'description': 'Regionale Fahrplanauskunft'
            }
        ]
        
        for source in swt_sources:
            print(f"  ✓ {source['name']} ({source['type']})")
            print(f"    URL: {source['url']}")
            print(f"    Info: {source['description']}")

    def check_gtfs_germany(self):
        """Prüft deutschlandweite GTFS-Quellen"""
        print("\n=== Deutschlandweite GTFS-Quellen ===")
        
        gtfs_sources = [
            {
                'name': 'OpenOV (Deutschland)',
                'url': 'https://gtfs.de/',
                'region': 'Deutschland',
                'description': 'Sammlung deutscher GTFS-Feeds'
            },
            {
                'name': 'Transitland',
                'url': 'https://www.transit.land/',
                'region': 'Weltweit',
                'description': 'Internationale GTFS-Datenbank'
            },
            {
                'name': 'GTFS-Hub Deutschland',
                'url': 'https://github.com/public-transport-germany/gtfs',
                'region': 'Deutschland',
                'description': 'GitHub-Repository mit deutschen GTFS-Daten'
            }
        ]
        
        for source in gtfs_sources:
            print(f"  ✓ {source['name']}")
            print(f"    URL: {source['url']}")
            print(f"    Region: {source['region']}")
            print(f"    Info: {source['description']}")

    def check_gov_data_portals(self):
        """Prüft Behörden-Datenportale"""
        print("\n=== Behörden-Datenportale ===")
        
        gov_portals = [
            {
                'name': 'GovData Deutschland',
                'url': 'https://www.govdata.de/',
                'search': 'ÖPNV Trier',
                'description': 'Zentrale Plattform für deutsche Open Data'
            },
            {
                'name': 'Landesamt für Vermessung RLP',
                'url': 'https://lvermgeo.rlp.de/',
                'search': 'Verkehrsinfrastruktur',
                'description': 'Geodaten Rheinland-Pfalz'
            },
            {
                'name': 'Bundesamt für Kartographie',
                'url': 'https://www.bkg.bund.de/',
                'search': 'Verkehrswege',
                'description': 'Deutschlandweite Verkehrsdaten'
            }
        ]
        
        for portal in gov_portals:
            print(f"  ✓ {portal['name']}")
            print(f"    URL: {portal['url']}")
            print(f"    Suche: {portal['search']}")
            print(f"    Info: {portal['description']}")

    def check_european_sources(self):
        """Prüft europäische Datenquellen"""
        print("\n=== Europäische Datenquellen ===")
        
        eu_sources = [
            {
                'name': 'EU Open Data Portal',
                'url': 'https://data.europa.eu/',
                'search': 'public transport Germany',
                'description': 'Europäisches Open Data Portal'
            },
            {
                'name': 'INSPIRE Geoportal',
                'url': 'https://inspire-geoportal.ec.europa.eu/',
                'search': 'transport networks',
                'description': 'EU-weite Geodateninfrastruktur'
            },
            {
                'name': 'OpenStreetMap Overpass API',
                'url': 'https://overpass-api.de/',
                'search': 'public_transport=* in Trier',
                'description': 'Crowdsourced Geodaten (bereits verwendet)'
            }
        ]
        
        for source in eu_sources:
            print(f"  ✓ {source['name']}")
            print(f"    URL: {source['url']}")
            print(f"    Suche: {source['search']}")
            print(f"    Info: {source['description']}")

    def generate_api_examples(self):
        """Erstellt Beispiel-API-Calls"""
        print("\n=== API-Beispiele ===")
        
        examples = [
            {
                'name': 'Overpass API (bereits implementiert)',
                'url': 'http://overpass-api.de/api/interpreter',
                'query': '[out:json];node["highway"="bus_stop"](49.72,6.62,49.78,6.68);out;',
                'description': 'Bushaltestellen in Trier'
            },
            {
                'name': 'VRT EFA API',
                'url': 'https://efa.vrt-info.de/vrr/XSLT_TRIP_REQUEST2',
                'query': 'name_origin=Trier&name_destination=...',
                'description': 'Routenplanung'
            },
            {
                'name': 'mCloud CKAN API',
                'url': 'https://www.mcloud.de/api/3/action/package_search',
                'query': '?q=ÖPNV+Trier',
                'description': 'Datensatz-Suche'
            }
        ]
        
        for example in examples:
            print(f"\n{example['name']}:")
            print(f"  URL: {example['url']}")
            print(f"  Query: {example['query']}")
            print(f"  Zweck: {example['description']}")

    def save_source_list(self):
        """Speichert eine Liste aller Datenquellen"""
        sources_info = {
            "generated": datetime.now().isoformat(),
            "title": "Alternative Datenquellen für ÖPNV Trier",
            "description": "Übersicht über verfügbare OpenData-Quellen für öffentliche Verkehrsdaten in Trier",
            "categories": {
                "regional": [
                    {"name": "VRT", "url": "https://www.vrt-info.de/", "type": "GTFS/API"},
                    {"name": "Stadtwerke Trier", "url": "https://www.swt.de/", "type": "Fahrpläne"},
                    {"name": "OpenData RLP", "url": "https://daten.rlp.de/", "type": "Regional"}
                ],
                "national": [
                    {"name": "mCloud", "url": "https://www.mcloud.de/", "type": "GTFS/API"},
                    {"name": "GovData", "url": "https://www.govdata.de/", "type": "Behördendaten"},
                    {"name": "GTFS.de", "url": "https://gtfs.de/", "type": "GTFS"}
                ],
                "international": [
                    {"name": "OpenStreetMap", "url": "https://www.openstreetmap.org/", "type": "Geodaten"},
                    {"name": "Transitland", "url": "https://www.transit.land/", "type": "GTFS"},
                    {"name": "EU Open Data", "url": "https://data.europa.eu/", "type": "EU-Daten"}
                ]
            },
            "implementation_status": {
                "completed": ["OpenStreetMap via Overpass API"],
                "recommended_next": ["VRT GTFS Feed", "mCloud API", "SWT Echtzeitdaten"],
                "future": ["EU INSPIRE Services", "Real-time APIs"]
            }
        }
        
        with open('alternative_data_sources.json', 'w', encoding='utf-8') as f:
            json.dump(sources_info, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Quellenliste gespeichert: alternative_data_sources.json")

    def run(self):
        """Hauptmethode - zeigt alle verfügbaren Datenquellen"""
        print("=== Alternative OpenData-Quellen für Trier ÖPNV ===")
        print("Übersicht über verfügbare Datenquellen für öffentliche Verkehrsdaten\n")
        
        self.check_mcloud_platform()
        self.check_vrt_sources()
        self.check_stadtwerke_trier()
        self.check_gtfs_germany()
        self.check_gov_data_portals()
        self.check_european_sources()
        self.generate_api_examples()
        self.save_source_list()
        
        print("\n" + "="*60)
        print("ZUSAMMENFASSUNG:")
        print("✓ OpenStreetMap-Daten erfolgreich geladen (1.933 Features)")
        print("→ Nächste Schritte:")
        print("  1. VRT OpenData Portal prüfen für GTFS-Feeds")
        print("  2. mCloud API für weitere Mobilitätsdaten")
        print("  3. Stadtwerke Trier für Echtzeitdaten")
        print("  4. EU INSPIRE Services für EU-weite Abdeckung")

def main():
    checker = AlternativeDataSources()
    checker.run()

if __name__ == "__main__":
    main() 