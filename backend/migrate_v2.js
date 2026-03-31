const { poolPromise } = require('./db');
const sql = require('mssql');

async function createTables() {
    try {
        const pool = await poolPromise;
        console.log('Vérification et création des tables de production...');

        // Table Recettes
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recettes')
            BEGIN
                CREATE TABLE Recettes (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    nom NVARCHAR(100) NOT NULL,
                    description NVARCHAR(MAX),
                    created_at DATETIME DEFAULT GETDATE()
                );
            END
        `);

        // Table IngredientsRecette
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IngredientsRecette')
            BEGIN
                CREATE TABLE IngredientsRecette (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    recette_id INT FOREIGN KEY REFERENCES Recettes(id) ON DELETE CASCADE,
                    produit_nom NVARCHAR(255) NOT NULL,
                    pourcentage FLOAT NOT NULL,
                    created_at DATETIME DEFAULT GETDATE()
                );
            END
        `);

        // Table Productions
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Productions')
            BEGIN
                CREATE TABLE Productions (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    recette_id INT FOREIGN KEY REFERENCES Recettes(id),
                    date_production DATE DEFAULT GETDATE(),
                    poids_base FLOAT NOT NULL,
                    nb_peaux INT,
                    commentaire NVARCHAR(MAX),
                    created_at DATETIME DEFAULT GETDATE()
                );
            END
        `);

        console.log('Tables créées ou déjà existantes.');

        // Insertion des données par défaut
        console.log('Insertion des recettes par défaut...');

        const recipes = [
            {
                nom: 'PH 1 - Rivier',
                desc: 'Phase de préparation (Rivier)',
                ingredients: [
                    ['BICARBONATE', 0.004], ['CARBONATE', 0.004], ['CHAUX', 0.045],
                    ['NOVASOAP SE', 0.0075], ['NOVALIME N', 0.03], ['NOVADECAL', 0.002],
                    ['NOVATEN BA', 0.004], ['NOVACIDE FXL', 0.005], ['SEL', 0.01], ['SULFURE', 0.036]
                ]
            },
            {
                nom: 'PH 2 - Tannage',
                desc: 'Phase de tannage',
                ingredients: [
                    ['ACIDE FORMIQUE', 0.0091], ['ACIDE SULFIRIQUE', 0.016], ['METABISULFITE', 0.003],
                    ['CHAUX', 0.003], ['CHROME', 0.07], ['FORMIATE', 0.013],
                    ['NOVASOAP SE', 0.0065], ['NOVADECAL', 0.03]
                ]
            },
            {
                nom: 'PH 3 - Noir',
                desc: 'Retannage couleur Noir',
                ingredients: [
                    ['ACIDE FORMIQUE', 0.076], ['BICARBONATE SODUIM', 0.013], ['NOIR LG (STG)', 0.0425],
                    ['CHROME', 0.05], ['FARINE', 0.03], ['FORMIATE DE SODIUM', 0.025]
                ]
            }
        ];

        for (const r of recipes) {
            const check = await pool.request().input('nom', r.nom).query('SELECT id FROM Recettes WHERE nom = @nom');
            if (check.recordset.length === 0) {
                const res = await pool.request()
                    .input('nom', r.nom)
                    .input('desc', r.desc)
                    .query('INSERT INTO Recettes (nom, description) OUTPUT INSERTED.id VALUES (@nom, @desc)');

                const rId = res.recordset[0].id;
                for (const [p, pct] of r.ingredients) {
                    await pool.request()
                        .input('rId', rId)
                        .input('p', p)
                        .input('pct', pct)
                        .query('INSERT INTO IngredientsRecette (recette_id, produit_nom, pourcentage) VALUES (@rId, @p, @pct)');
                }
                console.log(`Recette insérée: ${r.nom}`);
            }
        }

        console.log('Migration terminée.');
        process.exit(0);
    } catch (err) {
        console.error('Erreur migration:', err);
        process.exit(1);
    }
}

createTables();
