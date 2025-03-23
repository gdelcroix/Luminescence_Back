const express = require('express');
const router = express.Router();
const { upload, convertAndSaveImg } = require('./middleware/multer');
const path = require('path');

// Route pour télécharger les images
router.post('/upload', upload.single('image'), convertAndSaveImg, (req, res) => {
    if (!req.file) {
      return res.status(400).send('Aucun fichier téléchargé.');
    }
    res.send(`Fichier téléchargé et converti : ${req.file.filename}`);
  });
  
  // Servir les fichiers statiques depuis le dossier 'uploads'
  router.use('/images', express.static(path.join(__dirname, 'images')));

  module.exports = router;
