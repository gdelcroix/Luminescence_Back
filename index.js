const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./config/routes');
const { upload, convertAndSaveImg } = require('./middleware/multer');
const path = require('path');

dotenv.config();
const port = process.env.PORT;

app.use(
  cors({
    origin: 'http://localhost:5173', // Autorise uniquement cette origine
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Liste des méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // Liste des en-têtes autorisés
  })
);
app.options(
  '*',
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

// Route pour télécharger les images
app.post('/upload', upload.single('image'), convertAndSaveImg, (req, res) => {
  if (!req.file) {
      return res.status(400).send('Aucun fichier téléchargé.');
  }
  res.send(`Fichier téléchargé et converti : ${req.file.filename}`);
});

// Servir les fichiers statiques depuis le dossier 'uploads'
app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
