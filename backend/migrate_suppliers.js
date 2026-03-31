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

async function migrate() {
    try {
        console.log('Connexion à la base de données...');
        const pool = await sql.connect(config);

        // 1. Ajouter la colonne categorie si elle n'existe pas
        console.log('Ajout de la colonne categorie...');
        try {
            await pool.request().query('ALTER TABLE fournisseurs ADD categorie NVARCHAR(50)');
            console.log('Colonne ajoutée.');
        } catch (e) {
            console.log('La colonne existe peut-être déjà:', e.message);
        }

        // 2. Catégoriser 'Peaux' (ceux liés à receptions_peaux)
        console.log('Catégorisation des fournisseurs de peaux...');
        await pool.request().query(`
            UPDATE f 
            SET categorie = 'Peaux' 
            FROM fournisseurs f
            WHERE EXISTS (SELECT 1 FROM receptions_peaux r WHERE r.fournisseur_id = f.id)
        `);

        // 3. Catégoriser 'Produits Chimiques' (ceux liés à AchatsChimiques)
        console.log('Catégorisation des fournisseurs de produits chimiques...');
        await pool.request().query(`
            UPDATE f 
            SET categorie = 'Produits Chimiques' 
            FROM fournisseurs f
            WHERE EXISTS (SELECT 1 FROM AchatsChimiques a WHERE a.fournisseur = f.nom)
            OR categorie IS NULL
        `);

        console.log('Migration terminée.');

    } catch (err) {
        console.error('Erreur globale:', err);
    } finally {
        await sql.close();
    }
}

migrate();
