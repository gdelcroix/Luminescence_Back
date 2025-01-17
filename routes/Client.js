const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const bdd = require('../config/bdd');
const { authenticateToken, verifyOwnAccount, verifyAdminRole } = require('../middleware/auth');

// obtenir la liste de tous les utilisateurs
router.get('/tous', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM client');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
  console.log('GET all users');
});

// Ajouter un utilisateur
router.post('/add', async (req, res) => {
  console.log('POST user');
  Object.keys(req.body).forEach(key => {
    if (key !== 'Mdp' && typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].toLowerCase();
    }});
  const { Nom, Prenom, Email, Telephone, Adresse, CodePostal, Ville, Mdp } = req.body;
  // Normalisation des données
  if (!Email && !Telephone) {
    return res.status(400).json({ error: 'Email ou téléphone requis' });
  }
  try {
    // Vérification de l'existence de l'email
    const [rowsEmail] = await bdd.promise().query('SELECT * FROM client WHERE Email = ?', [Email]);
    if (rowsEmail.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    // Vérification de l'existence du téléphone
    const [rowsPhone] = await bdd.promise().query('SELECT * FROM client WHERE Telephone = ?', [Telephone]);
    if (rowsPhone.length > 0) {
      return res.status(400).json({ error: 'Ce téléphone est déjà utilisé' });
    }
    let hashedPassword = await argon2.hash(Mdp); // Hachage du mot de passe
    const query =
      'INSERT INTO client (Nom, Prenom, Email, Telephone, Adresse, Code_Postal, Ville, mdp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'; // Insertion des données dans la base de données
    let [result] = await bdd
      .promise()
      .query(query, [Nom, Prenom, Email, Telephone, Adresse, CodePostal, Ville, hashedPassword]);
    let ajout = {
      ID_Client: result.insertId,
    };
    res.status(201).json({ message: 'Utilisateur ajouté avec succès', user: ajout });
    console.log('POST user');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// rechercher un utilisateur par critères
router.post('/rechercher', authenticateToken, async (req, res) => {
  console.log('GET search user', req.body);
  try {
    const critères = Object.keys(req.body).filter((key) => key !== 'mdp');
    if (critères.length === 0) {
      return res.status(400).json({ error: 'recherche vide' });
    }

    let query = 'SELECT * FROM client WHERE ';
    const params = [];

    // génération de la requete + paramètres
    critères.forEach((key, index) => {
      if (index > 0) query += ' AND ';
      query += `${key} = LOWER(?)`;
      params.push(req.body[key]);
    });

    const [results] = await bdd.promise().query(query, params);
    res.status(200).json(results);
    console.log('GET search res', results );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Trouver un utilisateur par ID
router.get('/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  console.log('GET user by ID');
  const query = 'SELECT * FROM client WHERE client.ID_Client =?';
  try {
    const [result] = await bdd.promise().query(query, [id]);
    if (result.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// supprimer un utilisateur
router.delete('/supprimer/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id,10);
  const roleDemandeur = req.Role;
  const idDemandeur = req.ID;
  console.log('DELETE user', id, 'from ', roleDemandeur, idDemandeur);
  try {
    if (idDemandeur !== id && roleDemandeur !== 'admin') {
      console.log('utilisateur /= demandeur et pas admin');
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cet utilisateur' });
    }
    // vérifier le nombre d'admin restants
    const [admins] = await bdd.promise().query('SELECT * FROM client WHERE Role = "admin"');
    if (admins.length === 1 && admins[0].ID_Client === id) {
      console.log('un seul admin et c\'est lui');
      return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
    }
    // suppression de l'utilisateur
    const [results] = await bdd.promise().query('DELETE FROM client WHERE ID_Client = ?', [id]); // Requête SQL
    // Vérifier si l'utilisateur a bien été supprimé
    if (results.affectedRows === 0) {
      console.log('zero lignes affectées');
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    console.log(results);
    return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Modifier un utilisateur
router.patch('/modifier/:id', authenticateToken, verifyOwnAccount, async (req, res) => {
  const id = req.params.id;
  console.log('PATCH user');
  const champs = Object.keys(req.body) // on récupère les noms de valeurs à modifier de la requête
    .map((champ) => `${champ}=?`) // on récupère les noms qu'on 'variabilise' en listant par un mapping
    .join(', '); // on les sépare par une virgule pour avoir le format de la requete SQL
  const valeurs = Object.values(req.body.toLowerCase()); // on récupère les valeurs à modifier de la requête
  valeurs.push(id); // on ajoute l'id à la fin de la liste des valeurs
  const query = `UPDATE client SET ${champs} WHERE ID_Client = ?`; // requête SQL
  try {
    const [results] = await bdd.promise().query(query, valeurs);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé !' }); // improbable mais bon !
    }
    res.status(200).json({ message: 'Utilisateur modifié avec succès !' });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la modification de l'utilisateur" });
  }
});

// Modifier le rôle administrateur (ajout ou retrait, seulement par un administrateur)
router.patch('/modifAdmin/:id', authenticateToken, verifyAdminRole, async (req, res) => {
  const id = req.params.id;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Rôle requis' });
  } // on vérifie que le rôle est soit 'admin' soit 'user'
  if (role !== 'admin' && role !== 'client') {
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  const query = 'UPDATE client SET Role = ? WHERE ID_Client = ?';
  try {
    const [results] = await bdd.promise().query(query, [role, id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: "Rôle de l'utilisateur modifié avec succès !" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la modification du rôle de l'utilisateur" });
  }
});

module.exports = router;
