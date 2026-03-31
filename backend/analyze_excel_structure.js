const xlsx = require('xlsx');

const filePath = 'd:\\shihara\\mesfichiers\\ACHAT PRODUITS CHIMIQUE LOCAL & import.xlsx';

// CONFIGURATION DU FILTRE
const filter = {
    day: null,    // null pour ignorer
    month: null,  // null pour ignorer (1-12)
    year: 2025    // null pour ignorer
};

function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
}

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const headerRowIndex = 3;
    const header = rawData[headerRowIndex];

    console.log('--- Configuration du Filtre ---');
    console.log(JSON.stringify(filter));
    console.log('\n--- En-têtes (Ligne 4) ---');
    console.log(JSON.stringify(header));

    let importCount = 0;
    let localCount = 0;
    const importExample = [];
    const localExample = [];

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        const type = row[0];

        // Date handling (assuming date is in column 2, 6 or 13)
        const dateSerial = row[2] || row[6] || row[13];
        const date = excelDateToJSDate(dateSerial);

        if (date) {
            const d = date.getDate();
            const m = date.getMonth() + 1;
            const y = date.getFullYear();

            if (filter.year && y !== filter.year) continue;
            if (filter.month && m !== filter.month) continue;
            if (filter.day && d !== filter.day) continue;
        } else if (filter.year || filter.month || filter.day) {
            // Si on a un filtre mais pas de date sur la ligne, on ignore
            continue;
        }

        if (type === 'IMPORT') {
            if (importCount < 5) {
                importExample.push(row);
                importCount++;
            }
        } else if (type === 'LOCAL' || (typeof type === 'string' && type.toUpperCase().includes('LOCAL'))) {
            if (localCount < 5) {
                localExample.push(row);
                localCount++;
            }
        }
    }

    console.log(`\n--- Résultats Filtrés (${importCount} Import, ${localCount} Local) ---`);

    console.log('\n--- Exemple IMPORT ---');
    importExample.forEach(r => console.log(JSON.stringify(r)));

    console.log('\n--- Exemple LOCAL ---');
    localExample.forEach(r => console.log(JSON.stringify(r)));

    if (workbook.SheetNames.length > 1) {
        console.log(`\n--- Autres feuilles: ${workbook.SheetNames.slice(1).join(', ')} ---`);
    }

} catch (error) {
    console.error('Erreur:', error.message);
}

