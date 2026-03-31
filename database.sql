-- Table des clients
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  adresse TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des teintures
CREATE TABLE teintures (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  delai_traitement INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des couleurs
CREATE TABLE couleurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  code_hex VARCHAR(7) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE commandes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  date_commande DATE NOT NULL,
  date_livraison_prevue DATE NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE articles_commande (
  id SERIAL PRIMARY KEY,
  commande_id INTEGER NOT NULL REFERENCES commandes(id),
  teinture_id INTEGER NOT NULL REFERENCES teintures(id),
  couleur_id INTEGER NOT NULL REFERENCES couleurs(id),
  quantite INTEGER NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer quelques données de test
INSERT INTO clients (nom, prenom, telephone, email, adresse) VALUES
('Alami', 'Mohammed', '0612345678', 'mohammed.alami@email.com', '123 Rue Hassan, Rabat'),
('Bennani', 'Fatima', '0623456789', 'fatima.bennani@email.com', '456 Avenue Mohammed V, Casablanca'),
('Chakir', 'Youssef', '0634567890', 'youssef.chakir@email.com', '789 Boulevard Zerktouni, Marrakech');

INSERT INTO teintures (nom, description, prix_unitaire, delai_traitement) VALUES
('Teinture naturelle', 'Teinture à base de plantes naturelles', 25.50, 3),
('Teinture synthétique', 'Teinture chimique de haute qualité', 15.75, 2),
('Teinture premium', 'Teinture haut de gamme avec fixation longue durée', 35.00, 5);

INSERT INTO couleurs (nom, code_hex, description) VALUES
('Rouge traditionnel', '#B22222', 'Rouge profond typique des tissus marocains'),
('Bleu majorelle', '#3F51B5', 'Bleu vif inspiré des jardins de Majorelle'),
('Vert safran', '#8BC34A', 'Vert subtil rappelant les plantations de safran'),
('Jaune safran', '#FFC107', 'Jaune doré similaire à la couleur du safran'),
('Noir intense', '#212121', 'Noir profond pour un contraste maximal');

INSERT INTO commandes (client_id, date_commande, date_livraison_prevue, statut) VALUES
(1, '2023-11-01', '2023-11-08', 'en_cours'),
(2, '2023-11-02', '2023-11-06', 'en_attente'),
(3, '2023-10-28', '2023-11-02', 'terminee');

INSERT INTO articles_commande (commande_id, teinture_id, couleur_id, quantite, instructions) VALUES
(1, 1, 1, 2, 'Utiliser moins de sel pour fixation plus douce'),
(1, 3, 3, 1, 'Attention au temps de trempage, ne pas dépasser 30 minutes'),
(2, 2, 4, 3, 'Client demande une couleur plus vive si possible'),
(3, 1, 2, 2, 'Pas d\'instructions particulières');
