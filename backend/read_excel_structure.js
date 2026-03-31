const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../mesfichiers/ACHAT PRODUITS CHIMIQUE LOCAL & import.xlsx');
console.log(`Reading file: ${filePath}`);

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert first few rows to JSON to see structure
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, limit: 10 });
    
    console.log(`Sheet Name: ${sheetName}`);
    console.log('--- Structure (First 10 rows) ---');
    console.log(JSON.stringify(data, null, 2));

} catch (error) {
    console.error('Error reading Excel file:', error);
}
