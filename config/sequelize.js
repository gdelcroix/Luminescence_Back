const { Sequelize } = require('sequelize');

// Créez une instance de Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb', // ou 'postgres', 'sqlite', 'mssql' selon votre base de données
});

module.exports = sequelize;