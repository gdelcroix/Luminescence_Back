const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const Client = require('../models/client');
const { authenticateToken, verifyOwnAccount, verifyAdminRole } = require('../middleware/auth');

// les routes client ont été créées en utilisant sequelize afin de montrer la différence entre les requetes préparées et les routes par sequelization

// obtenir la liste de tous les utilisateurs
router.get('/tous', async (req, res) => {
  try {
    const [results] = await Client.findAll();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
  console.log('GET all users');
});

// Ajouter un utilisateur
router.post('/add', async (req, res) => {
  console.log('POST ajout user :', req.body);
  Object.keys(req.body).forEach((key) => {
    if (key !== 'Mdp' && typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].toLowerCase();
    }
  });
  const { Nom, Prenom, Email, Telephone, Adresse, CodePostal, Ville, Mdp } = req.body;
  // Normalisation des données
  if (!Email && !Telephone) {
    return res.status(400).json({ error: 'Email ou téléphone requis' });
  }
  try {
    // Vérification de l'existence de l'email
    if (Email) {
      const [rowsEmail] = await Client.findOne({ where: { Email } });
      if (rowsEmail) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
    }
    // Vérification de l'existence du téléphone
    if (Telephone) {
      const [rowsPhone] = await Client.findOne({ where: { Telephone } });
      if (rowsPhone) {
        return res.status(400).json({ error: 'Ce téléphone est déjà utilisé' });
      }
    }
    let hashedPassword = await argon2.hash(Mdp); // Hachage du mot de passe
    const client = await Client.create({
      Nom,
      Prenom,
      Email: Email || null,
      Telephone: Telephone || null,
      Adresse,
      Code_Postal: CodePostal,
      Ville,
      Mdp: hashedPassword,
    });

    let ajout = {
      ID_Client: client.ID_Client,
    };
    res.status(201).json({ message: 'Utilisateur ajouté avec succès', user: ajout });
    console.log('POST user success');
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

    const where = {};
    critères.forEach((key) => {
      where[key] = req.body[key].toLowerCase();
    });

    const clients = await Client.findAll({ where });
    res.status(200).json(clients);
    console.log('GET search res', clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Trouver un utilisateur par ID
router.get('/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  console.log('GET user by ID');
  try {
    const result = await Client.findByPk(id);
    if (!result) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// supprimer un utilisateur
router.delete('/supprimer/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const roleDemandeur = req.Role;
  const idDemandeur = req.ID;
  console.log('DELETE user', id, 'from ', roleDemandeur, idDemandeur);
  try {
    if (idDemandeur !== id && roleDemandeur !== 'admin') {
      console.log('utilisateur /= demandeur et pas admin');
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cet utilisateur" });
    }
    // vérifier le nombre d'admin restants
    const admins = await Client.findAll({ where: { Role: 'admin' } });
    if (admins.length === 1 && admins[0].ID_Client === id) {
      console.log("un seul admin et c'est lui");
      return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
    }
    // suppression de l'utilisateur
    const results = await Client.destroy({ where: { ID_Client: id } });
    // Vérifier si l'utilisateur a bien été supprimé
    if (results === 0) {
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
  const valeurs = { ...req.body.toLowerCase() }; // on récupère les valeurs à modifier de la requête
  try {
    const [affectedRows] = await Client.update(valeurs, { where: { ID_Client: id } });
    if (affectedRows === 0) {
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
  try {
    const [affectedRows] = await Client.update({ Role: role }, { where: { ID_Client: id } });
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: "Rôle de l'utilisateur modifié avec succès !" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la modification du rôle de l'utilisateur" });
  }
});

module.exports = router;
