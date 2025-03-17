const express = require('express');
const router = express.Router();
const sendMail = require('../middleware/nodemailer')

router.post('/contact', (req, res) => {
    // Envoi du mail avec nodemailer
    const formulaire = req.body;
    sendMail(formulaire)
      .then(() => res.status(200).send('message envoyé avec succès'))
      .catch((error) => res.status(500).send("erreur d'envoi"));
  });

  module.exports = router;
