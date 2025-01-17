## creation de la base, tables, triggers et vues

USE `luminescence`;

CREATE TABLE `archive_ventes` (
`ID_Archive` int(11) NOT NULL AUTO_INCREMENT,
`ID_Reservation` int(11) DEFAULT NULL,
`Date_Réservation` datetime DEFAULT NULL,
`Type_Service` varchar(50) DEFAULT NULL,
`Récurrence` tinyint(1) DEFAULT NULL,
`Montant_Acompte` decimal(10,2) DEFAULT NULL,
`ID_Client` int(11) DEFAULT NULL,
`Nom_Client` varchar(50) DEFAULT NULL,
`Prenom_Client` varchar(50) DEFAULT NULL,
`Email_Client` varchar(100) DEFAULT NULL,
`Telephone_Client` varchar(15) DEFAULT NULL,
`Adresse_Client` varchar(255) DEFAULT NULL,
`Code_Postal_Client` varchar(10) DEFAULT NULL,
`Ville_Client` varchar(50) DEFAULT NULL,
`Role_Client` varchar(50) DEFAULT NULL,
`Points_Fidelite_Client` int(11) DEFAULT NULL,
`Ancienneté_Client` date DEFAULT NULL,
`Date_Suppression` date DEFAULT curdate(),
PRIMARY KEY (`ID_Archive`)
);

CREATE TABLE `archiveventes` (
`ID_Archive` int(11) NOT NULL AUTO_INCREMENT,
`ID_Client` int(11) DEFAULT NULL,
`Nom_Client` varchar(50) DEFAULT NULL,
`Prénom_Client` varchar(50) DEFAULT NULL,
`Email_Client` varchar(100) DEFAULT NULL,
`Téléphone_Client` varchar(15) DEFAULT NULL,
`Adresse_Client` varchar(255) DEFAULT NULL,
`ID_Réservation` int(11) DEFAULT NULL,
`Date_Réservation` datetime DEFAULT NULL,
`Type_Service` varchar(50) DEFAULT NULL,
`Montant_Acompte` decimal(10,2) DEFAULT NULL,
`ID_Paiement` int(11) DEFAULT NULL,
`Montant_Paiement` decimal(10,2) DEFAULT NULL,
`Date_Paiement` datetime DEFAULT NULL,
`Méthode_Paiement` varchar(50) DEFAULT NULL,
`ID_Produit` int(11) DEFAULT NULL,
`Nom_Produit` varchar(100) DEFAULT NULL,
`Catégorie_Produit` varchar(50) DEFAULT NULL,
`Quantité` int(11) DEFAULT NULL,
`Sous_Total` decimal(10,2) DEFAULT NULL,
`Date_Archivage` datetime DEFAULT current_timestamp(),
`Code_Postal_Client` varchar(10) DEFAULT NULL,
`Ville_Client` varchar(50) DEFAULT NULL,
`Ancienneté_Client` date DEFAULT NULL,
`Role_Client` varchar(50) DEFAULT NULL,
`Récurrence` tinyint(1) DEFAULT NULL,
PRIMARY KEY (`ID_Archive`)
);

CREATE TABLE `client` (
`ID_Client` int(11) NOT NULL AUTO_INCREMENT,
`Nom` varchar(50) DEFAULT NULL,
`Prenom` varchar(50) DEFAULT NULL,
`Email` varchar(100) DEFAULT NULL,
`Telephone` varchar(15) DEFAULT NULL,
`Adresse` varchar(250) DEFAULT NULL,
`Points_fidelite` int(11) DEFAULT 0,
`Ancienneté` date DEFAULT NULL,
`Role` varchar(20) DEFAULT 'Client',
`mdp` varchar(255) DEFAULT NULL,
`Code_Postal` varchar(5) DEFAULT NULL,
`Ville` varchar(100) DEFAULT NULL,
PRIMARY KEY (`ID_Client`),
UNIQUE KEY `Email` (`Email`),
UNIQUE KEY `Telephone` (`Telephone`)
);

DELIMITER $$

