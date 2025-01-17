const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// obtenir la liste de toutes les ventes
router.get('/tous', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM vente');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
  console.log('GET toutes ventes');
});

module.exports = router;
