import request from 'supertest';
import app from '../../src/server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Docente API Tests', () => {
  
  it('debe intentar login con credenciales', async () => {
    const response = await request(app)
      .post('/api/docente/login')
      .send({
        email: "buscar@test.com",
        password: "123456"
      });

    // Incluso si falla el login, debería responder con 404 y un mensaje
    expect(response.status).toBe(404);
    expect(response.body.msg).toBeDefined();
  });

  it('debe rechazar login con campos vacíos', async () => {
    const response = await request(app)
      .post('/api/docente/login')
      .send({
        email: "",
        password: ""
      });

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Lo sentimos, debes llenar todos los campos");
  });

  it('debe rechazar email inválido', async () => {
    const response = await request(app)
      .post('/api/docente/login')
      .send({
        email: "invalid@test.com",
        password: "123456"
      });

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Lo sentimos, el usuario no se encuentra registrado");
  });
});