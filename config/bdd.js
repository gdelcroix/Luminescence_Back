const mysql = require('mysql2'); 
const dotenv = require('dotenv');
dotenv.config(); 

// Configuration de la connexion à la base de données
const connection = mysql.createPool({
    host: process.env.HOST, 
    user: process.env.USER, 
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,  // Pour exécuter des requêtes SQL multi-lignes
});

// Connexion à la base de données
connection.getConnection((err) => {
    if (err) throw err;
    console.log('Appel bdd');});

module.exports = connection;