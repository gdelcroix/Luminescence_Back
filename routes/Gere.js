const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// table de liaison entre les admin et les disponibilités
router.get('/tout', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM gère');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
  console.log('GET toutes gérances');
});

module.exports = router;
