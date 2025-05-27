#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import scrapy
from datetime import date
from scrapy.crawler import CrawlerProcess
from scrapy.exceptions import CloseSpider
import csv
import time
from datetime import datetime
import re
import logging
import json
import os



class SaarbrueckenEventSpider(scrapy.Spider):
    name = 'saarbruecken_events'
    
    def __init__(self, test_mode=False, max_events=30, *args, **kwargs):
        super(SaarbrueckenEventSpider, self).__init__(*args, **kwargs)
        
        # --- Logger Setup ---
        logger_name = f'{self.name}_parser_debug_{datetime.now().strftime("%Y%m%d%H%M%S%f")}'
        self.parser_logger = logging.getLogger(logger_name)
        self.parser_logger.setLevel(logging.INFO)
        
        parser_fh = logging.FileHandler('parser_debug.log', mode='w')
        parser_fh.setLevel(logging.INFO)
        
        parser_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        parser_fh.setFormatter(parser_formatter)
        
        self.parser_logger.addHandler(parser_fh)
        self.parser_logger.propagate = False
        # --- End Logger Setup ---

        self.test_mode = bool(test_mode)
        self.max_events = int(max_events)
        self.results = [] # Initialize results for the instance
        
        self.parser_logger.info(f"Spider initialized. Logger: {self.parser_logger.name}. test_mode={self.test_mode}, max_events={self.max_events}")
    
    def start_requests(self):
        today = date.today()
        start_date_str = today.strftime("%d.%m.%Y")
        
        # Set end date to the end of the next year for a wide range
        end_date_year = today.year + 1 
        end_date_str = f"31.12.{end_date_year}"
        
        base_url = "https://tourismus.saarbruecken.de/events"
        # Construct the dynamic URL using the same query parameter structure
        dynamic_url = f"{base_url}?fav_list=&q=&category=&range_date={start_date_str}+-+{end_date_str}"
        
        self.parser_logger.info(f"Dynamically generated start URL: {dynamic_url}")
        self.parser_logger.info(f"Spider settings: test_mode={self.test_mode}, max_events={self.max_events}, results_len={len(self.results)}")
        yield scrapy.Request(url=dynamic_url, callback=self.parse, meta={'is_initial_request': True})
    
    # results are now initialized in __init__
    
    def parse(self, response):
        """
        Parse the event list page, extract basic information and follow links to detail pages
        """
        self.parser_logger.info(f"ENTERING parse method for URL: {response.url}")
        self.parser_logger.info(f"Initial state in parse: test_mode={self.test_mode}, len(results)={len(self.results)}, max_events={self.max_events}")
        self.parser_logger.info(f"Parsing list page: {response.url}")
        
        # Extract events from the grid layout
        event_items = response.css('div.event-item')
        self.parser_logger.info(f"Found {len(event_items)} events on page {response.url}. Current results: {len(self.results)}")
        
        # Check if we've reached the maximum number of events in test mode
        if self.test_mode and len(self.results) >= self.max_events:
            self.parser_logger.info(f"Test mode in PARSE (top): Reached maximum of {self.max_events} events ({len(self.results)}). Stopping further processing in this parse method.")
            return
        
        for item in event_items:
            # Extract data from the list page
            name = item.css('div.event-content h3::text').get('')
            if name:
                name = name.strip()
            
            # Extract date
            date_text = item.css('div.event-date span.day::text').get('')
            if date_text:
                date_text = date_text.strip()
            
            # Extract category (Art)
            art = ''
            art_element = item.xpath('.//span[contains(., "sb-movie-ticket")]/following-sibling::text()').get()
            if art_element:
                art = art_element.strip()
            
            # Extract location (Ort)
            ort = ''
            ort_element = item.xpath('.//span[contains(., "sb-location")]/following-sibling::text()').get()
            if ort_element:
                ort = ort_element.strip()
            
            # Extract the detail page URL
            detail_url = item.css('a.btn-wide::attr(href)').get('')
            
            # Create a full URL if it's a relative path
            if detail_url and not detail_url.startswith(('http://', 'https://')):
                detail_url = response.urljoin(detail_url)
            
            # Store the data from the list page
            event_data = {
                'Name': name,
                'Art': art,
                'Ort': ort,
                'Datum': self.process_date(date_text),
                'Telefon': '',
                'Website': ''
            }
            
            self.parser_logger.info(f"Extracted event: {name}, URL: {detail_url}")
            
            # Follow the link to the detail page
            if detail_url:
                if self.test_mode and len(self.results) >= self.max_events:
                    self.parser_logger.info(f"Test mode in PARSE (item loop): Skipping detail request for {event_data.get('Name')} as max_events ({self.max_events}) reached.")
                    continue # Skip to next item if max events reached
                self.parser_logger.info(f"Preparing to yield request for detail_url: {detail_url} with event_data: {event_data}")
                yield scrapy.Request(
                    detail_url,
                    callback=self.parse_detail,
                    meta={'event_data': event_data, 'dont_redirect': True, 'handle_httpstatus_list': [301, 302]},
                    priority=1 # Higher priority for detail pages
                )
        
        # Look for pagination links
        next_page = response.css('li.next a::attr(href)').get()
        if next_page and (not self.test_mode or len(self.results) < self.max_events):
            # Create a full URL if it's a relative path
            if not next_page.startswith(('http://', 'https://')):
                next_page = response.urljoin(next_page)
                
            self.parser_logger.info(f"Found next page: {next_page}")
            # Follow the link to the next page with a delay
            yield scrapy.Request(
                next_page,
                callback=self.parse
            )
    
    def parse_detail(self, response):
        """
        Parse the individual event detail page to extract more information
        """
        # Add a delay to be polite to the server
        time.sleep(1)
            
        # Get the event data passed from the list page
        self.parser_logger.info(f"ENTERING parse_detail for URL: {response.url}. Event data from meta: {response.meta.get('event_data', {})}")
        event_data = response.meta.get('event_data', {})

        # Initialize fields that might be missing or need updating from detail page
        event_data.setdefault('Name', '')
        event_data.setdefault('Art', '')
        event_data.setdefault('Ort', '')
        event_data.setdefault('Datum', '')
        event_data.setdefault('Telefon', '')
        event_data.setdefault('Website', '')
        event_data.setdefault('Bild', '')
        event_data.setdefault('Beschreibung', '')
        event_data.setdefault('Ticketvorverkauf', '')
        
        try:
            self.parser_logger.info(f"Processing event in parse_detail: {event_data.get('Name', 'N/A')}. Current results count: {len(self.results)}")
            
            # Extract or refine the event name from the detail page
            name_detail = response.css('h1.headline::text').get()
            if name_detail and name_detail.strip():
                event_data['Name'] = name_detail.strip()
            
            # Extract data from dl.dl-horizontal elements
            dts = response.css('dl.dl-horizontal dt::text').getall()
            dds = response.css('dl.dl-horizontal dd')
            
            for i, dt_text_raw in enumerate(dts):
                if i < len(dds):
                    dt_text = dt_text_raw.strip()
                    
                    if 'Art:' in dt_text:
                        art_text = dds[i].xpath('normalize-space(.)').get()
                        if art_text:
                            event_data['Art'] = art_text
                    
                    elif 'Ort:' in dt_text:
                        ort_lines = dds[i].css('::text').getall()
                        ort_content = "\n".join([line.strip() for line in ort_lines if line.strip()])
                        if ort_content:
                            event_data['Ort'] = ort_content
                    
                    elif 'Datum:' in dt_text:
                        raw_date_text = dds[i].xpath('normalize-space(.)').get()
                        if raw_date_text:
                            cleaned_date_text = self.clean_date_text(raw_date_text)
                            if cleaned_date_text:
                                event_data['Datum'] = cleaned_date_text
                    
                    elif 'Telefon:' in dt_text:
                        phone = dds[i].css('a::text').get()
                        if phone and phone.strip():
                            event_data['Telefon'] = phone.strip()
                    
                    elif 'Internet:' in dt_text:
                        website = dds[i].css('a::attr(href)').get()
                        if website and website.strip():
                            event_data['Website'] = response.urljoin(website.strip())
                    
                    elif 'Ticketvorverkauf:' in dt_text:
                        ticket_price = dds[i].xpath('normalize-space(.)').get()
                        if ticket_price:
                            event_data['Ticketvorverkauf'] = ticket_price.strip()
            
            # Extract Bild URL (Image URL)
            # Priority: 1. meta og:image (name), 2. meta og:image (property), 3. div.thumbnail img[data-interchange]
            bild_url = response.css('meta[name="og:image"]::attr(content)').get()
            if not bild_url:
                bild_url = response.css('meta[property="og:image"]::attr(content)').get()
            
            if not bild_url:
                interchange_text = response.css('div.thumbnail img::attr(data-interchange)').get()
                if interchange_text:
                    # Regex to find the first URL in the data-interchange string, e.g., "[URL, small], ..."
                    match = re.search(r'\[(https?://[^,]+),', interchange_text) 
                    if match:
                        bild_url = match.group(1)
            
            if bild_url:
                event_data['Bild'] = response.urljoin(bild_url.strip())
            # If no image found, 'Bild' remains '' due to setdefault
            self.parser_logger.info(f"Processed Bild: {event_data['Bild']}")

            # Extract Beschreibung (Description)
            beschreibung_parts = []
            # Select direct children (p, h2, etc.) of the main description container
            for element in response.css('section.cmp.content div.small-12.cell > *'):
                # Extract all text from the element and its children, then strip whitespace
                text_content = ''.join(element.xpath('.//text()').getall()).strip()
                # Add non-empty text content to our list
                if text_content:
                    beschreibung_parts.append(text_content)
            
            if beschreibung_parts:
                event_data['Beschreibung'] = '\n\n'.join(beschreibung_parts)
            # If no description found, 'Beschreibung' remains '' due to setdefault
            self.parser_logger.info(f"Processed Beschreibung: {event_data.get('Beschreibung', '')[:100]}...")

            # After all processing, add the event data to results
            if event_data.get('Name'): # Ensure there's at least a name
                # Check if we've reached the maximum number of events in test mode
                if self.test_mode and len(self.results) >= self.max_events:
                    self.parser_logger.info(f"Test mode in PARSE_DETAIL: Reached maximum of {self.max_events} events ({len(self.results)}). Current event '{event_data.get('Name')}' will NOT be added. Raising CloseSpider.")
                    raise CloseSpider(reason=f'test_mode_max_events_reached_in_parse_detail: {self.max_events}')
                
                yield event_data
                self.results.append(event_data)
                self.parser_logger.info(f"Event '{event_data.get('Name')}' added to results. Total results: {len(self.results)}")
            else:
                self.parser_logger.warning(f"Event at {response.url} lacked a name after parsing detail page. Not added.")

        except CloseSpider as cs:
            # Re-raise CloseSpider to ensure it's handled by Scrapy's core
            self.parser_logger.info(f"CloseSpider caught in parse_detail: {cs.reason}")
            raise
        except Exception as e:
            self.parser_logger.error(f"Error parsing detail page {response.url}: {str(e)}", exc_info=True)
            # Optionally, re-raise or handle as per spider's error policy
            # If event_data was partially populated, it might still be added if not critical error
            # For now, if an error occurs, we don't add potentially incomplete data from this point.
            pass # Or re-raise e if preferred
    def clean_date_text(self, date_text):
        if not date_text:
            return ""
        # First, remove the specific unwanted phrase (case-insensitive)
        date_text = re.sub(r'\s*in Kalender speichern\s*', '', date_text, flags=re.IGNORECASE)
        # Then, replace newlines with spaces and consolidate multiple whitespace characters into a single space
        date_text = date_text.replace('\n', ' ')
        date_text = re.sub(r'\s+', ' ', date_text).strip()
        return date_text
    
    def process_date(self, date_text):
        """
        Process and format date information according to requirements
        This method is kept for backward compatibility but not used anymore
        as we're now preserving the original date format
        """
        if not date_text:
            return ""
        
        try:
            # Clean up the date text
            date_text = date_text.replace('\n', ' ').strip()
            date_text = re.sub(r'\s+', ' ', date_text)
            
            # Return the cleaned text without further formatting
            return date_text
        except Exception as e:
            # If we can't parse the date, log it and return the raw text
            self.parser_logger.warning(f"Could not process date: {date_text}. Error: {str(e)}")
            return date_text
    
    def format_date(self, date_str):
        """
        Convert date string to DD-MM-YYYY format
        """
        try:
            # Try to detect and convert from DD.MM.YYYY format
            if re.match(r'\d{2}\.\d{2}\.\d{4}', date_str):
                date_obj = datetime.strptime(date_str, "%d.%m.%Y")
                return date_obj.strftime("%d-%m-%Y")
            else:
                # If it's in another format, just return as is
                return date_str
        except Exception as e:
            # If we can't parse the date, return as is
            self.parser_logger.warning(f"Error formatting date {date_str}: {str(e)}")
            return date_str
    
    def closed(self, reason):
        """
        Called when the spider is closed.
        Saves the scraped data to a JSON file.
        """
        self.parser_logger.info(f"Spider closed: {reason}. Total events in self.results: {len(self.results)}")
        # Save the results to a JSON file
        filename = f"saarbruecken_events_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        if self.test_mode:
            filename = f"saarbruecken_events_TEST_{self.max_events}_items_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Ensure results directory exists
        output_dir = "scraped_data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        full_path = os.path.join(output_dir, filename)

        with open(full_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(self.results, jsonfile, ensure_ascii=False, indent=4)
        
        self.parser_logger.info(f"Scraped {len(self.results)} events and saved to {full_path}")


# Run the spider if this script is executed directly
if __name__ == "__main__":
    # BasicConfig for root logger (Scrapy uses its own)
    # logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s') 
    # Our custom logger 'parser_detail_debug' is already configured.

    # Settings for the spider run
    current_test_mode = False
    current_max_events = 30   # Reduced for testing `CloseSpider` behavior
    
    print(f"Configuring CrawlerProcess. test_mode={current_test_mode}, max_events={current_max_events}")
    
    process = CrawlerProcess({
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'DOWNLOAD_DELAY': 1, # Slightly reduced for faster testing, but be mindful of server load
        'AUTOTHROTTLE_ENABLED': True,
        'AUTOTHROTTLE_START_DELAY': 0.5,
        'AUTOTHROTTLE_MAX_DELAY': 3,
        'LOG_LEVEL': 'INFO', # Scrapy's own log level for console
        'DUPEFILTER_DEBUG': True, # Enable dupefilter debugging
        # 'LOG_FILE': None, # To prevent Scrapy from creating its own log file if not desired
    })
    process.crawl(SaarbrueckenEventSpider, test_mode=current_test_mode, max_events=current_max_events)
    process.start()
