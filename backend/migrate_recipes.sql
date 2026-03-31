USE TeintureMarocaine;
GO

-- Table des Recettes (Formules)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recettes')
BEGIN
    CREATE TABLE Recettes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nom NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Table des Ingrédients de Recette
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IngredientsRecette')
BEGIN
    CREATE TABLE IngredientsRecette (
        id INT IDENTITY(1,1) PRIMARY KEY,
        recette_id INT FOREIGN KEY REFERENCES Recettes(id) ON DELETE CASCADE,
        produit_nom NVARCHAR(255) NOT NULL,
        pourcentage FLOAT NOT NULL, -- Pourcentage (ex: 0.045 pour 4.5%)
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Table des Productions (Historique des traitements effectués)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Productions')
BEGIN
    CREATE TABLE Productions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        recette_id INT FOREIGN KEY REFERENCES Recettes(id),
        date_production DATE DEFAULT GETDATE(),
        poids_base FLOAT NOT NULL, -- Le poids utilisé pour le calcul (% du poids)
        nb_peaux INT,
        commentaire NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- Insertion des recettes par défaut basées sur l'analyse Excel
-- Note : On utilise MERGE ou IF NOT EXISTS pour éviter les doublons si relancé

IF NOT EXISTS (SELECT 1 FROM Recettes WHERE nom = 'PH 1 - Rivier')
BEGIN
    DECLARE @RecetteId INT;
    INSERT INTO Recettes (nom, description) VALUES ('PH 1 - Rivier', 'Phase de préparation (Rivier)');
    SET @RecetteId = SCOPE_IDENTITY();
    INSERT INTO IngredientsRecette (recette_id, produit_nom, pourcentage) VALUES 
    (@RecetteId, 'BICARBONATE', 0.004),
    (@RecetteId, 'CARBONATE', 0.004),
    (@RecetteId, 'CHAUX', 0.045),
    (@RecetteId, 'NOVASOAP SE', 0.0075),
    (@RecetteId, 'NOVALIME N', 0.03),
    (@RecetteId, 'NOVADECAL', 0.002),
    (@RecetteId, 'NOVATEN BA', 0.004),
    (@RecetteId, 'NOVACIDE FXL', 0.005),
    (@RecetteId, 'SEL', 0.01),
    (@RecetteId, 'SULFURE', 0.036);
END

IF NOT EXISTS (SELECT 1 FROM Recettes WHERE nom = 'PH 2 - Tannage')
BEGIN
    DECLARE @RecetteId2 INT;
    INSERT INTO Recettes (nom, description) VALUES ('PH 2 - Tannage', 'Phase de tannage');
    SET @RecetteId2 = SCOPE_IDENTITY();
    INSERT INTO IngredientsRecette (recette_id, produit_nom, pourcentage) VALUES 
    (@RecetteId2, 'ACIDE FORMIQUE', 0.0091),
    (@RecetteId2, 'ACIDE SULFIRIQUE', 0.016),
    (@RecetteId2, 'METABISULFITE', 0.003),
    (@RecetteId2, 'CHAUX', 0.003),
    (@RecetteId2, 'CHROME', 0.07),
    (@RecetteId2, 'FORMIATE', 0.013),
    (@RecetteId2, 'NOVASOAP SE', 0.0065),
    (@RecetteId2, 'NOVADECAL', 0.03);
END

IF NOT EXISTS (SELECT 1 FROM Recettes WHERE nom = 'PH 3 - Noir')
BEGIN
    DECLARE @RecetteId3 INT;
    INSERT INTO Recettes (nom, description) VALUES ('PH 3 - Noir', 'Retannage couleur Noir');
    SET @RecetteId3 = SCOPE_IDENTITY();
    INSERT INTO IngredientsRecette (recette_id, produit_nom, pourcentage) VALUES 
    (@RecetteId3, 'ACIDE FORMIQUE', 0.076),
    (@RecetteId3, 'BICARBONATE SODUIM', 0.013),
    (@RecetteId3, 'NOIR LG (STG)', 0.0425),
    (@RecetteId3, 'CHROME', 0.05),
    (@RecetteId3, 'FARINE', 0.03),
    (@RecetteId3, 'FORMIATE DE SODIUM', 0.025);
END
GO
