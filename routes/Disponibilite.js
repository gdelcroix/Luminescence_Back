const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// obtenir la liste de toutes les dispo
router.get('/', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM disponibilité');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
  console.log('GET toutes disponibilités');
});

router.post('/add', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('INSERT INTO disponibilité SET ?', [req.body]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const [result] = await bdd
      .promise()
      .query('UPDATE disponibilité SET ? WHERE ID_Dispo = ?', [req.body, req.params.id]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('DELETE FROM disponibilité WHERE ID_Dispo = ?', [req.params.id]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    let query = 'SELECT * FROM disponibilité WHERE 1=1';
    let params = [];
    if (dateDebut) {
      query += ' AND dateDebut >= ?';
      params.push(dateDebut);
    }
    if (dateFin) {
      query += ' AND dateFin <= ?';
      params.push(dateFin);
    }
    const [results] = await bdd.promise().query(query, params);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
