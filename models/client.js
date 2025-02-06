const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Client = sequelize.define('Client', {
  // Définissez les colonnes de votre table
  ID_Client: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  Telephone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  Adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Code_Postal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Ville: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Mdp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'client',
  },
}, {
  tableName: 'client',
  timestamps: false,
});

module.exports = Client;