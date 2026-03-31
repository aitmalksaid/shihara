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

async function cleanup() {
    try {
        console.log('Connexion à la base de données...');
        const pool = await sql.connect(config);

        console.log('Récupération et filtrage des produits...');

        // On récupère tout pour filtrer en JS ce qui est plus sûr si ISNUMERIC pose problème selon la version SQL
        const result = await pool.request().query('SELECT id, nom FROM ProduitsChimiques');

        let deletedCount = 0;
        for (const prod of result.recordset) {
            const nom = prod.nom.trim();
            const isInvalid =
                nom.length < 3 ||
                nom.includes('²') ||
                /^\d+$/.test(nom.replace(/\s/g, '')) || // Purement numérique
                nom === 'null' ||
                nom === 'undefined';

            if (isInvalid) {
                await pool.request().input('id', sql.Int, prod.id).query('DELETE FROM ProduitsChimiques WHERE id = @id');
                deletedCount++;
                console.log(`Supprimé : "${nom}"`);
            }
        }

        console.log(`Nettoyage terminé. ${deletedCount} produits supprimés.`);

    } catch (err) {
        console.error('Erreur:', err);
    } finally {
        await sql.close();
    }
}

cleanup();
