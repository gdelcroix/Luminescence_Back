const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken, verifyOwnAccount, verifyAdminRole } = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const app = express();
app.use(express.json());

// Route de test pour authenticateToken
app.get('/test/authenticate', authenticateToken, (req, res) => {
  res.status(200).send('Authenticated');
});

// Route de test pour verifyOwnAccount
app.get('/test/verifyOwn/:id', authenticateToken, verifyOwnAccount, (req, res) => {
  res.status(200).send('Own Account Verified');
});

// Route de test pour verifyAdminRole
app.get('/test/admin', authenticateToken, verifyAdminRole, (req, res) => {
  res.status(200).send('Admin Verified');
});

describe('Auth Middleware', () => {

  const validToken = jwt.sign({ ID_Client: 1, Role: 'admin' }, SECRET_KEY);
  const invalidToken = 'invalidToken';

  // Test pour authenticateToken
  test('should return 200 when the token is valid', async () => {
    const response = await request(app)
      .get('/test/authenticate')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Authenticated');
  });

  test('should return 401 when the token is missing', async () => {
    const response = await request(app).get('/test/authenticate');
    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Token non fourni.');
  });

  test('should return 401 when the token is invalid', async () => {
    const response = await request(app)
      .get('/test/authenticate')
      .set('Authorization', `Bearer ${invalidToken}`);
    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Token invalide.');
  });

  // Test pour verifyOwnAccount
  test('should return 200 when the user is modifying their own account', async () => {
    const response = await request(app)
      .get('/test/verifyOwn/1')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Own Account Verified');
  });

  test('should return 403 when the user is not modifying their own account', async () => {
    const response = await request(app)
      .get('/test/verifyOwn/2')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe('Action non autorisée');
  });

  // Test pour verifyAdminRole
  test('should return 200 when the user has admin role', async () => {
    const response = await request(app)
      .get('/test/admin')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Admin Verified');
  });

  test('should return 403 when the user does not have admin role', async () => {
    const userToken = jwt.sign({ ID_Client: 2, Role: 'user' }, SECRET_KEY);
    const response = await request(app)
      .get('/test/admin')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe('Action réservée aux administrateurs');
  });
});
