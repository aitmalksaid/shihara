USE TeintureMarocaine;
GO
ALTER TABLE receptions_peaux ADD nb_tr INT DEFAULT 0;
ALTER TABLE receptions_peaux ADD poids_tr DECIMAL(10,2) DEFAULT 0;
ALTER TABLE receptions_peaux ADD prix_tr DECIMAL(10,2) DEFAULT 3.00;
GO
