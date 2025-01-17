const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// obtenir la liste de tous les paiements
router.get('/tous', async (req, res) => {
  console.log('GET tous paiements');
  try {
    const [results] = await bdd.promise().query('SELECT * FROM paiement');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('INSERT INTO paiement SET ?', [req.body]);
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
      .query('UPDATE paiement SET ? WHERE ID_Paiement = ?', [req.body, req.params.id]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const [result] = await bdd.promise().query('DELETE FROM paiement WHERE ID_Paiement = ?', [req.params.id]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { clientId, datePaiement } = req.query;
    let query = 'SELECT * FROM paiement WHERE 1=1';
    let params = [];
    if (clientId) {
      query += ' AND clientId = ?';
      params.push(clientId);
    }
    if (datePaiement) {
      query += ' AND datePaiement = ?';
      params.push(datePaiement);
    }
    const [results] = await bdd.promise().query(query, params);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
