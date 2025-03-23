const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// obtenir la liste des modules

router.get('/', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM modules_actifs');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// modifier le statut d'un module

router.put('/change/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await bdd.promise().query('UPDATE modules_actifs SET active =? WHERE id =?', [status, id]);
    res.status(200).json({ message: 'Module modifié avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
