const request = require('supertest');
const express = require('express');
const clientRoutes = require('../routes/Client');
const jwt = require('jsonwebtoken');
const bdd = require('../config/bdd');

function tokenForge(Role, ID_Client) {
  const payload = { Role, ID_Client };
  const secret = process.env.SECRET_KEY;
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

describe('Client Routes', () => {
  let app;
  let clientId;
  let adminToken;
  let clientToken;
  let server;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/client', clientRoutes);
    server = app.listen(3000);
  });

  // Avant chaque test, créez un nouvel utilisateur
  beforeAll(async () => {
    const res = await request(app).post('/client/add').send({
      Nom: 'Test',
      Prenom: 'User',
      Email: 'test.user@example.com',
      Telephone: '0123456789',
      Adresse: '123 Test Street',
      CodePostal: '12345',
      Ville: 'TestCity',
      Mdp: 'password123',
      Role: 'Client',
    });
    clientId = res.body.user.ID_Client;
    adminToken = tokenForge('admin', clientId);
    console.log('Admin Token:', adminToken);
    clientToken = tokenForge('Client', clientId);
    console.log('Client Token:', clientToken);
  });



  afterAll(async () => {
    if (clientId) {
      await request(app).delete(`/client/supprimer/${clientId}`).set('Authorization', `Bearer ${clientToken}`);
    }
    await new Promise(resolve => server.close(resolve));
    await bdd.end();
  });

  // Test pour un ajout valable
  test('POST /add should return a 201 status code when adding a user successfully', async () => {
    const res = await request(app).post('/client/add').send({
      Nom: 'John',
      Prenom: 'Doe',
      Email: 'john.doe@example.com',
      Telephone: '01234567890',
      Adresse: '123 Street',
      CodePostal: '12345',
      Ville: 'City',
      Mdp: 'password123'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utilisateur ajouté avec succès');
  });

  // Test pour obtenir un utilisateur par ID
  test('GET /:id should return a user', async () => {
    const res = await request(app).get(`/client/${clientId}`).set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ID_Client', clientId);
  });

  // Test pour vérifier qu'un utilisateur inexistant retourne un message d'erreur
  test('GET /:id should return an error message when trying to get a non-existent user', async () => {
    const res = (await request(app).get('/client/99999').set('Authorization', `Bearer ${clientToken}`));
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Utilisateur non trouvé');
  });

  // Test pour vérifier qu'un utilisateur ou un pirate essaie de s'attribuer un rôle admin
  test('should return a 403 error when trying to add an admin role without being an admin', async () => {
    const res = await request(app).patch(`/client/modifAdmin/${clientId}`).set('Authorization', `Bearer ${clientToken}`).send({ role: 'admin' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Action réservée aux administrateurs');
  });

  // Test pour vérifier qu'un ajout sans les contraintes est bloqué
  test('POST /add should return a 400 error when trying to add a user without an email or phone', async () => {
    const res = await request(app).post('/client/add').send({
      Nom: 'John',
      Prenom: 'Doe',
      Email: '',
      Telephone: '',
      Adresse: '123 Street',
      CodePostal: '12345',
      Ville: 'City',
      Mdp: 'password123',
      Role: 'client',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email ou téléphone requis');
  });

  // test pour trouver un utilisateur
  test("POST /rechercher devrait retourner l'utilisateur, puis DELETE /supprimer le faire disparaitre", async () => {
    // Rechercher l'utilisateur par Nom
    console.log('essai nom + Admin Token:', adminToken);
    let res = await request(app).post('/client/rechercher').set('Authorization', `Bearer ${adminToken}`).send({ "Nom": "John" });
    console.log('resultat 1:',res.body[0].ID_Client);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    let user = res.body[0];
    console.log('user 1:',user.Nom);
    expect(user).toHaveProperty('Nom', 'john'); 
    // Rechercher l'utilisateur par Prénom
    console.log('essai prenom + Admin Token:', adminToken);
    res = await request(app).post('/client/rechercher').set('Authorization', `Bearer ${adminToken}`).send({ "Prenom": "Doe" });
    console.log('resultat 2:',res.body[0].ID_Client);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    user = res.body[0];
    console.log('user 2:',user.Prenom);
    expect(user).toHaveProperty('Prenom', 'doe'); 
    // Rechercher l'utilisateur par Email
    console.log('essai mail + Admin Token:', adminToken);
    res = await request(app).post('/client/rechercher').set('Authorization', `Bearer ${adminToken}`).send({ "Email": "john.doe@example.com" });
    console.log('resultat 3:',res.body[0].ID_Client);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    user = res.body[0];
    console.log('user 3:',user.Email);
    expect(user).toHaveProperty("Email", "john.doe@example.com"); 
    // Stocker l'ID de l'utilisateur pour la suppression
    console.log("user after last test",user, res.body[0] );
    const userIdToDelete = user.ID_Client; // Supprimer l'utilisateur
    res = await request(app).delete(`/client/supprimer/${userIdToDelete}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Utilisateur supprimé avec succès');
  });
});
