import csv
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin
import json
import re

BASE_URL = "https://einkaufen.saarbruecken.de"
OUTPUT_CSV_FILE = "saarbruecken_shops.csv"
OUTPUT_IMAGE_DIR = "shop_images"

# Create a directory for images if it doesn't exist
if not os.path.exists(OUTPUT_IMAGE_DIR):
    os.makedirs(OUTPUT_IMAGE_DIR)

def get_soup(url):
    """Fetches a URL and returns a BeautifulSoup object."""
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return BeautifulSoup(response.content, "html.parser")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_shop_details(shop_url):
    """Scrapes the details from an individual shop page."""
    print(f"Scraping details from: {shop_url}")
    soup = get_soup(shop_url)
    if not soup:
        return None

    details = {}

    # Extract Name
    name_element = soup.find("div", class_="component-visit-top-bar")
    if name_element and name_element.h1:
        details["Name"] = name_element.h1.text.strip()
    else: 
        name_data_div = soup.find(lambda tag: tag.name == "div" and tag.text.strip() == "Name" and "map-entry-data" in tag.parent.get("class", []))
        if name_data_div and name_data_div.find_next_sibling("div") and name_data_div.find_next_sibling("div").strong:
            details["Name"] = name_data_div.find_next_sibling("div").strong.text.strip()
        else:
            details["Name"] = "null"

    # Extract Categories
    categories = []
    goods_section = soup.find("div", class_="goods")
    if goods_section:
        category_tags = goods_section.find_all("div", class_="component-tag")
        for tag in category_tags:
            if tag.a:
                cat_text = tag.a.text.strip()
                if cat_text:
                    categories.append(cat_text)
    details["Kategorien"] = ", ".join(categories) if categories else "null"

    # Extract Address, Contact (Phone), Website URL
    address = "null"
    phone = "null"
    website_url = "null"
    data_entries = soup.select(".map-holder .data-container .map-entry .map-entry-data")
    for entry in data_entries:
        label_div = entry.find("div")
        value_div = label_div.find_next_sibling("div") if label_div else None
        if label_div and value_div and value_div.strong:
            label_text = label_div.text.strip()
            value_text = value_div.strong.text.strip()
            if label_text == "Adresse": address = value_text
            elif label_text == "Telefon":
                phone_link = value_div.strong.find("a")
                phone = phone_link['href'].replace("tel:", "") if phone_link and phone_link.has_attr('href') else value_text
            elif label_text == "Website":
                website_link = value_div.strong.find("a")
                website_url = website_link['href'] if website_link and website_link.has_attr('href') else value_text
    details["Adresse"] = address
    details["Kontaktinformationen"] = phone
    details["Website URL"] = website_url
    
    # Extract Öffnungszeiten
    opening_hours_str_for_parser = "null"
    opening_hours_list = []
    all_map_entries = soup.select(".map-holder .data-container .map-entry")
    for entry_div in all_map_entries:
        h2_tag = entry_div.find("h2")
        if h2_tag and "Öffnungszeiten" in h2_tag.text:
            opening_hours_data = entry_div.find_all("div", class_="map-entry-data")
            for oh_entry in opening_hours_data:
                day_div = oh_entry.find("div")
                time_div = day_div.find_next_sibling("div") if day_div and day_div.find_next_sibling("div") else None
                if day_div and time_div and time_div.strong:
                    opening_hours_list.append(f"{day_div.text.strip()}: {time_div.strong.text.strip()}")
            if opening_hours_list:
                 opening_hours_str_for_parser = "; ".join(opening_hours_list)
            break
    details["Öffnungszeiten"] = parse_opening_hours(opening_hours_str_for_parser)

    # Extract Description
    description_div = soup.find("div", class_="ump grid-container component-text")
    if description_div and description_div.find("div", class_="cell small-12"):
        text_parts = [text.strip() for text in description_div.find("div", class_="cell small-12").find_all(string=True, recursive=False)]
        full_description = " ".join(filter(None, text_parts)).strip()
        if not full_description:
            for br_tag in description_div.find_all("br"):
                br_tag.replace_with(" ")
            full_description = " ".join(description_div.find("div", class_="cell small-12").get_text(separator=" ").split()).strip()
        details["Beschreibung"] = full_description if full_description else "null"
    else:
        details["Beschreibung"] = "null"

    # Extract Image URLs
    image_urls = []
    gallery_section = soup.find("div", class_="component-company-detail")
    if gallery_section:
        image_links = gallery_section.find_all("a", {"data-rel": lambda x: x and x.startswith("sb-lightbox:imageset")})
        for link in image_links:
            if link.has_attr("href"):
                img_url_relative = link["href"]
                img_url_full = urljoin(BASE_URL, img_url_relative)
                image_urls.append(img_url_full)
    details["Image Source URLs"] = ", ".join(image_urls) if image_urls else "null"
    
    return details

