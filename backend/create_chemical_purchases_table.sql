-- Création de la table pour les achats de produits chimiques (Local & Import)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AchatsChimiques')
BEGIN
    CREATE TABLE AchatsChimiques (
        id INT IDENTITY(1,1) PRIMARY KEY,
        type_achat NVARCHAR(20), -- 'IMPORT' ou 'LOCAL'
        fournisseur NVARCHAR(100),
        
        -- Partie Commande
        date_commande DATE,
        num_commande NVARCHAR(50),
        designation_commande NVARCHAR(255),
        qte_commande FLOAT,
        
        -- Partie Réception
        date_reception DATE,
        num_reception NVARCHAR(50),
        designation_reception NVARCHAR(255),
        qte_reception FLOAT,
        pu_reception FLOAT,
        ht_mad_reception FLOAT, -- Calculé ou saisi
        
        -- Partie Facture
        num_facture NVARCHAR(50),
        date_facture DATE,
        designation_facture NVARCHAR(255),
        qte_facture FLOAT,
        
        -- Spécifique Import (Devises)
        pu_euro FLOAT,
        montant_euro FLOAT,
        taux_change FLOAT,
        
        -- Montants Finaux
        pu_mad_facture FLOAT,
        ht_facture FLOAT,
        tva_transport FLOAT, -- Ou "Frais par dossier/Transport" pour local
        ttc FLOAT,
        
        -- Frais d'approche / Douane (Surtout Import)
        decharge FLOAT,
        transport_supp FLOAT,
        echange FLOAT,
        transit FLOAT,
        surestaries FLOAT,
        magasinage FLOAT,
        
        -- Colonnes calculées ou fin
        cout_revient_unitaire FLOAT,
        cout_total_final FLOAT,
        
        created_at DATETIME DEFAULT GETDATE()
    );
END
