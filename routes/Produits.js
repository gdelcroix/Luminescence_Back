const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// Récupérer tous les produits
router.get('/', async (req, res) => {
  console.log('GET all products');
  const query = 'SELECT * FROM produit';
  try {
    const [result] = await bdd.promise().query(query);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.post('/add', async (req, res) => {
  const { Nom_Produit, Description, Catégorie, Prix, Stock, Date_Péremption, Visible, Image} = req.body;
  const ajoutDate = new Date();
  const dernièreModif = ajoutDate;

  try {
    const [result] = await bdd.promise().query('INSERT INTO produit (Nom_Produit, Description, Catégorie, Prix, Stock, Date_Péremption, Visible, Image, Date_Création, Dernière_Modification) VALUES (?,?,?,?,?,?,?,?,?,?)', [Nom_Produit, Description, Catégorie, Prix, Stock, Date_Péremption, Visible, Image,ajoutDate,dernièreModif]);
    console.log('add :',result);
    res.status(201).json({ message: 'Produit ajouté avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.put('/update/:id', async (req, res) => {
  const params = req.body;
  const keys = Object.keys(params);
  const values = Object.values(params);
  values.push(req.params.id);
  const setBuild = keys.map(key => `${key} = ?`).join(', ');
  const sql = `UPDATE produit SET ${setBuild} WHERE ID_Produit =?`;
  try {
    const [result] = await bdd.promise().query(sql, values);
    res.status(200).json({ message: 'Produit mis à jour avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('DELETE FROM produit WHERE ID_Produit = ?', [req.params.id]);
    res.status(200).json({ message: 'Produit supprimé avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/search', async (req, res) => {
  const params = req.query;
  const keys = Object.keys(params);
  const values = Object.values(params).flat();

  const whereBuild = keys.map((key, index) => {
    if (Array.isArray(params[key])) {
      return params[key].map(() => `${key} LIKE ?`).join(' OR ');
      } else {
        return `${key} LIKE?`;
      }
    }).join(' OR ');
  const sql = `SELECT * FROM produit WHERE ${whereBuild}`;
  console.log('requete :',sql);

  try {
    console.log('recherche ', sql, values);
    const [results] = await bdd.promise().query(sql, values);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM produit WHERE ID_Produit = ?', [req.params.id]);
    res.json(results[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