def parse_opening_hours(hours_string):
    """
    Parses a free-form opening hours string and converts it to a structured JSON string.
    Returns a JSON string with all days "Geschlossen" if input is "null" or unparseable.
    """
    if not hours_string or hours_string.lower() == "null" or hours_string == "N/A": # Added N/A for robustness
        return json.dumps({
            "Montag": "Geschlossen", "Dienstag": "Geschlossen", "Mittwoch": "Geschlossen",
            "Donnerstag": "Geschlossen", "Freitag": "Geschlossen", "Samstag": "Geschlossen",
            "Sonntag": "Geschlossen"
        }, ensure_ascii=False)

    days_german = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
    days_map = {day: "Geschlossen" for day in days_german}

    hours_string = hours_string.replace(" Uhr", "").replace(" bis ", "-").replace(" und ", " & ")
    rules = hours_string.split(';')

    for rule in rules:
        rule = rule.strip()
        if not rule: continue

        day_time_match = re.match(r"([^:]+):\s*(.+)", rule)
        if day_time_match:
            days_part = day_time_match.group(1).strip()
            times_part = day_time_match.group(2).strip()

            def normalize_time_value(t_val):
                t_val = t_val.strip()
                if not t_val: return None # Handle empty time values
                try:
                    if '.' in t_val:
                        h, m = t_val.split('.')
                        return f"{int(h):02d}:{int(m):02d}"
                    return f"{int(t_val):02d}:00"
                except ValueError:
                    return None # Problematic time value

            times_formatted_parts = []
            time_slots = times_part.split(' & ')
            valid_slot_found = False
            for slot in time_slots:
                if '-' in slot:
                    start_t_str, end_t_str = slot.split('-', 1)
                    start_t_norm = normalize_time_value(start_t_str)
                    end_t_norm = normalize_time_value(end_t_str)
                    if start_t_norm and end_t_norm:
                        times_formatted_parts.append(f"{start_t_norm} - {end_t_norm}")
                        valid_slot_found = True
                    # else: keep original slot if not parseable? or discard?
                    # For now, if a part of a slot isn't parseable, the slot is skipped
                # else: non-range times are ignored by this logic for now
            
            final_times_str = " und ".join(times_formatted_parts) if valid_slot_found else "Geschlossen"
            if not valid_slot_found and times_part: # If original times_part had something but we couldn't parse it
                final_times_str = times_part # Revert to original times_part if specific parsing failed but there was data

            parsed_days_for_rule = []
            day_names_in_part = [d.strip() for d in re.split(r'[,-]', days_part)]
            
            if '-' in days_part and len(day_names_in_part) == 2:
                start_day_str, end_day_str = day_names_in_part[0], day_names_in_part[1]
                # Check for simple ranges like Mo-Fr, Di-Do
                simple_range = False
                if start_day_str in days_german and end_day_str in days_german:
                    try:
                        start_idx = days_german.index(start_day_str)
                        end_idx = days_german.index(end_day_str)
                        if start_idx <= end_idx:
                            parsed_days_for_rule.extend(days_german[start_idx : end_idx+1])
                            simple_range = True
                    except ValueError: pass
                if not simple_range: # Fallback for complex or misidentified ranges
                     for d_str in day_names_in_part:
                         if d_str in days_german: parsed_days_for_rule.append(d_str)

            else: # Comma separated or single day
                for d_str in day_names_in_part:
                    if d_str in days_german:
                        parsed_days_for_rule.append(d_str)
            
            for day in parsed_days_for_rule:
                days_map[day] = final_times_str if final_times_str else "Geschlossen"

    return json.dumps(days_map, ensure_ascii=False)

