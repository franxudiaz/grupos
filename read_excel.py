import pandas as pd
import json
import os

file_path = 'NOVEDADES SEMANALES VEHICULOS SECCION SISTEMAS.xlsx'

if not os.path.exists(file_path):
    print(f"Error: File '{file_path}' not found.")
    exit(1)

try:
    # Read the excel file
    df = pd.read_excel(file_path)
    
    # Convert to JSON record string and print
    json_str = df.to_json(orient='records', date_format='iso')
    print(json_str)

except Exception as e:
    print(f"Error reading excel file: {e}")
