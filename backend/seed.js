const { poolPromise, sql } = require('./db');

async function seed() {
    try {
        const pool = await poolPromise;
        console.log('Début du peuplement de la base de données...');

        // 1. Nettoyage des tables (ordre inverse des FK)
        await pool.request().query('DELETE FROM articles_commande');
        await pool.request().query('DELETE FROM commandes');
        await pool.request().query('DELETE FROM couleurs');
        await pool.request().query('DELETE FROM teintures');
        await pool.request().query('DELETE FROM clients');

        console.log('Tables nettoyées.');

        // 2. Insertion des Clients
        const clientsResult = await pool.request().query(`
            INSERT INTO clients (nom, prenom, telephone, email, adresse) 
            OUTPUT INSERTED.id
            VALUES 
            (N'Amrani', N'Youssef', '0611223344', 'youssef.amrani@email.com', N'Rue 15, Hay Mohammadi, Casablanca'),
            (N'Alaoui', N'Meryem', '0655667788', 'meryem.alaoui@email.com', N'Boulevard Mohammed V, Rabat'),
            (N'Tazi', N'Driss', '0644332211', 'driss.tazi@email.com', N'Avenue Hassan II, Marrakech'),
            (N'Idrissi', N'Sanaa', '0677889900', 'sanaa.idrissi@email.com', N'Rue de la Liberté, Fès'),
            (N'Mansouri', N'Omar', '0622334455', 'omar.mansouri@email.com', N'Quartier Gauthier, Casablanca')
        `);
        const clientIds = clientsResult.recordset.map(r => r.id);
        console.log(`${clientIds.length} clients insérés.`);

        // 3. Insertion des Teintures
        const teinturesResult = await pool.request().query(`
            INSERT INTO teintures (nom, description, prix_unitaire, delai_traitement)
            OUTPUT INSERTED.id
            VALUES 
            (N'Teinture Laine Directe', N'Teinture classique pour tapis et vêtements en laine', 45.00, 3),
            (N'Teinture Soie Délicate', N'Traitement spécial pour tissus fins et soie', 85.00, 5),
            (N'Teinture Coton Grand Teint', N'Haute résistance au lavage pour tissus en coton', 35.00, 2),
            (N'Restauration Couleur Vive', N'Redonner éclat aux couleurs ternies', 60.00, 4)
        `);
        const teintureIds = teinturesResult.recordset.map(r => r.id);
        console.log(`${teintureIds.length} types de teinture insérés.`);

        // 4. Insertion des Couleurs
        const couleursResult = await pool.request().query(`
            INSERT INTO couleurs (nom, code_hex, description)
            OUTPUT INSERTED.id
            VALUES 
            (N'Bleu Majorelle', '#6050DC', N'Bleu vibrant iconique de Marrakech'),
            (N'Vert Menthe', '#3EB489', N'Vert frais traditionnel'),
            (N'Safran Doré', '#F4C430', N'Jaune épicé'),
            (N'Rouge Marrakech', '#C0392B', N'Rouge terre de sienne'),
            (N'Noir ébène', '#2C3E50', N'Noir profond pour soie')
        `);
        const couleurIds = couleursResult.recordset.map(r => r.id);
        console.log(`${couleurIds.length} couleurs insérées.`);

        // 5. Insertion des Commandes
        const now = new Date();
        const futureDate = (days) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
        };

        const commandesResult = await pool.request().query(`
            INSERT INTO commandes (client_id, date_commande, date_livraison_prevue, statut)
            OUTPUT INSERTED.id
            VALUES 
            (${clientIds[0]}, '${now.toISOString().split('T')[0]}', '${futureDate(4)}', 'en_cours'),
            (${clientIds[1]}, '${now.toISOString().split('T')[0]}', '${futureDate(6)}', 'en_attente'),
            (${clientIds[2]}, '${futureDate(-5)}', '${futureDate(-1)}', 'terminee'),
            (${clientIds[3]}, '${now.toISOString().split('T')[0]}', '${futureDate(3)}', 'en_cours')
        `);
        const commandeIds = commandesResult.recordset.map(r => r.id);
        console.log(`${commandeIds.length} commandes insérées.`);

        // 6. Insertion des Articles de Commande
        await pool.request().query(`
            INSERT INTO articles_commande (commande_id, teinture_id, couleur_id, quantite, instructions)
            VALUES 
            (${commandeIds[0]}, ${teintureIds[0]}, ${couleurIds[0]}, 2, N'Laine double épaisseur'),
            (${commandeIds[1]}, ${teintureIds[1]}, ${couleurIds[1]}, 1, N'Attention aux bordures'),
            (${commandeIds[2]}, ${teintureIds[2]}, ${couleurIds[3]}, 5, N'Lavage préalable requis'),
            (${commandeIds[3]}, ${teintureIds[3]}, ${couleurIds[2]}, 3, N'Teinture uniforme demandée')
        `);
        console.log('Articles de commande insérés.');

        console.log('Félicitations ! La base de données est peuplée avec succès.');
        process.exit(0);

    } catch (err) {
        console.error('Erreur lors du peuplement :', err);
        process.exit(1);
    }
}

seed();
