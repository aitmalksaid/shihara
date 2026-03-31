-- Migration : Ajout champs Fiche Réception Peaux
-- A exécuter une seule fois sur la base SQL Server

ALTER TABLE receptions_peaux
  ADD numero_entree VARCHAR(50) NULL;

ALTER TABLE receptions_peaux
  ADD nombre_peaux INT NULL;

ALTER TABLE receptions_peaux
  ADD ecart INT NULL;
