-- Script SQL optimisé pour Microsoft SQL Server

-- 1. Création de la base de données
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TeintureMarocaine')
BEGIN
    CREATE DATABASE TeintureMarocaine;
END
GO

USE TeintureMarocaine;
GO

-- 2. Suppression des tables si elles existent (ordre inverse des clés étrangères)
IF OBJECT_ID('articles_commande', 'U') IS NOT NULL DROP TABLE articles_commande;
IF OBJECT_ID('commandes', 'U') IS NOT NULL DROP TABLE commandes;
IF OBJECT_ID('couleurs', 'U') IS NOT NULL DROP TABLE couleurs;
IF OBJECT_ID('teintures', 'U') IS NOT NULL DROP TABLE teintures;
IF OBJECT_ID('clients', 'U') IS NOT NULL DROP TABLE clients;
GO

-- 3. Création des tables
CREATE TABLE clients (
    id INT PRIMARY KEY IDENTITY(1,1),
    nom NVARCHAR(100) NOT NULL,
    prenom NVARCHAR(100) NOT NULL,
    telephone NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    adresse NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE teintures (
    id INT PRIMARY KEY IDENTITY(1,1),
    nom NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    delai_traitement INT NOT NULL,
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE couleurs (
    id INT PRIMARY KEY IDENTITY(1,1),
    nom NVARCHAR(100) NOT NULL,
    code_hex NVARCHAR(7) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE commandes (
    id INT PRIMARY KEY IDENTITY(1,1),
    client_id INT NOT NULL FOREIGN KEY REFERENCES clients(id),
    date_commande DATE NOT NULL,
    date_livraison_prevue DATE NOT NULL,
    statut NVARCHAR(20) NOT NULL DEFAULT 'en_attente',
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE articles_commande (
    id INT PRIMARY KEY IDENTITY(1,1),
    commande_id INT NOT NULL FOREIGN KEY REFERENCES commandes(id),
    teinture_id INT NOT NULL FOREIGN KEY REFERENCES teintures(id),
    couleur_id INT NOT NULL FOREIGN KEY REFERENCES couleurs(id),
    quantite INT NOT NULL,
    instructions NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);
GO

-- 4. Insertion de données de test
INSERT INTO clients (nom, prenom, telephone, email, adresse) VALUES
('Alami', 'Mohammed', '0612345678', 'mohammed.alami@email.com', '123 Rue Hassan, Rabat'),
('Bennani', 'Fatima', '0623456789', 'fatima.bennani@email.com', '456 Avenue Mohammed V, Casablanca');

INSERT INTO teintures (nom, description, prix_unitaire, delai_traitement) VALUES
('Teinture naturelle', 'Teinture à base de plantes', 25.50, 3),
('Teinture synthétique', 'Teinture chimique', 15.75, 2);

INSERT INTO couleurs (nom, code_hex, description) VALUES
('Rouge traditionnel', '#B22222', 'Rouge profond'),
('Bleu majorelle', '#3F51B5', 'Bleu vif');
GO
