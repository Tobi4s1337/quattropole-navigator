# Trier & Quattropole Public Transport Data Downloader

## 🎯 Projektziel

Sammlung aller verfügbaren öffentlichen Verkehrsdaten für Trier und alle Quattropole-Städte (Trier, Luxembourg, Metz, Saarbrücken) in standardisierten Formaten (GeoJSON, CSV) mit WGS84-Koordinaten.

## ✅ Verfügbare Systeme

### 1. Trier Transport Downloader (`transport_downloader.py`)
**Fokus**: Nur Trier, Deutschland
**Ergebnis**: ✅ **1.933 Features**

### 2. Quattropole Transport Downloader (`getTransport.py`)
**Fokus**: Alle Quattropole-Städte (grenzüberschreitend)
**Ergebnis**: ✅ **9.023 Features** aus 4 Ländern

## 🌍 Quattropole-Ergebnisse (Alle Städte)

| Stadt | Land | Features | Highlights |
|-------|------|----------|------------|
| **🇩🇪 Trier** | Deutschland | 1.933 | 659 Bushaltestellen, VRT/SWT |
| **🇱🇺 Luxembourg** | Luxemburg | 2.788 | 87 Fahrradverleih, AVL/RGTR |
| **🇫🇷 Metz** | Frankreich | 1.912 | 96 E-Auto Ladestationen, TAMM |
| **🇩🇪 Saarbrücken** | Deutschland | 2.390 | 580 Fahrradparkplätze, Saarbahn |

### Gesamt-Statistiken:
- 🚌 **2.990 Bushaltestellen**
- 🚂 **23 Bahnhöfe**
- 🅿️ **4.124 Parkplätze** (+ 12 Park+Ride)
- 🚲 **1.439 Fahrradparkplätze**
- 🚴 **90 Fahrradverleih-Stationen**
- ⚡ **220 E-Auto Ladestationen**
- 🚲⚡ **89 E-Bike Ladestationen**
- 🚕 **36 Taxistände**

## 🚀 Schnellstart

### Nur Trier:
```bash
python transport_downloader.py
```

### Quattropole-Städte:
```bash
# Alle Städte
python getTransport.py

# Nur bestimmte Städte
python getTransport.py --cities trier luxembourg
python getTransport.py --cities metz saarbruecken
python getTransport.py --cities trier
```

### Installation:
```bash
pip install -r requirements.txt
```

## 📂 Projektstruktur

```
PublicTransport/
├── transport_downloader.py       # 🇩🇪 Nur Trier
├── getTransport.py              # 🌍 Alle Quattropole-Städte
├── quattropole_cities.json        # 🗺️ Städte-Konfiguration
├── alternative_sources.py       # 📋 Weitere Datenquellen
├── requirements.txt             # 📦 Dependencies
├── data/
│   ├── trier_transport_*.geojson    # Trier-only Daten
│   ├── trier_transport_*.csv
│   └── quattropole/                   # Quattropole Daten
│       ├── quattropole_all_*.geojson
│       ├── quattropole_all_*.csv
│       ├── quattropole_trier_*.geojson
│       └── quattropole_luxembourg_*.csv
└── README.md                    # 📖 Diese Datei
```

## 🗺️ Städte-Konfiguration

Die Quattropole-Städte sind in `quattropole_cities.json` definiert:

| Stadt | Bounding Box | Verkehrsbetrieb |
|-------|--------------|-----------------|
| Trier | 49.72-49.78°N, 6.62-6.68°E | VRT / SWT |
| Luxembourg | 49.58-49.65°N, 6.10-6.18°E | AVL / RGTR |
| Metz | 49.10-49.14°N, 6.15-6.21°E | TAMM |
| Saarbrücken | 49.22-49.26°N, 6.95-7.01°E | Saarbahn / VVS |

## 🔧 Kommandozeilen-Optionen

### Quattropole Downloader:
```bash
python getTransport.py --help

Optionen:
  --cities, -c    Städte auswählen:
                  trier, luxembourg, metz, saarbruecken, all
                  
Beispiele:
  python getTransport.py --cities all
  python getTransport.py --cities trier metz
  python getTransport.py -c luxembourg saarbruecken
```

## 🌐 Grenzüberschreitende Features

Das Quattropole-System erfasst:
- **3 Länder**: Deutschland, Luxemburg, Frankreich
- **4 Sprachen**: Deutsch, Französisch, Luxemburgisch, Englisch
- **Verschiedene Verkehrssysteme**: Regional (VRT), National (AVL), Metro (TAMM), Stadtbahn (Saarbahn)
- **Einheitliche Koordinaten**: WGS84 für alle Länder

## 📊 Ausgabeformate

### GeoJSON (für GIS):
```json
{
  "type": "Feature",
  "properties": {
    "name": "Gare Centrale Luxembourg",
    "type": "Bahnhof",
    "city": "Luxembourg",
    "country": "Luxemburg",
    "source": "OpenStreetMap"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [6.1300, 49.6000]
  }
}
```

### CSV (für Analyse):
```csv
Name;Typ;Stadt;Land;Längengrad;Breitengrad;Quelle;Operator;Details
Gare Centrale;Bahnhof;Luxembourg;Luxemburg;6.1300;49.6000;OpenStreetMap;CFL;
```

## 📊 Alternative Datenquellen

Für spezifische Länder/Regionen:
- **Deutschland**: VRT, DB Open Data, mCloud
- **Luxemburg**: AVL, RGTR, OpenData Luxembourg  
- **Frankreich**: SNCF Connect, Data.gouv.fr
- **EU-weit**: EU Open Data Portal, INSPIRE

Vollständige Übersicht: `python alternative_sources.py`

## 🏆 Erfolgs-Metriken

### Trier-System:
- ✅ 1.933 Features geladen
- ✅ Regional fokussiert

### Quattropole-System:
- ✅ 9.023 Features geladen  
- ✅ 4 Städte, 3 Länder
- ✅ Grenzüberschreitende Kompatibilität
- ✅ Mehrsprachige Datensätze
- ✅ Einheitliche Datenstruktur

## 🛠️ Dependencies

```txt
requests>=2.31.0
```

## 🤝 Quattropole Initiative

**Quattropole** ist eine grenzüberschreitende Städtekooperation zwischen:
- **Trier** (Deutschland)
- **Luxembourg** (Luxemburg)  
- **Metz** (Frankreich)
- **Saarbrücken** (Deutschland)

Website: https://www.quattropole.org/

## 📜 Lizenz

- **Daten**: OpenStreetMap unter ODbL-Lizenz
- **Software**: MIT-Lizenz

---

**Status**: ✅ **Produktionsbereit - Mono & Multi-City**
**Letzte Aktualisierung**: 24.05.2025
