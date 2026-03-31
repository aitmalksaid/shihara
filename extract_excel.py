import pandas as pd
import os
import zipfile

excel_path = r'D:\shihara\achatmatierepremiereshihara\omar.xlsm'
output_dir = r'D:\shihara\achatmatierepremiereshihara\extracted'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print(f"Reading {excel_path}...")

# Read sheet names
xl = pd.ExcelFile(excel_path)
print(f"Sheets: {xl.sheet_names}")

for sheet in xl.sheet_names:
    print(f"Processing sheet: {sheet}")
    df = pd.read_excel(excel_path, sheet_name=sheet)
    # Save first 20 rows to csv for inspection
    csv_path = os.path.join(output_dir, f"{sheet}.csv")
    df.head(20).to_csv(csv_path, index=False)
    print(f"Saved {sheet}.csv")

# Try to extract VBA code (if possible via zip)
# .xlsm is a zip file, macros are usually in xl/vbaProject.bin
try:
    with zipfile.ZipFile(excel_path, 'r') as z:
        if 'xl/vbaProject.bin' in z.namelist():
            print("Found vbaProject.bin. Extracting...")
            z.extract('xl/vbaProject.bin', output_dir)
            print("Extracted vbaProject.bin to extracted folder.")
        else:
            print("vbaProject.bin not found.")
except Exception as e:
    print(f"Could not extract zip: {e}")
