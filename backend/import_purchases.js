const xlsx = require('xlsx');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || process.env.DB_HOST,
    database: process.env.DB_DATABASE || process.env.DB_NAME,
    domain: process.env.DB_DOMAIN,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    }
};

const filePath = 'd:\\shihara\\mesfichiers\\ACHAT PRODUITS CHIMIQUE LOCAL & import.xlsx';
const createTableSqlPath = path.join(__dirname, 'create_chemical_purchases_table.sql');

function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
}

function getNum(val) {
    if (typeof val === 'number') return val;
    if (!val) return null;
    const cleaned = String(val).replace(/,/g, '.').replace(/\s/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

function getStr(val) {
    if (val === null || val === undefined) return null;
    return String(val);
}

async function run() {
    try {
        console.log(`Lecture du fichier : ${filePath}`);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        console.log(`Connexion à SQL Server avec succès`);
        const pool = await sql.connect(config);

        // 1. Create Table (Using try-catch to ignore if exists error if script is simple, but we used IF NOT EXISTS in SQL so it's fine)
        if (fs.existsSync(createTableSqlPath)) {
            const tableSql = fs.readFileSync(createTableSqlPath, 'utf8');
            try {
                await pool.request().query(tableSql);
                console.log('Table assurée.');
            } catch (e) {
                console.log('Info table:', e.message);
            }
        }

        console.log(`Début de l'importation ! ${data.length} lignes trouvées.`);
        let insertedCount = 0;

        // Start from row 5 (index 4)
        for (let i = 4; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const type_achat = row[0];
            if (!type_achat || (type_achat !== 'IMPORT' && !String(type_achat).toUpperCase().includes('LOCAL'))) continue;

            const fournisseur = row[1];

            const date_commande = excelDateToJSDate(row[2]);
            const num_commande = row[3];
            const designation_commande = row[4];
            const qte_commande = getNum(row[5]);

            const date_reception = excelDateToJSDate(row[6]);
            const num_reception = row[7];
            const designation_reception = row[8];
            const qte_reception = getNum(row[9]);
            const pu_reception = getNum(row[10]);
            const ht_mad_reception = getNum(row[11]);

            const num_facture = row[12];
            const date_facture = excelDateToJSDate(row[13]);
            const designation_facture = row[14];
            const qte_facture = getNum(row[15]);

            const pu_euro = getNum(row[16]);
            const montant_euro = getNum(row[17]);
            const taux_change = getNum(row[18]);

            const pu_mad_facture = getNum(row[19]);
            const ht_facture = getNum(row[20]);
            const tva_transport = getNum(row[21]);
            const ttc = getNum(row[22]);

            const decharge = getNum(row[23]);
            const transport_supp = getNum(row[24]);
            const echange = getNum(row[25]);
            const transit = getNum(row[26]);
            const surestaries = getNum(row[27]);
            const magasinage = getNum(row[28]);

            try {
                const request = pool.request();
                request.input('type_achat', sql.NVarChar, getStr(type_achat));
                request.input('fournisseur', sql.NVarChar, getStr(fournisseur));

                request.input('date_commande', sql.Date, date_commande);
                request.input('num_commande', sql.NVarChar, getStr(num_commande));
                request.input('designation_commande', sql.NVarChar, getStr(designation_commande));
                request.input('qte_commande', sql.Float, qte_commande);

                request.input('date_reception', sql.Date, date_reception);
                request.input('num_reception', sql.NVarChar, getStr(num_reception));
                request.input('designation_reception', sql.NVarChar, getStr(designation_reception));
                request.input('qte_reception', sql.Float, qte_reception);
                request.input('pu_reception', sql.Float, pu_reception);
                request.input('ht_mad_reception', sql.Float, ht_mad_reception);

                request.input('num_facture', sql.NVarChar, getStr(num_facture));
                request.input('date_facture', sql.Date, date_facture);
                request.input('designation_facture', sql.NVarChar, getStr(designation_facture));
                request.input('qte_facture', sql.Float, qte_facture);

                request.input('pu_euro', sql.Float, pu_euro);
                request.input('montant_euro', sql.Float, montant_euro);
                request.input('taux_change', sql.Float, taux_change);

                request.input('pu_mad_facture', sql.Float, pu_mad_facture);
                request.input('ht_facture', sql.Float, ht_facture);
                request.input('tva_transport', sql.Float, tva_transport);
                request.input('ttc', sql.Float, ttc);

                request.input('decharge', sql.Float, decharge);
                request.input('transport_supp', sql.Float, transport_supp);
                request.input('echange', sql.Float, echange);
                request.input('transit', sql.Float, transit);
                request.input('surestaries', sql.Float, surestaries);
                request.input('magasinage', sql.Float, magasinage);

                const query = `
                    INSERT INTO AchatsChimiques (
                        type_achat, fournisseur,
                        date_commande, num_commande, designation_commande, qte_commande,
                        date_reception, num_reception, designation_reception, qte_reception, pu_reception, ht_mad_reception,
                        num_facture, date_facture, designation_facture, qte_facture,
                        pu_euro, montant_euro, taux_change,
                        pu_mad_facture, ht_facture, tva_transport, ttc,
                        decharge, transport_supp, echange, transit, surestaries, magasinage
                    ) VALUES (
                        @type_achat, @fournisseur,
                        @date_commande, @num_commande, @designation_commande, @qte_commande,
                        @date_reception, @num_reception, @designation_reception, @qte_reception, @pu_reception, @ht_mad_reception,
                        @num_facture, @date_facture, @designation_facture, @qte_facture,
                        @pu_euro, @montant_euro, @taux_change,
                        @pu_mad_facture, @ht_facture, @tva_transport, @ttc,
                        @decharge, @transport_supp, @echange, @transit, @surestaries, @magasinage
                    )
                `;

                await request.query(query);
                insertedCount++;
                if (insertedCount % 10 === 0) console.log(`${insertedCount} lignes importées.`);
            } catch (rowErr) {
                console.error(`Erreur ligne ${i} (Fourn: ${fournisseur}):`, rowErr.message);
            }
        }

        console.log(`Importation terminée ! ${insertedCount} lignes insérées.`);

    } catch (err) {
        console.error('Erreur globale:', err);
    } finally {
        await sql.close();
    }
}

run();
