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
  try {
    const [result] = await bdd.promise().query('INSERT INTO produit SET ?', [req.body]);
    res.status(201).json({ message: 'Produit ajouté avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('UPDATE produit SET ? WHERE id = ?', [req.body, req.params.id]);
    res.status(200).json({ message: 'Produit mis à jour avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('DELETE FROM produit WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: 'Produit supprimé avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM produit WHERE ?', [req.query]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM produit WHERE id = ?', [req.params.id]);
    res.json(results[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
