const { poolPromise } = require('./db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        const pool = await poolPromise;
        const sqlPath = path.join(__dirname, 'create_consumptions_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Exécution de la migration...');
        // Split by GO if necessary, but mssql-node doesn't support GO. 
        // I'll remove GO and run as single query or split.
        const queries = sql.split(/GO/i);

        for (let query of queries) {
            if (query.trim()) {
                await pool.request().query(query);
            }
        }

        console.log('Migration terminée avec succès.');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la migration:', err);
        process.exit(1);
    }
}

migrate();
