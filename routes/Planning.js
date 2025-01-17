const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// obtenir la liste de tous les plannings
router.get('/tous', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM planning');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
  console.log('GET tous plannings');
});

router.post('/add', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('INSERT INTO planning SET ?', [req.body]);
    res.status(201).json({ message: 'Planning ajouté avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('UPDATE planning SET ? WHERE id = ?', [req.body, req.params.id]);
    res.status(200).json({ message: 'Planning mis à jour avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('DELETE FROM planning WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: 'Planning supprimé avec succès', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM planning WHERE ?', [req.query]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM planning WHERE id = ?', [req.params.id]);
    res.json(results[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
