USE TeintureMarocaine;
GO

-- Création de la table des fournisseurs
IF OBJECT_ID('fournisseurs', 'U') IS NULL
BEGIN
    CREATE TABLE fournisseurs (
        id INT PRIMARY KEY IDENTITY(1,1),
        nom NVARCHAR(100) NOT NULL,
        telephone NVARCHAR(20),
        email NVARCHAR(100),
        adresse NVARCHAR(MAX),
        created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

-- Création de la table des réceptions de peaux
IF OBJECT_ID('receptions_peaux', 'U') IS NULL
BEGIN
    CREATE TABLE receptions_peaux (
        id INT PRIMARY KEY IDENTITY(1,1),
        fournisseur_id INT NOT NULL FOREIGN KEY REFERENCES fournisseurs(id),
        reference_suivi NVARCHAR(50) UNIQUE NOT NULL,
        type_peau NVARCHAR(10) NOT NULL, -- 'A', 'B', 'C'
        poids_kg DECIMAL(10, 2) NOT NULL,
        prix_unitaire_kg DECIMAL(10, 2) DEFAULT 6.00,
        date_reception DATETIME DEFAULT GETDATE(),
        statut_paiement NVARCHAR(20) DEFAULT 'en_attente', -- 'en_attente', 'paye'
        facture_generee BIT DEFAULT 0,
        created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

-- Insertion de quelques fournisseurs de test et réceptions
IF NOT EXISTS (SELECT * FROM fournisseurs)
BEGIN
    INSERT INTO fournisseurs (nom, telephone, email, adresse) VALUES
    (N'Abdelhak Peaux', '0600112233', 'abdelhak@email.com', N'Souq el Jeld, Fès'),
    (N'Marrakech Cuir', '0611223344', 'contact@marrakechcuir.com', N'Zone Industrielle, Marrakech');

    DECLARE @f1 INT = (SELECT TOP 1 id FROM fournisseurs WHERE nom = N'Abdelhak Peaux');
    DECLARE @f2 INT = (SELECT TOP 1 id FROM fournisseurs WHERE nom = N'Marrakech Cuir');

    INSERT INTO receptions_peaux (fournisseur_id, reference_suivi, type_peau, poids_kg, prix_unitaire_kg) VALUES
    (@f1, 'REF-2024-001', 'A', 150.5, 6.00),
    (@f1, 'REF-2024-002', 'B', 80.0, 6.00),
    (@f2, 'REF-2024-003', 'C', 200.0, 6.00);
END
GO
