const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const bdd = require('../config/bdd');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

function isEmail(identifiant) {
  return identifiant.includes('@');
}

function isPhone(identifiant) {
  return identifiant.length === 10 && !isNaN(identifiant);
}

router.post('/connexion', async (req, res) => {
  try {
    const { identifiant, mdp } = req.body;

    if (!identifiant || !mdp) {
      // Vérification si les champs sont remplis
      return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
    }

    let query, params;
    if (isEmail(identifiant)) {
      query = 'SELECT * FROM client WHERE Email = ?'; // Requête SQL pour rechercher le mail dans la base de données
      params = [identifiant];
    } else if (isPhone(identifiant)) {
      query = 'SELECT * FROM client WHERE Telephone = ?'; // Requête SQL pour rechercher le téléphone dans la base de données
      params = [identifiant];
    } else {
      return res.status(400).json({ message: "Format d'identifiant invalide" });
    }

    bdd.query(query, params, async (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const compte = result[0]; // Prendre le premier résultat
      const match = await argon2.verify(compte.mdp, mdp); // Vérification du mot de passe

      if (match) {
        const payload = {
          nom: compte.Nom,
          prenom: compte.Prenom,
          role: compte.Role,
          ID: compte.ID_Client,
          mail: compte.Email,
          telephone: compte.Telephone,
        };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({
          message: 'Connexion réussie',
          token,
        });
      } else {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
