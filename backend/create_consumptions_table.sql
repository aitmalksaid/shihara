USE TeintureMarocaine;
GO

-- Table pour les consommations de produits chimiques
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ConsommationsChimiques')
BEGIN
    CREATE TABLE ConsommationsChimiques (
        id INT IDENTITY(1,1) PRIMARY KEY,
        produit_id INT, -- Optionnel, on peut utiliser le nom pour matcher AchatsChimiques
        produit_nom NVARCHAR(255) NOT NULL,
        quantite FLOAT NOT NULL,
        unite NVARCHAR(20) DEFAULT 'kg',
        date_consommation DATE DEFAULT GETDATE(),
        commentaire NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO
