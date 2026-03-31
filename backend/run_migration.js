const { poolPromise, sql } = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const pool = await poolPromise;
        const sqlScript = fs.readFileSync(path.join(__dirname, 'add_receptions.sql'), 'utf8');

        // Split by GO and remove USE (pool is already connected to the right DB)
        const commands = sqlScript
            .replace(/USE TeintureMarocaine;\s*GO/gi, '')
            .split(/\bGO\b/i);

        for (let command of commands) {
            if (command.trim()) {
                console.log('Exécution de la commande...');
                await pool.request().query(command);
            }
        }

        console.log('Migration terminée avec succès.');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la migration:', err);
        process.exit(1);
    }
}

runMigration();
