const mysql = require('mysql2'); 
const dotenv = require('dotenv');
dotenv.config(); 

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: process.env.HOST, 
    user: process.env.USER, 
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) throw err;
    console.log('Appel bdd');});

module.exports = connection;