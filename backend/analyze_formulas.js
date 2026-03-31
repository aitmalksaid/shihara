const xlsx = require('xlsx');
const path = require('path');

const filePath = 'd:\\shihara\\achatmatierepremiereshihara\\LES FOURMULE PRODUCTION.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    console.log('Feuilles disponibles :', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Contenu de la feuille : ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // Afficher les 20 premières lignes pour comprendre la structure
        data.slice(0, 20).forEach((row, index) => {
            console.log(`Ligne ${index}:`, row);
        });
    });
} catch (error) {
    console.error('Erreur lors de la lecture du fichier Excel :', error);
}
