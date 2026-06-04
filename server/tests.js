// server/test/vendor.test.js
import { expect } from 'chai';
import request from 'supertest';
import app from './app.js'; 

describe('MarketXpress API Robust Integration Test Suite', () => {
  let vendorToken = '';
  let buyerToken = '';
  let testProductId = '';

  // ----------------------------------------------------------------
  // SECTION 1: AUTHENTICATION AND SETUP TESTS
  // ----------------------------------------------------------------
  describe('Authentication Gateways', () => {
    it('should successfully log in a seeded vendor and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ngozi@market.com', password: 'password123' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.user.role).to.equal('VENDOR');
      vendorToken = res.body.token;
    });

    it('should successfully log in a seeded buyer and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'chidi@student.com', password: 'password123' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.user.role).to.equal('BUYER');
      buyerToken = res.body.token;
    });

    it('should reject login attempts with invalid password profiles', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ngozi@market.com', password: 'wrongpassword' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('Invalid');
    });

    it('should reject login attempts with unregistered email paths', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'fakeuser@market.com', password: 'password123' });

      expect(res.status).to.equal(400);
    });
  });

  // ----------------------------------------------------------------
  // SECTION 2: VENDOR INVENTORY READ/WRITE OPERATIONS
  // ----------------------------------------------------------------
  describe('Vendor Inventory Pipeline', () => {
    it('should allow an authorized vendor to fetch their catalog listings', async () => {
      const res = await request(app)
        .get('/api/vendor/inventory')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('inventory');
      expect(res.body.inventory).to.be.an('array');
      expect(res.body.inventory.length).to.be.greaterThan(0);
    });

    it('should allow an authorized vendor to append clean items to their stock profile', async () => {
      const res = await request(app)
        .post('/api/vendor/add')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Yam',
          advertised: 3500,
          minimum: 3000,
          stock: 12,
          unit_type: 'TUBER'
        });

      expect(res.status).to.equal(201);
      expect(res.body.product.name).to.equal('YAM'); // Validates string normalization
      expect(res.body.product.unit_type).to.equal('TUBER');
      expect(res.body.product).to.have.property('id');
      
      testProductId = res.body.product.id; // Store for the update test step below
    });
  });

  // ----------------------------------------------------------------
  // SECTION 3: BOUNDARY VALIDATION AND ERROR HANDLING TESTS
  // ----------------------------------------------------------------
  describe('Business Logic Edge-case Guardrails', () => {
    it('should block item insertion if fields are completely missing from the body', async () => {
      const res = await request(app)
        .post('/api/vendor/add')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Garri'
          // Missing pricing values, stocks, and units completely
        });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('All fields are required');
    });

    it('should block product execution if the floor price is higher than visible market retail', async () => {
      const res = await request(app)
        .post('/api/vendor/add')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Crayfish',
          advertised: 500,  // Visible Market Price
          minimum: 600,     // Hidden Floor Floor (Invalid optimization breach)
          stock: 30,
          unit_type: 'CUP'
        });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('Minimum price cannot be higher');
    });
  });

  // ----------------------------------------------------------------
  // SECTION 4: INVENTORY MODIFICATION AND STATE CHECKS
  // ----------------------------------------------------------------
  describe('Inventory Modification Routines', () => {
    it('should allow a vendor to update the prices and stock levels of an existing product listing', async () => {
      const res = await request(app)
        .put(`/api/vendor/update/${testProductId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          advertised: 3400, // Reduced from 3500
          minimum: 2900,    // Reduced from 3000
          stock: 25         // Restocked from 12 to 25
        });

      expect(res.status).to.equal(200);
      expect(Number(res.body.product.advertised)).to.equal(3400);
      expect(Number(res.body.product.minimum)).to.equal(2900);
      expect(res.body.product.stock).to.equal(25);
    });

    it('should reject state updates if a vendor attempts to cross values illegally (min > advertised)', async () => {
      const res = await request(app)
        .put(`/api/vendor/update/${testProductId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          advertised: 1000,
          minimum: 2000, // Floor higher than listing
          stock: 10
        });

      expect(res.status).to.equal(400);
    });

    it('should gracefully handle updating a resource item UUID that does not exist in the platform schema', async () => {
      const fakeUuid = 'e8b2b64d-7bc4-47f6-95e5-fce3b88950bb';
      const res = await request(app)
        .put(`/api/vendor/update/${fakeUuid}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          advertised: 1500,
          minimum: 1200,
          stock: 5
        });

      expect(res.status).to.equal(404);
      expect(res.body.message).to.include('not found or unauthorized');
    });
  });

  // ----------------------------------------------------------------
  // SECTION 5: SECURITY EXCLUSION AUDITS
  // ----------------------------------------------------------------
  describe('Security and Token Perimeter Audits', () => {
    it('should block a buyer account from accessing authorization protected vendor profile feeds', async () => {
      const res = await request(app)
        .get('/api/vendor/inventory')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).to.equal(403);
      expect(res.body.message).to.include('Access denied. Vendors only.');
    });

    it('should reject access strings missing bearer declaration formats', async () => {
      const res = await request(app)
        .get('/api/vendor/inventory')
        .set('Authorization', `JustTheTokenStringWithoutBearerPrefix_${vendorToken}`);

      expect(res.status).to.equal(401);
    });

    it('should explicitly reject connection scopes entirely omitting authorization structures', async () => {
      const res = await request(app)
        .get('/api/vendor/inventory'); // Missing Auth Header totally

      expect(res.status).to.equal(401);
    });

    it('should fail elegantly if an attacker intercepts and alters a character in the token signing string', async () => {
      const brokenToken = vendorToken + "a"; // Mutate signing validation key
      const res = await request(app)
        .get('/api/vendor/inventory')
        .set('Authorization', `Bearer ${brokenToken}`);

      expect(res.status).to.equal(401);
      expect(res.body.message).to.include('Token is not valid');
    });
  });
});