const express = require('express');
const router = express.Router();

const clientRoutes = require('../routes/Client');
const loginRoutes = require('../routes/Login');
const produitsRoutes = require('../routes/Produits');
const disponibiliteRoutes = require('../routes/Disponibilite');
const detailVenteRoutes = require('../routes/DetailVente');
const gereRoutes = require('../routes/Gere');
const paiementRoutes = require('../routes/Paiement');
const planningRoutes = require('../routes/Planning');
const rappelRdvRoutes = require('../routes/RappelRdv');
const reservationsRoutes = require('../routes/Reservations');
const venteRoutes = require('../routes/Vente');

router.use('/client', clientRoutes);
router.use('/login', loginRoutes);
router.use('/produits', produitsRoutes);
router.use('/disponibilite', disponibiliteRoutes);
router.use('/detailVente', detailVenteRoutes);
router.use('gere', gereRoutes);
router.use('/paiement', paiementRoutes);
router.use('/planning', planningRoutes);
router.use('/rappelRdv', rappelRdvRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/vente', venteRoutes);

module.exports = router;
