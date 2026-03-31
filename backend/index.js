const express = require('express');
const cors = require('cors');
const { poolPromise, sql } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend API de Gestion de Teinture est en ligne.');
});

// Routes pour les clients
app.get('/api/clients', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM clients ORDER BY nom');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const { nom, prenom, telephone, email, adresse } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('nom', nom)
            .input('prenom', prenom)
            .input('telephone', telephone)
            .input('email', email)
            .input('adresse', adresse)
            .query('INSERT INTO clients (nom, prenom, telephone, email, adresse) VALUES (@nom, @prenom, @telephone, @email, @adresse)');
        res.status(201).json({ message: 'Client créé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, telephone, email, adresse } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .input('nom', nom)
            .input('prenom', prenom)
            .input('telephone', telephone)
            .input('email', email)
            .input('adresse', adresse)
            .query('UPDATE clients SET nom=@nom, prenom=@prenom, telephone=@telephone, email=@email, adresse=@adresse WHERE id=@id');
        res.json({ message: 'Client mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .query('DELETE FROM clients WHERE id=@id');
        res.json({ message: 'Client supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les teintures
app.get('/api/teintures', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM teintures ORDER BY nom');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/teintures', async (req, res) => {
    try {
        const { nom, description, prix_unitaire, delai_traitement } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('nom', nom)
            .input('description', description)
            .input('prix_unitaire', prix_unitaire)
            .input('delai_traitement', delai_traitement)
            .query('INSERT INTO teintures (nom, description, prix_unitaire, delai_traitement) VALUES (@nom, @description, @prix_unitaire, @delai_traitement)');
        res.status(201).json({ message: 'Teinture créée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/teintures/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description, prix_unitaire, delai_traitement } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .input('nom', nom)
            .input('description', description)
            .input('prix_unitaire', prix_unitaire)
            .input('delai_traitement', delai_traitement)
            .query('UPDATE teintures SET nom=@nom, description=@description, prix_unitaire=@prix_unitaire, delai_traitement=@delai_traitement WHERE id=@id');
        res.json({ message: 'Teinture mise à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/teintures/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM teintures WHERE id=@id');
        res.json({ message: 'Teinture supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les couleurs
app.get('/api/couleurs', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM couleurs ORDER BY nom');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/couleurs', async (req, res) => {
    try {
        const { nom, code_hex, description } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('nom', nom)
            .input('code_hex', code_hex)
            .input('description', description)
            .query('INSERT INTO couleurs (nom, code_hex, description) VALUES (@nom, @code_hex, @description)');
        res.status(201).json({ message: 'Couleur créée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/couleurs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, code_hex, description } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .input('nom', nom)
            .input('code_hex', code_hex)
            .input('description', description)
            .query('UPDATE couleurs SET nom=@nom, code_hex=@code_hex, description=@description WHERE id=@id');
        res.json({ message: 'Couleur mise à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/couleurs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM couleurs WHERE id=@id');
        res.json({ message: 'Couleur supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les commandes
app.get('/api/commandes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom 
            FROM commandes c
            LEFT JOIN clients cl ON c.client_id = cl.id
            ORDER BY c.date_commande DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/commandes', async (req, res) => {
    try {
        const { client_id, date_commande, date_livraison_prevue, statut, articles } = req.body;
        const pool = await poolPromise;

        // Insertion de la commande
        const result = await pool.request()
            .input('client_id', client_id)
            .input('date_commande', date_commande)
            .input('date_livraison_prevue', date_livraison_prevue)
            .input('statut', statut)
            .query('INSERT INTO commandes (client_id, date_commande, date_livraison_prevue, statut) OUTPUT INSERTED.id VALUES (@client_id, @date_commande, @date_livraison_prevue, @statut)');

        const commandeId = result.recordset[0].id;

        // Insertion des articles
        if (articles && articles.length > 0) {
            for (let article of articles) {
                await pool.request()
                    .input('commande_id', commandeId)
                    .input('teinture_id', article.teinture_id)
                    .input('couleur_id', article.couleur_id)
                    .input('quantite', article.quantite)
                    .input('instructions', article.instructions)
                    .query('INSERT INTO articles_commande (commande_id, teinture_id, couleur_id, quantite, instructions) VALUES (@commande_id, @teinture_id, @couleur_id, @quantite, @instructions)');
            }
        }

        res.status(201).json({ message: 'Commande créée', id: commandeId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/commandes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { client_id, date_commande, date_livraison_prevue, statut, articles } = req.body;
        const pool = await poolPromise;

        // Mise à jour de la commande
        await pool.request()
            .input('id', id)
            .input('client_id', client_id)
            .input('date_commande', date_commande)
            .input('date_livraison_prevue', date_livraison_prevue)
            .input('statut', statut)
            .query('UPDATE commandes SET client_id=@client_id, date_commande=@date_commande, date_livraison_prevue=@date_livraison_prevue, statut=@statut WHERE id=@id');

        // Mise à jour des articles (suppression puis ré-insertion)
        await pool.request().input('id', id).query('DELETE FROM articles_commande WHERE commande_id=@id');

        if (articles && articles.length > 0) {
            for (let article of articles) {
                await pool.request()
                    .input('commande_id', id)
                    .input('teinture_id', article.teinture_id)
                    .input('couleur_id', article.couleur_id)
                    .input('quantite', article.quantite)
                    .input('instructions', article.instructions)
                    .query('INSERT INTO articles_commande (commande_id, teinture_id, couleur_id, quantite, instructions) VALUES (@commande_id, @teinture_id, @couleur_id, @quantite, @instructions)');
            }
        }

        res.json({ message: 'Commande mise à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/commandes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM articles_commande WHERE commande_id=@id');
        await pool.request().input('id', id).query('DELETE FROM commandes WHERE id=@id');
        res.json({ message: 'Commande supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/commandes/:id/articles', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request().input('id', id).query('SELECT * FROM articles_commande WHERE commande_id=@id');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les fournisseurs
app.get('/api/fournisseurs', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT f.* 
            FROM fournisseurs f
            LEFT JOIN receptions_peaux r ON f.id = r.fournisseur_id
            WHERE f.categorie = 'Peaux' OR r.id IS NOT NULL
            ORDER BY f.nom
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/fournisseurs/avec-receptions-pendantes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT f.* 
            FROM fournisseurs f
            JOIN receptions_peaux r ON f.id = r.fournisseur_id
            WHERE r.facture_id IS NULL OR r.facture_generee = 0
            ORDER BY f.nom
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/fournisseurs', async (req, res) => {
    try {
        const { nom, telephone, email, cin, categorie, code } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('nom', nom)
            .input('telephone', telephone)
            .input('email', email)
            .input('cin', cin)
            .input('categorie', categorie || 'Autre')
            .input('code', code || null)
            .query('INSERT INTO fournisseurs (nom, telephone, email, cin, categorie, code) VALUES (@nom, @telephone, @email, @cin, @categorie, @code)');
        res.status(201).json({ message: 'Fournisseur créé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/fournisseurs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, telephone, email, cin, categorie, code } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .input('nom', nom)
            .input('telephone', telephone)
            .input('email', email)
            .input('cin', cin)
            .input('categorie', categorie)
            .input('code', code || null)
            .query('UPDATE fournisseurs SET nom=@nom, telephone=@telephone, email=@email, cin=@cin, categorie=@categorie, code=@code WHERE id=@id');
        res.json({ message: 'Fournisseur mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/fournisseurs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM fournisseurs WHERE id=@id');
        res.json({ message: 'Fournisseur supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les réceptions de peaux
app.get('/api/receptions/non-facturees', async (req, res) => {
    try {
        console.log('GET /api/receptions/non-facturees - Fetching all non-invoiced...');
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT r.*, f.nom as fournisseur_nom, f.cin as fournisseur_cin
                FROM receptions_peaux r 
                JOIN fournisseurs f ON r.fournisseur_id = f.id
                WHERE r.facture_id IS NULL 
                   OR r.facture_generee = 0 
                   OR r.facture_generee IS NULL
                ORDER BY f.nom, r.date_reception DESC
            `);
        console.log(`GET /api/receptions/non-facturees - Found ${result.recordset.length} items.`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /api/receptions/non-facturees:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/receptions/non-facturees/:fournisseurId', async (req, res) => {
    try {
        const { fournisseurId } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('fournisseur_id', fournisseurId)
            .query(`
                SELECT r.*, f.nom as fournisseur_nom, f.cin as fournisseur_cin
                FROM receptions_peaux r
                JOIN fournisseurs f ON r.fournisseur_id = f.id
                WHERE r.fournisseur_id=@fournisseur_id 
                  AND (r.facture_id IS NULL OR r.facture_generee = 0 OR r.facture_generee IS NULL)
                ORDER BY r.date_reception DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/receptions', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.*, f.nom as fournisseur_nom, f.cin as fournisseur_cin, (r.poids_kg * r.prix_unitaire_kg) as montant_total
            FROM receptions_peaux r
            JOIN fournisseurs f ON r.fournisseur_id = f.id
            ORDER BY r.date_reception DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/receptions', async (req, res) => {
    try {
        console.log('POST /api/receptions - Body:', req.body);
        const { fournisseur_id, reference_suivi, numero_entree, type_peau, nombre_peaux, ecart, poids_kg, prix_unitaire_kg, date_reception, nb_a, nb_b, nb_c, nb_tr, poids_a, poids_b, poids_c, poids_tr, prix_a, prix_b, prix_c, prix_tr } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('fournisseur_id', sql.Int, fournisseur_id)
            .input('reference_suivi', sql.NVarChar, reference_suivi)
            .input('numero_entree', sql.NVarChar, numero_entree || null)
            .input('type_peau', sql.NVarChar, type_peau || 'Mixed')
            .input('nombre_peaux', sql.Int, nombre_peaux || null)
            .input('ecart', sql.NVarChar, ecart || null)
            .input('poids_kg', sql.Decimal(18, 2), poids_kg)
            .input('prix_unitaire_kg', sql.Decimal(18, 2), prix_unitaire_kg || 6.00)
            .input('date_reception', sql.DateTime, date_reception ? new Date(date_reception) : new Date())
            .input('nb_a', sql.Int, nb_a || 0)
            .input('nb_b', sql.Int, nb_b || 0)
            .input('nb_c', sql.Int, nb_c || 0)
            .input('nb_tr', sql.Int, nb_tr || 0)
            .input('poids_a', sql.Decimal(18, 2), poids_a || 0)
            .input('poids_b', sql.Decimal(18, 2), poids_b || 0)
            .input('poids_c', sql.Decimal(18, 2), poids_c || 0)
            .input('poids_tr', sql.Decimal(18, 2), poids_tr || 0)
            .input('prix_a', sql.Decimal(18, 2), prix_a || 0)
            .input('prix_b', sql.Decimal(18, 2), prix_b || 0)
            .input('prix_c', sql.Decimal(18, 2), prix_c || 0)
            .input('prix_tr', sql.Decimal(18, 2), prix_tr || 0)
            .query('INSERT INTO receptions_peaux (fournisseur_id, reference_suivi, numero_entree, type_peau, nombre_peaux, ecart, poids_kg, prix_unitaire_kg, date_reception, nb_a, nb_b, nb_c, nb_tr, poids_a, poids_b, poids_c, poids_tr, prix_a, prix_b, prix_c, prix_tr) VALUES (@fournisseur_id, @reference_suivi, @numero_entree, @type_peau, @nombre_peaux, @ecart, @poids_kg, @prix_unitaire_kg, @date_reception, @nb_a, @nb_b, @nb_c, @nb_tr, @poids_a, @poids_b, @poids_c, @poids_tr, @prix_a, @prix_b, @prix_c, @prix_tr)');

        console.log('POST /api/receptions - Rows affected:', result.rowsAffected);
        res.status(201).json({ message: 'Réception enregistrée', rowsAffected: result.rowsAffected });
    } catch (err) {
        console.error('Error in POST /api/receptions:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/receptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`PUT /api/receptions/${id} - Body:`, req.body);
        const { fournisseur_id, reference_suivi, numero_entree, type_peau, nombre_peaux, ecart, poids_kg, prix_unitaire_kg, date_reception, statut_paiement, facture_generee, nb_a, nb_b, nb_c, nb_tr, poids_a, poids_b, poids_c, poids_tr, prix_a, prix_b, prix_c, prix_tr } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('fournisseur_id', sql.Int, fournisseur_id)
            .input('reference_suivi', sql.NVarChar, reference_suivi)
            .input('numero_entree', sql.NVarChar, numero_entree || null)
            .input('type_peau', sql.NVarChar, type_peau || 'Mixed')
            .input('nombre_peaux', sql.Int, nombre_peaux || null)
            .input('ecart', sql.NVarChar, ecart || null)
            .input('poids_kg', sql.Decimal(18, 2), poids_kg)
            .input('prix_unitaire_kg', sql.Decimal(18, 2), prix_unitaire_kg)
            .input('date_reception', sql.DateTime, new Date(date_reception))
            .input('statut_paiement', sql.NVarChar, statut_paiement)
            .input('facture_generee', sql.Bit, facture_generee)
            .input('nb_a', sql.Int, nb_a || 0)
            .input('nb_b', sql.Int, nb_b || 0)
            .input('nb_c', sql.Int, nb_c || 0)
            .input('nb_tr', sql.Int, nb_tr || 0)
            .input('poids_a', sql.Decimal(18, 2), poids_a || 0)
            .input('poids_b', sql.Decimal(18, 2), poids_b || 0)
            .input('poids_c', sql.Decimal(18, 2), poids_c || 0)
            .input('poids_tr', sql.Decimal(18, 2), poids_tr || 0)
            .input('prix_a', sql.Decimal(18, 2), prix_a || 0)
            .input('prix_b', sql.Decimal(18, 2), prix_b || 0)
            .input('prix_c', sql.Decimal(18, 2), prix_c || 0)
            .input('prix_tr', sql.Decimal(18, 2), prix_tr || 0)
            .query('UPDATE receptions_peaux SET fournisseur_id=@fournisseur_id, reference_suivi=@reference_suivi, numero_entree=@numero_entree, type_peau=@type_peau, nombre_peaux=@nombre_peaux, ecart=@ecart, poids_kg=@poids_kg, prix_unitaire_kg=@prix_unitaire_kg, date_reception=@date_reception, statut_paiement=@statut_paiement, facture_generee=@facture_generee, nb_a=@nb_a, nb_b=@nb_b, nb_c=@nb_c, nb_tr=@nb_tr, poids_a=@poids_a, poids_b=@poids_b, poids_c=@poids_c, poids_tr=@poids_tr, prix_a=@prix_a, prix_b=@prix_b, prix_c=@prix_c, prix_tr=@prix_tr WHERE id=@id');

        console.log(`PUT /api/receptions/${id} - Rows affected:`, result.rowsAffected);
        res.json({ message: 'Réception mise à jour', rowsAffected: result.rowsAffected });
    } catch (err) {
        console.error(`Error in PUT /api/receptions/${req.params.id}:`, err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/receptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request().input('id', id).query('SELECT * FROM receptions_peaux WHERE id=@id');
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Factures Fournisseurs
app.get('/api/factures-fournisseurs', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT f.*, fr.nom as fournisseur_nom, fr.cin as fournisseur_cin FROM factures_fournisseurs f JOIN fournisseurs fr ON f.fournisseur_id = fr.id ORDER BY f.created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/factures-fournisseurs', async (req, res) => {
    try {
        const { fournisseur_id, numero_facture, date_facture, montant_total, reception_ids } = req.body;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const result = await transaction.request()
                .input('fournisseur_id', fournisseur_id)
                .input('numero_facture', numero_facture)
                .input('date_facture', date_facture)
                .input('montant_total', montant_total)
                .query('INSERT INTO factures_fournisseurs (fournisseur_id, numero_facture, date_facture, montant_total) OUTPUT INSERTED.id VALUES (@fournisseur_id, @numero_facture, @date_facture, @montant_total)');

            const factureId = result.recordset[0].id;

            if (reception_ids && reception_ids.length > 0) {
                // Mettre à jour les réceptions pour les lier à cette facture
                const idsString = reception_ids.join(',');
                await transaction.request()
                    .input('facture_id', factureId)
                    .query(`UPDATE receptions_peaux SET facture_id=@facture_id, facture_generee=1 WHERE id IN (${idsString})`);
            }

            await transaction.commit();
            res.status(201).json({ message: 'Facture créée', id: factureId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/factures-fournisseurs/:id/statut', async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .input('statut', statut)
            .query('UPDATE factures_fournisseurs SET statut=@statut WHERE id=@id');
        res.json({ message: 'Statut de la facture mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/factures-fournisseurs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // 1. Délier les réceptions
            await transaction.request()
                .input('facture_id', id)
                .query('UPDATE receptions_peaux SET facture_id = NULL, facture_generee = 0 WHERE facture_id = @facture_id');

            // 2. Supprimer la facture
            await transaction.request()
                .input('id', id)
                .query('DELETE FROM factures_fournisseurs WHERE id = @id');

            await transaction.commit();
            res.json({ message: 'Facture supprimée et réceptions déliées avec succès.' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/factures-fournisseurs/:id/receptions', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('facture_id', id)
            .query('SELECT * FROM receptions_peaux WHERE facture_id=@facture_id ORDER BY date_reception DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/api/receptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM receptions_peaux WHERE id=@id');
        res.json({ message: 'Réception supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les achats de produits chimiques
app.get('/api/achats-chimiques', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM AchatsChimiques ORDER BY date_commande DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/achats-chimiques', async (req, res) => {
    try {
        const pool = await poolPromise;
        const data = req.body;
        const request = pool.request();

        // Dynamic mapping of body to inputs
        Object.keys(data).forEach(key => {
            request.input(key, data[key]);
        });

        const columns = Object.keys(data).join(', ');
        const values = Object.keys(data).map(key => `@${key}`).join(', ');

        const query = `INSERT INTO AchatsChimiques (${columns}) VALUES (${values})`;
        await request.query(query);
        res.status(201).json({ message: 'Achat créé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/achats-chimiques/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const data = req.body;
        const request = pool.request();
        request.input('id', id);

        const updates = Object.keys(data).map(key => {
            request.input(key, data[key]);
            return `${key} = @${key}`;
        }).join(', ');

        const query = `UPDATE AchatsChimiques SET ${updates} WHERE id = @id`;
        await request.query(query);
        res.json({ message: 'Achat mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/achats-chimiques/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM AchatsChimiques WHERE id = @id');
        res.json({ message: 'Achat supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les produits chimiques (Désignations)
app.get('/api/produits-chimiques', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ProduitsChimiques ORDER BY nom');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/produits-chimiques', async (req, res) => {
    try {
        const { nom, seuil_min } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('nom', nom)
            .input('seuil', seuil_min || 0)
            .query('IF NOT EXISTS (SELECT 1 FROM ProduitsChimiques WHERE nom = @nom) INSERT INTO ProduitsChimiques (nom, seuil_min) VALUES (@nom, @seuil)');
        res.status(201).json({ message: 'Produit ajouté' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/produits-chimiques/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, seuil_min } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .input('nom', nom)
            .input('seuil', seuil_min || 0)
            .query('UPDATE ProduitsChimiques SET nom = @nom, seuil_min = @seuil WHERE id = @id');
        res.json({ message: 'Produit mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/produits-chimiques/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM ProduitsChimiques WHERE id = @id');
        res.json({ message: 'Produit supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les consommations de produits chimiques
app.get('/api/consommations-chimiques', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ConsommationsChimiques ORDER BY date_consommation DESC, created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/consommations-chimiques', async (req, res) => {
    try {
        const { produit_nom, quantite, date_consommation, commentaire } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('produit_nom', produit_nom)
            .input('quantite', quantite)
            .input('date_consommation', date_consommation || new Date())
            .input('commentaire', commentaire || null)
            .query('INSERT INTO ConsommationsChimiques (produit_nom, quantite, date_consommation, commentaire) VALUES (@produit_nom, @quantite, @date_consommation, @commentaire)');
        res.status(201).json({ message: 'Consommation enregistrée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/consommations-chimiques/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', id).query('DELETE FROM ConsommationsChimiques WHERE id=@id');
        res.json({ message: 'Consommation supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route Stock Consolide
app.get('/api/stock-chimique', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                p.id,
                p.nom,
                p.seuil_min,
                COALESCE(SUM_ACHATS.total_qte, 0) as entree,
                COALESCE(SUM_CONSO.total_qte, 0) as sortie,
                (COALESCE(SUM_ACHATS.total_qte, 0) - COALESCE(SUM_CONSO.total_qte, 0)) as stock
            FROM ProduitsChimiques p
            LEFT JOIN (
                SELECT 
                    COALESCE(designation_reception, designation_commande) as nom_produit,
                    SUM(COALESCE(qte_reception, qte_commande, 0)) as total_qte
                FROM AchatsChimiques
                GROUP BY COALESCE(designation_reception, designation_commande)
            ) SUM_ACHATS ON p.nom = SUM_ACHATS.nom_produit
            LEFT JOIN (
                SELECT 
                    produit_nom,
                    SUM(quantite) as total_qte
                FROM ConsommationsChimiques
                GROUP BY produit_nom
            ) SUM_CONSO ON p.nom = SUM_CONSO.produit_nom
            WHERE COALESCE(SUM_ACHATS.total_qte, 0) > 0 OR COALESCE(SUM_CONSO.total_qte, 0) > 0
            ORDER BY p.nom
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes pour les Recettes (Formules)
app.get('/api/recettes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.*, i.id as ingredient_id, i.produit_nom, i.pourcentage
            FROM Recettes r
            LEFT JOIN IngredientsRecette i ON r.id = i.recette_id
            ORDER BY r.nom, i.produit_nom
        `);

        // Grouper les ingrédients par recette
        const recettes = [];
        result.recordset.forEach(row => {
            let recette = recettes.find(r => r.id === row.id);
            if (!recette) {
                recette = {
                    id: row.id,
                    nom: row.nom,
                    description: row.description,
                    ingredients: []
                };
                recettes.push(recette);
            }
            if (row.ingredient_id) {
                recette.ingredients.push({
                    id: row.ingredient_id,
                    produit_nom: row.produit_nom,
                    pourcentage: row.pourcentage
                });
            }
        });

        res.json(recettes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/recettes', async (req, res) => {
    try {
        const { nom, description, ingredients } = req.body;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const result = await transaction.request()
                .input('nom', sql.NVarChar, nom)
                .input('desc', sql.NVarChar, description)
                .query('INSERT INTO Recettes (nom, description) OUTPUT INSERTED.id VALUES (@nom, @desc)');

            const recipeId = result.recordset[0].id;

            for (const ing of ingredients) {
                await transaction.request()
                    .input('rid', sql.Int, recipeId)
                    .input('pnom', sql.NVarChar, ing.produit_nom)
                    .input('pct', sql.Float, ing.pourcentage)
                    .query('INSERT INTO IngredientsRecette (recette_id, produit_nom, pourcentage) VALUES (@rid, @pnom, @pct)');
            }

            await transaction.commit();
            res.status(201).json({ message: 'Recette créée', id: recipeId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/recettes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description, ingredients } = req.body;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input('id', sql.Int, id)
                .input('nom', sql.NVarChar, nom)
                .input('desc', sql.NVarChar, description)
                .query('UPDATE Recettes SET nom = @nom, description = @desc WHERE id = @id');

            // Supprimer les anciens ingrédients
            await transaction.request().input('id', sql.Int, id).query('DELETE FROM IngredientsRecette WHERE recette_id = @id');

            // Ajouter les nouveaux
            for (const ing of ingredients) {
                await transaction.request()
                    .input('rid', sql.Int, id)
                    .input('pnom', sql.NVarChar, ing.produit_nom)
                    .input('pct', sql.Float, ing.pourcentage)
                    .query('INSERT INTO IngredientsRecette (recette_id, produit_nom, pourcentage) VALUES (@rid, @pnom, @pct)');
            }

            await transaction.commit();
            res.json({ message: 'Recette mise à jour' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/recettes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request().input('id', sql.Int, id).query('DELETE FROM IngredientsRecette WHERE recette_id = @id');
            await transaction.request().input('id', sql.Int, id).query('DELETE FROM Recettes WHERE id = @id');
            await transaction.commit();
            res.json({ message: 'Recette supprimée' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enregistrer une production (Traitement d'un lot)
app.post('/api/productions', async (req, res) => {
    try {
        const { recette_id, poids_base, nb_peaux, date_production, commentaire, ingredients_ajustex } = req.body;
        const pool = await poolPromise;

        // 1. Récupérer les ingrédients de la recette pour calculer les besoins
        const ingredientsResult = await pool.request()
            .input('recette_id', sql.Int, recette_id)
            .query('SELECT * FROM IngredientsRecette WHERE recette_id = @recette_id');

        const ingredients = ingredientsResult.recordset;
        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ error: "Cette recette ne contient aucun ingrédient." });
        }

        // 2. Calculer les besoins totaux et vérifier le stock
        // Récupérer le stock actuel pour comparer
        const stockResult = await pool.request().query(`
            SELECT 
                p.nom,
                (COALESCE(SUM_ACHATS.total_qte, 0) - COALESCE(SUM_CONSO.total_qte, 0)) as stock_actuel
            FROM ProduitsChimiques p
            LEFT JOIN (
                SELECT COALESCE(designation_reception, designation_commande) as nom_produit, SUM(COALESCE(qte_reception, qte_commande, 0)) as total_qte
                FROM AchatsChimiques GROUP BY COALESCE(designation_reception, designation_commande)
            ) SUM_ACHATS ON p.nom = SUM_ACHATS.nom_produit
            LEFT JOIN (
                SELECT produit_nom, SUM(quantite) as total_qte
                FROM ConsommationsChimiques GROUP BY produit_nom
            ) SUM_CONSO ON p.nom = SUM_CONSO.produit_nom
        `);

        const stocks = stockResult.recordset;
        const manquants = [];

        for (const ing of ingredients) {
            let qteRequise = ing.pourcentage * poids_base;
            if (ingredients_ajustex && ingredients_ajustex[ing.produit_nom]) {
                qteRequise = ingredients_ajustex[ing.produit_nom];
            }

            if (qteRequise > 0) {
                const stockItem = stocks.find(s => s.nom === ing.produit_nom);
                const currentStock = stockItem ? stockItem.stock_actuel : 0;

                if (currentStock < qteRequise) {
                    manquants.push(`${ing.produit_nom} (Requis: ${qteRequise.toFixed(2)}kg, Dispo: ${currentStock.toFixed(2)}kg)`);
                }
            }
        }

        if (manquants.length > 0) {
            return res.status(400).json({
                error: `Stock insuffisant pour lancer la production : ${manquants.join(', ')}`
            });
        }

        // 3. Procéder à l'enregistrement si tout est OK
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Enregistrer la production
            const prodResult = await transaction.request()
                .input('recette_id', sql.Int, recette_id)
                .input('poids_base', sql.Float, poids_base)
                .input('nb_peaux', sql.Int, nb_peaux || null)
                .input('date_production', sql.Date, date_production || new Date())
                .input('commentaire', sql.NVarChar, commentaire || null)
                .query(`
                    INSERT INTO Productions (recette_id, poids_base, nb_peaux, date_production, commentaire)
                    OUTPUT INSERTED.id
                    VALUES (@recette_id, @poids_base, @nb_peaux, @date_production, @commentaire)
                `);

            const productionId = prodResult.recordset[0].id;

            // Insérer les consommations automatiques
            for (const ing of ingredients) {
                let qte = ing.pourcentage * poids_base;
                if (ingredients_ajustex && ingredients_ajustex[ing.produit_nom]) {
                    qte = ingredients_ajustex[ing.produit_nom];
                }

                if (qte > 0) {
                    await transaction.request()
                        .input('produit_nom', sql.NVarChar, ing.produit_nom)
                        .input('quantite', sql.Float, qte)
                        .input('date_consommation', sql.Date, date_production || new Date())
                        .input('commentaire', sql.NVarChar, `Production #${productionId} (Recette: ${recette_id})`)
                        .query(`
                            INSERT INTO ConsommationsChimiques (produit_nom, quantite, date_consommation, commentaire)
                            VALUES (@produit_nom, @quantite, @date_consommation, @commentaire)
                        `);

                    await transaction.request()
                        .input('nom', sql.NVarChar, ing.produit_nom)
                        .query('IF NOT EXISTS (SELECT 1 FROM ProduitsChimiques WHERE nom = @nom) INSERT INTO ProduitsChimiques (nom) VALUES (@nom)');
                }
            }

            await transaction.commit();
            res.status(201).json({ message: 'Production et consommations enregistrées', id: productionId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtenir l'historique détaillé des productions
app.get('/api/productions/details', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                p.*, 
                r.nom as recette_nom, 
                r.description as recette_desc
            FROM Productions p
            LEFT JOIN Recettes r ON p.recette_id = r.id
            ORDER BY p.date_production DESC, p.created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Erreur GET /api/productions/details:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur Backend démarré sur http://localhost:${port}`);
});

