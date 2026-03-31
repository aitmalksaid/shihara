USE TeintureMarocaine;
GO

-- Création de la table des factures fournisseurs
IF OBJECT_ID('factures_fournisseurs', 'U') IS NULL
BEGIN
    CREATE TABLE factures_fournisseurs (
        id INT PRIMARY KEY IDENTITY(1,1),
        fournisseur_id INT NOT NULL FOREIGN KEY REFERENCES fournisseurs(id),
        numero_facture NVARCHAR(50) UNIQUE NOT NULL,
        date_facture DATE DEFAULT GETDATE(),
        montant_total DECIMAL(10, 2) NOT NULL,
        statut NVARCHAR(20) DEFAULT 'en_attente', -- 'en_attente', 'payee'
        created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

-- Ajout de la colonne facture_id dans la table des réceptions si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('receptions_peaux') AND name = 'facture_id')
BEGIN
    ALTER TABLE receptions_peaux ADD facture_id INT FOREIGN KEY REFERENCES factures_fournisseurs(id);
END
GO
