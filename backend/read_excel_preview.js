const xlsx = require('xlsx');
const path = require('path');

// Absolue path to the file as specified by the user
const filePath = 'd:\\shihara\\mesfichiers\\ACHAT PRODUITS CHIMIQUE LOCAL & import.xlsx';

try {
    console.log(`Reading file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);

    console.log('Sheet Names:', workbook.SheetNames);

    // Read the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON (header: 1 means array of arrays, header: 0 or undefined means object with keys from first row)
    // using header: 1 to see the raw structure first
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`\n--- First 5 rows of sheet '${firstSheetName}' ---`);
    if (data.length > 0) {
        data.slice(0, 5).forEach((row, index) => {
            console.log(`Row ${index + 1}:`, JSON.stringify(row));
        });
    } else {
        console.log('Sheet is empty.');
    }

} catch (error) {
    console.error('Error reading the Excel file:', error.message);
}