CREATE TRIGGER archive_client
BEFORE DELETE ON client FOR EACH ROW
BEGIN
INSERT INTO ArchiveVentes (ID_Client, Nom_Client, Prénom_Client, Email_Client, Téléphone_Client, Adresse_Client, Code_Postal_Client, Ville_Client, Ancienneté_Client, Role_Client, Date_Archivage)
VALUES (OLD.ID_Client, OLD.Nom, OLD.Prenom, OLD.Email, OLD.Telephone, OLD.Adresse, OLD.Code_Postal, OLD.Ville, OLD.Ancienneté, OLD.Role, NOW());

    INSERT INTO ArchiveVentes (ID_Client, ID_Réservation, Date_Réservation, Type_Service, Récurrence, Montant_Acompte, Date_Archivage)
    SELECT OLD.ID_Client, r.ID_Réservation, r.Date_Réservation, r.Type_Service, r.Récurrence, r.Montant_Acompte, NOW()
    FROM réservation r
    WHERE r.ID_Client = OLD.ID_Client;

    INSERT INTO ArchiveVentes (ID_Client, ID_Réservation, ID_Paiement, Montant_Paiement, Date_Paiement, Méthode_Paiement, Date_Archivage)
    SELECT OLD.ID_Client, p.ID_Réservation, p.ID_Paiement, p.Montant, p.Date_Paiement, p.Méthode_Paiement, NOW()
    FROM paiement p
    WHERE p.ID_Réservation IN (SELECT ID_Réservation FROM réservation WHERE ID_Client = OLD.ID_Client);

    INSERT INTO ArchiveVentes (ID_Client, ID_Réservation, ID_Produit, Nom_Produit, Catégorie_Produit, Quantité, Sous_Total, Date_Archivage)
    SELECT OLD.ID_Client, r.ID_Réservation, dv.ID_Produit, pr.Nom_Produit, pr.Catégorie, dv.Quantité, dv.Sous_Total, NOW()
    FROM détail_vente dv
    JOIN produit pr ON dv.ID_Produit = pr.ID_Produit
    JOIN réservation r ON dv.ID_Vente = r.ID_Réservation
    WHERE r.ID_Client = OLD.ID_Client;

END $$

DELIMITER ;

CREATE TABLE `disponibilité` (
`ID_Disponibilité` int(11) NOT NULL AUTO_INCREMENT,
`Date` date DEFAULT NULL,
`Heure_Début` time DEFAULT NULL,
`Heure_Fin` time DEFAULT NULL,
`Nombre_Places` int(11) DEFAULT NULL,
`ID_Client` int(11) DEFAULT NULL,
PRIMARY KEY (`ID_Disponibilité`),
KEY `ID_Client` (`ID_Client`),
CONSTRAINT `disponibilité_ibfk_1` FOREIGN KEY (`ID_Client`) REFERENCES `client` (`ID_Client`)
);

CREATE TABLE `détail_vente` (
`ID_Vente` int(11) NOT NULL,
`ID_Produit` int(11) NOT NULL,
`Quantité` int(11) DEFAULT NULL,
`Sous_Total` decimal(10,2) DEFAULT NULL,
PRIMARY KEY (`ID_Vente`,`ID_Produit`),
KEY `ID_Produit` (`ID_Produit`),
CONSTRAINT `détail_vente_ibfk_1` FOREIGN KEY (`ID_Vente`) REFERENCES `vente` (`ID_Vente`),
CONSTRAINT `détail_vente_ibfk_2` FOREIGN KEY (`ID_Produit`) REFERENCES `produit` (`ID_Produit`)
);

CREATE TABLE `gère` (
`ID_Client` int(11) NOT NULL,
`ID_Disponibilité` int(11) NOT NULL,
PRIMARY KEY (`ID_Client`,`ID_Disponibilité`),
KEY `ID_Disponibilité` (`ID_Disponibilité`),
CONSTRAINT `gère_ibfk_1` FOREIGN KEY (`ID_Client`) REFERENCES `client` (`ID_Client`),
CONSTRAINT `gère_ibfk_2` FOREIGN KEY (`ID_Disponibilité`) REFERENCES `disponibilité` (`ID_Disponibilité`)
);

CREATE TABLE `paiement` (
`ID_Paiement` int(11) NOT NULL AUTO_INCREMENT,
`Montant` decimal(10,2) NOT NULL,
`Date_Paiement` datetime DEFAULT NULL,
`Méthode_Paiement` varchar(50) DEFAULT NULL,
`Type_Paiement` varchar(50) NOT NULL,
`ID_Réservation` int(11) NOT NULL,
PRIMARY KEY (`ID_Paiement`),
UNIQUE KEY `ID_Réservation` (`ID_Réservation`),
CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`ID_Réservation`) REFERENCES `réservation` (`ID_Réservation`)
);

CREATE TABLE `planning` (
`ID_Planning` int(11) NOT NULL AUTO_INCREMENT,
`Date` date DEFAULT NULL,
`ID_Client` int(11) DEFAULT NULL,
PRIMARY KEY (`ID_Planning`),
KEY `ID_Client` (`ID_Client`),
CONSTRAINT `planning_ibfk_1` FOREIGN KEY (`ID_Client`) REFERENCES `client` (`ID_Client`)
);

CREATE TABLE `produit` (
`ID_Produit` int(11) NOT NULL AUTO_INCREMENT,
`Nom_Produit` varchar(100) DEFAULT NULL,
`Description` text DEFAULT NULL,
`Catégorie` varchar(50) DEFAULT NULL,
`Prix` decimal(10,2) DEFAULT NULL,
`Stock` int(11) DEFAULT NULL,
`Date_Péremption` date DEFAULT NULL,
`Visible` tinyint(1) DEFAULT 1,
`Date_Création` date NOT NULL,
`Dernière_Modification` date DEFAULT NULL,
`Image` varchar(100) DEFAULT NULL,
PRIMARY KEY (`ID_Produit`)
);

