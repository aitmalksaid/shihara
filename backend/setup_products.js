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

async function createProductsTable() {
    try {
        console.log('Connexion à la base de données...');
        const pool = await sql.connect(config);

        // 1. Créer la table ProduitsChimiques
        console.log('Création de la table ProduitsChimiques...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProduitsChimiques')
            BEGIN
                CREATE TABLE ProduitsChimiques (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    nom NVARCHAR(255) NOT NULL UNIQUE,
                    description NVARCHAR(MAX),
                    type NVARCHAR(50), -- Optionnel: acide, solvant, etc.
                    created_at DATETIME DEFAULT GETDATE()
                );
            END
        `);

        // 2. Extraire les produits uniques de AchatsChimiques
        console.log('Extraction des produits uniques...');
        const result = await pool.request().query(`
            SELECT DISTINCT designation_commande as nom FROM AchatsChimiques WHERE designation_commande IS NOT NULL
            UNION
            SELECT DISTINCT designation_reception as nom FROM AchatsChimiques WHERE designation_reception IS NOT NULL
        `);

        const products = result.recordset.map(r => r.nom.trim()).filter(n => n.length > 0);
        console.log(`${products.length} produits trouvés.`);

        // 3. Insérer les produits
        let count = 0;
        for (const nom of products) {
            try {
                await pool.request()
                    .input('nom', sql.NVarChar, nom)
                    .query('IF NOT EXISTS (SELECT 1 FROM ProduitsChimiques WHERE nom = @nom) INSERT INTO ProduitsChimiques (nom) VALUES (@nom)');
                count++;
            } catch (err) {
                // Ignore errors (like unique constraint)
            }
        }

        console.log(`${count} produits synchronisés.`);

    } catch (err) {
        console.error('Erreur:', err);
    } finally {
        await sql.close();
    }
}

createProductsTable();
