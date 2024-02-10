import csv
import json

# Step 1: Read the CSV File
csv_file_path = 'EHS_Class.csv'  # Replace with your CSV file path

# Step 2: Parse CSV Content
data = []
with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
    csv_reader = csv.DictReader(csvfile)
    for row in csv_reader:
        data.append(row)

# Step 3: Convert to JSON
json_data = json.dumps(data, indent=4)

# Step 4 (Optional): Save JSON to File
json_file_path = 'your_file.json'  # Replace with your desired JSON file path
with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
    jsonfile.write(json_data)

# Printing JSON data (optional)
print(json_data)