CREATE TABLE `rappel_rendezvous` (
`ID_Rappel` int(11) NOT NULL AUTO_INCREMENT,
`Date_Envoi` datetime DEFAULT NULL,
`Méthode_Envoi` varchar(20) NOT NULL,
`ID_Client` int(11) DEFAULT NULL,
`ID_Réservation` int(11) DEFAULT NULL,
PRIMARY KEY (`ID_Rappel`),
KEY `ID_Client` (`ID_Client`),
KEY `ID_Réservation` (`ID_Réservation`),
CONSTRAINT `rappel_rendezvous_ibfk_1` FOREIGN KEY (`ID_Client`) REFERENCES `client` (`ID_Client`),
CONSTRAINT `rappel_rendezvous_ibfk_2` FOREIGN KEY (`ID_Réservation`) REFERENCES `réservation` (`ID_Réservation`)
);

CREATE TABLE `réservation` (
`ID_Réservation` int(11) NOT NULL,
`Date_Réservation` datetime NOT NULL,
`Type_Service` varchar(50) DEFAULT NULL,
`Récurrence` tinyint(1) DEFAULT NULL,
`Montant_Acompte` decimal(10,2) DEFAULT NULL,
`ID_Client` int(11) DEFAULT NULL,
PRIMARY KEY (`ID_Réservation`),
KEY `ID_Client` (`ID_Client`),
CONSTRAINT `réservation_ibfk_1` FOREIGN KEY (`ID_Client`) REFERENCES `client` (`ID_Client`)
);

DELIMITER $$

CREATE TRIGGER archive_reservation
BEFORE DELETE ON réservation FOR EACH ROW
BEGIN
INSERT INTO ArchiveVentes (ID_Client, Nom_Client, Prénom_Client, Email_Client, Téléphone_Client, Adresse_Client, Code_Postal_Client, Ville_Client, Ancienneté_Client, Role_Client, ID_Réservation, Date_Réservation, Type_Service, Récurrence, Montant_Acompte, Date_Archivage)
SELECT c.ID_Client, c.Nom, c.Prénom, c.Email, c.Téléphone, c.Adresse, c.Code_Postal, c.Ville, c.Ancienneté, c.Role, OLD.ID_Réservation, OLD.Date_Réservation, OLD.Type_Service, OLD.Récurrence, OLD.Montant_Acompte, NOW()
FROM client c
WHERE c.ID_Client = OLD.ID_Client;

    INSERT INTO ArchiveVentes (ID_Client, ID_Réservation, ID_Paiement, Montant_Paiement, Date_Paiement, Méthode_Paiement, Date_Archivage)
    SELECT OLD.ID_Client, OLD.ID_Réservation, p.ID_Paiement, p.Montant, p.Date_Paiement, p.Méthode_Paiement, NOW()
    FROM paiement p
    WHERE p.ID_Réservation = OLD.ID_Réservation;

    INSERT INTO ArchiveVentes (ID_Client, ID_Réservation, ID_Produit, Nom_Produit, Catégorie_Produit, Quantité, Sous_Total, Date_Archivage)
    SELECT OLD.ID_Client, OLD.ID_Réservation, dv.ID_Produit, pr.Nom_Produit, pr.Catégorie, dv.Quantité, dv.Sous_Total, NOW()
    FROM détail_vente dv
    JOIN produit pr ON dv.ID_Produit = pr.ID_Produit
    WHERE dv.ID_Vente = (SELECT ID_Vente FROM vente WHERE ID_Réservation = OLD.ID_Réservation);

END $$

DELIMITER ;

CREATE TABLE `vente` (
`ID_Vente` int(11) NOT NULL AUTO_INCREMENT,
`Date_Vente` datetime DEFAULT NULL,
`Total` decimal(10,2) DEFAULT NULL,
`ID_Client` int(11) DEFAULT NULL,
PRIMARY KEY (`ID_Vente`),
KEY `ID_Client` (`ID_Client`),
CONSTRAINT `vente_ibfk_1` FOREIGN KEY (`ID_Client`) REFERENCES `client` (`ID_Client`)
);

CREATE VIEW `vue_premier_id_reservation_vide` AS
WITH CTE AS (
SELECT MIN(t1.ID_Réservation) AS ID_Manquant
FROM (
SELECT ROW_NUMBER() OVER (ORDER BY réservation.ID_Réservation) AS RowNum, réservation.ID_Réservation
FROM réservation
) t1
WHERE t1.RowNum <> t1.ID_Réservation
)
SELECT cte.ID_Manquant AS ID_Manquant
FROM CTE;
