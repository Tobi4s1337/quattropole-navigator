# Saarbrücken Events Scraper

This Python scraper extracts event information from the Saarbrücken Tourism website for the year 2025. The scraper navigates through all pagination pages and extracts specified data fields from both the event list and individual event detail pages.

## Data Fields Extracted

For each event, the following data points are extracted:

- **Name**: The primary title of the event
- **Art (Category/Type)**: The classification or type of event (e.g., "Konzert", "Ausstellung")
- **Ort (Location)**: The specific venue or location within Saarbrücken
- **Datum (Date)**: The date(s) of the event in DD-MM-YYYY format
- **Telefon (Phone)**: Contact phone number for the event, if available
- **Website**: External website URL for the event, if available

## Requirements

```
scrapy>=2.7.0
python-dateutil>=2.8.2
```

## Installation

```bash
pip install -r requirements.txt
```

## Usage

Run the script directly:

```bash
python scrape_saarbruecken_events.py
```

After running the script, the scraped data will be saved to `saarbruecken_events_2025.csv` in the same directory.

## Features

- Extracts data from both list and detail pages
- Handles pagination automatically
- Processes different date formats (single day, ranges, recurring)
- Includes polite delays between requests
- Error handling for missing fields and network issues
- Output to CSV with proper UTF-8 encoding
