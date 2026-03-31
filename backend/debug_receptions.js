const { poolPromise, sql } = require('./db');

async function checkPendingReceptions() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, fournisseur_id, reference_suivi, numero_entree, facture_id, facture_generee FROM receptions_peaux');
        console.log('--- TOUTES LES RECEPTIONS ---');
        console.table(result.recordset);

        const pending = await pool.request().query(`
            SELECT id, fournisseur_id, reference_suivi, numero_entree, facture_id, facture_generee
            FROM receptions_peaux
            WHERE facture_id IS NULL 
               OR facture_generee = 0 
               OR facture_generee IS NULL
        `);
        console.log('--- RECEPTIONS NON FACTUREES (Query Backend) ---');
        console.table(pending.recordset);

        const suppliers = await pool.request().query('SELECT id, nom FROM fournisseurs');
        console.log('--- FOURNISSEURS ---');
        console.table(suppliers.recordset);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkPendingReceptions();
