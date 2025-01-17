const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware pour vérifier l'id de l'utilisateur connecté (restriction des routes )
async function authenticateToken(req, res, next) {
  // Récupérer le token dans l'en-tête Authorization (si présent)
  const token = req.headers['authorization']?.split(' ')[1];
  // si aucun token n'est fourni, renvoyer une erreur 401 (Unauthorized)
  console.log('Token:', token);
  if (!token) {
    return res.status(401).send('Token non fourni.');
  }
  // Vérifier le token avec la clé secrète
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded || !decoded.ID_Client) {
      throw new Error('Token invalide.'); // erreur si le token est forgé ou malformé
    }
    req.ID = parseInt(decoded.ID_Client, 10); // récupère l'id de l'utilisateur qui est un nombre entier en base 10
    req.Role = decoded.Role; // récupère le role chaine de caractères
    next(); // si tout est ok, passer à la prochaine étape de la requête
  } catch (err) {
    return res.status(401).send('Token invalide.');
  }
}
const verifyOwnAccount = (req, res, next) => {
  const id = req.ID; // ID de l'utilisateur authentifié
  const paramId = req.params.id; // ID de l'utilisateur dans les paramètres de la requête

  if (id !== parseInt(paramId, 10)) {
    return res.status(403).json({ error: 'Action non autorisée' });
  }
  next();
};

const verifyAdminRole = (req, res, next) => {
  const Role = req.Role; // Rôle de l'utilisateur authentifié
console.log('verif role', req.Role);
  if (Role !== 'admin') {
    return res.status(403).json({ error: 'Action réservée aux administrateurs' });
  }
  next();
};

module.exports = { authenticateToken, verifyOwnAccount, verifyAdminRole };
