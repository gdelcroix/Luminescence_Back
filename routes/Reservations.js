const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');

// obtenir la liste de toutes les réservations
router.get('/tous', async (req, res) => {
  try {
    const [results] = await bdd.promise().query('SELECT * FROM réservation');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
  console.log('GET toutes réservations');
});

// ajouter une nouvelle résa
router.post('/add', async (req, res) => {
  const { date, client_id, message } = req.body;
  try {
    const [result] = await bdd
      .promise()
      .query('INSERT INTO réservation (Date_Réservation, ID_Client, Tupe_Service, Récurrence, Montant_Acompte) VALUES (?, ?, ?, ?, ?)', [date, client_id, message]);
    res.status(201).json({ id: result.insertId, date, client_id, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'ajout du rappel" });
  }
});

// mettre à jour un rappel existant
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { date, client_id, message } = req.body;
  try {
    await bdd
      .promise()
      .query('UPDATE rappel_rendezvous SET date = ?, client_id = ?, message = ? WHERE id = ?', [
        date,
        client_id,
        message,
        id,
      ]);
    res.status(200).json({ id, date, client_id, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rappel' });
  }
});

// supprimer un rappel
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await bdd.promise().query('DELETE FROM rappel_rendezvous WHERE id = ?', [id]);
    res.status(200).json({ message: 'Rappel supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rappel' });
  }
});

// rechercher des rappels par critères
router.get('/search', async (req, res) => {
  const { date, client_id } = req.query;
  try {
    const [results] = await bdd
      .promise()
      .query('SELECT * FROM rappel_rendezvous WHERE date = ? OR client_id = ?', [date, client_id]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la recherche des rappels' });
  }
});


module.exports = router;
