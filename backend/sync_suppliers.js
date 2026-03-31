const sql = require('mssql');
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

async function sync() {
    try {
        console.log('Connexion à la base de données...');
        const pool = await sql.connect(config);

        // 1. Récupérer les fournisseurs uniques des achats chimiques
        console.log('Extraction des fournisseurs depuis AchatsChimiques...');
        const resultAchats = await pool.request().query('SELECT DISTINCT fournisseur FROM AchatsChimiques WHERE fournisseur IS NOT NULL');
        const fournisseursAchats = resultAchats.recordset.map(r => r.fournisseur.trim());

        // 2. Récupérer les fournisseurs existants
        const resultExistants = await pool.request().query('SELECT nom FROM fournisseurs');
        const nomsExistants = new Set(resultExistants.recordset.map(r => r.nom.trim().toUpperCase()));

        console.log(`${fournisseursAchats.length} fournisseurs trouvés dans les achats.`);

        let addedCount = 0;
        for (const nom of fournisseursAchats) {
            if (!nomsExistants.has(nom.toUpperCase())) {
                try {
                    await pool.request()
                        .input('nom', sql.NVarChar, nom)
                        .query('INSERT INTO fournisseurs (nom) VALUES (@nom)');
                    console.log(`Ajouté : ${nom}`);
                    nomsExistants.add(nom.toUpperCase());
                    addedCount++;
                } catch (err) {
                    console.error(`Erreur lors de l'ajout de ${nom}:`, err.message);
                }
            }
        }

        console.log(`Synchronisation terminée. ${addedCount} nouveaux fournisseurs ajoutés.`);

    } catch (err) {
        console.error('Erreur globale:', err);
    } finally {
        await sql.close();
    }
}

sync();
