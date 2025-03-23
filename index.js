const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./config/routes');


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
  // idem pour les requetes options
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



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
