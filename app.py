from flask import Flask, jsonify, request, send_file
import pandas as pd
import openpyxl
from openpyxl import load_workbook
import os
from datetime import datetime

app = Flask(__name__, static_folder='public', static_url_path='')

# Use absolute path relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, 'NOVEDADES SEMANALES VEHICULOS SECCION SISTEMAS.xlsx')

def get_sheet_type(sheet_name, df):
    # Determine type based on columns or name
    # Heuristic: Groups have 'ACEITE', Trailers have 'PINES' or similar?
    # Let's look at the columns from the user request
    cols = [c.upper() for c in df.columns]
    
    if any('HORAS' in c for c in cols) or 'ACEITE' in cols:
        return 'grupo'
    elif 'PINES' in cols or 'RUEDAS' in cols or 'GANCHO' in cols:
        return 'remolque'
    else:
        # Default fallback, maybe check sheet name
        return 'grupo'

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/config')
def get_config():
    if not os.path.exists(FILE_PATH):
        return jsonify({"error": "Excel file not found"}), 404
    
    xl = pd.ExcelFile(FILE_PATH)
    sheets = xl.sheet_names
    
    config = []
    for sheet in sheets:
        # Read just the header to guess type
        df = pd.read_excel(FILE_PATH, sheet_name=sheet, nrows=0)
        
        # Clean column names (strip whitespace)
        df.columns = df.columns.str.strip()
        
        type_ = get_sheet_type(sheet, df)
        config.append({"name": sheet, "type": type_})
        
    return jsonify({"sheets": config})

@app.route('/api/submit', methods=['POST'])
def submit_review():
    data = request.json
    sheet_name = data.get('sheetName')
    form_data = data.get('formData')
    
    if not sheet_name or not form_data:
        return jsonify({"error": "Missing data"}), 400
        
    try:
        wb = load_workbook(FILE_PATH)
        if sheet_name not in wb.sheetnames:
             return jsonify({"error": "Sheet not found"}), 404
             
        ws = wb[sheet_name]
        
        # Get headers from first row
        headers = [cell.value for cell in ws[1]]
        headers = [str(h).strip() if h else '' for h in headers]
        
        # Prepare row data
        new_row = []
        for header in headers:
            # Map header to form data key (normalized)
            # The prompt says: "GRUPO": null (in prev json), "FECHA", "HORAS", etc.
            # We need to match the Excel headers exactly.
            
            key = header.upper()
            val = None
            
            # Special logic for FECHA if not provided or auto
            if 'FECHA' in key:
                val = datetime.now().strftime('%Y-%m-%d')
            elif key in form_data:
                val = form_data[key]
            else:
                 # Try to find case-insensitive match
                 for k, v in form_data.items():
                     if k.upper() == key:
                         val = v
                         break
            
            # Use empty string if None to avoid literal "None" in excel
            if val is None:
                val = ""
                
            new_row.append(val)
            
        ws.append(new_row)
        wb.save(FILE_PATH)
        
        return jsonify({"success": True})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download')
def download_file():
    if not os.path.exists(FILE_PATH):
        return jsonify({"error": "File not found"}), 404
    return send_file(FILE_PATH, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