def transform_csv_data(input_filepath="saarbruecken_shops.csv", output_filepath="saarbruecken_shops_transformed.csv"):
    """
    Transforms the CSV data:
    - Converts 'Öffnungszeiten' to a structured JSON string.
    - Replaces 'N/A' or 'NULL' with 'null' in other fields.
    - Adds 'Sonstiges' column with 'null' if missing.
    """
    print(f"Starting CSV transformation for {input_filepath}...")
    
    try:
        rows_to_write = []
        with open(input_filepath, mode='r', newline='', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            header = next(reader, None)
            if not header:
                print("CSV is empty or header is missing.")
                return
            
            # Use the original header, do not add/remove Sonstiges here explicitly
            # If Sonstiges was in the old CSV, it will be processed like any other column for N/A -> null
            # If it wasn't, it won't be added.
            # The scraping part now dictates the columns. This function just transforms existing ones.
            final_fieldnames = header
            rows_to_write.append(final_fieldnames)

            for row_list in reader:
                transformed_row = []
                for i, value in enumerate(row_list):
                    # Ensure we don't try to access a fieldname out of bounds if row is shorter than header
                    # (though this shouldn't happen with valid CSVs)
                    current_field = final_fieldnames[i] if i < len(final_fieldnames) else None 
                    
                    if current_field == "Öffnungszeiten":
                        transformed_row.append(parse_opening_hours(value))
                    elif value == "N/A" or value == "NULL":
                        transformed_row.append("null")
                    else:
                        transformed_row.append(value)
                rows_to_write.append(transformed_row)
        
        with open(output_filepath, mode='w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(rows_to_write)
        print(f"Successfully transformed data and saved to {output_filepath}")

    except FileNotFoundError:
        print(f"Error: Input file {input_filepath} not found.")
    except Exception as e:
        print(f"An error occurred during CSV transformation: {e}")

def scrape_all_shops():
    """Main function to scrape all shops from all pages."""
    all_shops_data = []
    
    for page_num in range(1, 42): 
        page_url = urljoin(BASE_URL, f"/shopping?page={page_num}") # Corrected page URL construction
        print(f"Scraping page: {page_url}")
        
        soup = get_soup(page_url)
        if not soup:
            continue

        shop_cards = soup.find_all("div", class_="component-card-image-left")
        
        if not shop_cards:
            print(f"No shop cards found on page {page_num}. Might be the end or an issue.")
            if page_num < 41:
                 print(f"Warning: No shop cards on page {page_num}, but not the last page.")

        for card in shop_cards:
            link_tag = card.find("a", href=True)
            if link_tag:
                shop_detail_path = link_tag["href"]
                shop_detail_url = urljoin(BASE_URL, shop_detail_path)
                
                shop_data = scrape_shop_details(shop_detail_url)
                if shop_data:
                    all_shops_data.append(shop_data)
                else:
                    print(f"Could not retrieve data for shop at {shop_detail_url}")

    if all_shops_data:
        fieldnames = [
            "Name", "Kategorien", "Adresse", "Kontaktinformationen", 
            "Öffnungszeiten", "Website URL", "Beschreibung", "Image Source URLs"
        ]
        with open(OUTPUT_CSV_FILE, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for shop_row in all_shops_data:
                # Ensure all fields are present, defaulting to "null" if a key is missing
                # This is a safeguard, scrape_shop_details should provide all keys
                ordered_row = {field: shop_row.get(field, "null") for field in fieldnames}
                writer.writerow(ordered_row)
        print(f"Successfully wrote {len(all_shops_data)} shops to {OUTPUT_CSV_FILE}")
    else:
        print("No shop data was scraped. CSV file not created.")

if __name__ == "__main__":
    action = input("Do you want to 'scrape' new data or 'transform' an existing CSV? (scrape/transform): ").strip().lower()

    if action == "scrape":
        scrape_all_shops()
        print("\nScraping complete. You might want to run the 'transform' option next if needed,")
        print(f"or if you want to transform the newly scraped file ({OUTPUT_CSV_FILE}), run the script again and choose 'transform'.")
    elif action == "transform":
        input_csv = input(f"Enter the name of the CSV file to transform (default: {OUTPUT_CSV_FILE}): ").strip()
        if not input_csv:
            input_csv = OUTPUT_CSV_FILE
        
        default_output_name = input_csv.replace('.csv', '_transformed.csv')
        if default_output_name == input_csv:
            default_output_name = input_csv.replace('.csv', '_transformed_explicit.csv')

        output_csv = input(f"Enter the name for the transformed output CSV (default: {default_output_name}): ").strip()
        if not output_csv:
            output_csv = default_output_name

        transform_csv_data(input_csv, output_csv)
    else:
        print("Invalid action. Please type 'scrape' or 'transform'.") 