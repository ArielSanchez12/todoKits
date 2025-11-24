import request from 'supertest';
import app from '../../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import administrador from '../../models/administrador.js';
import docente from '../../models/docente.js';

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

describe('API - Login y Autenticación', () => {
  
  describe('Login de Administrador', () => {
    let adminId;
    let adminToken;

    beforeAll(async () => {
      // Crear admin de prueba
      const response = await request(app)
        .post('/api/register')
        .send({
          nombre: 'Admin Prueba',
          apellido: 'Pérez',
          email: 'admin@gmail.com',
          password: 'Admin123!'
          //confirmPassword: 'Admin123!'
        });
      adminId = response.body.administrador._id;
    });

    //revisar que permita el login sin validar la confirmacion de cuenta
    it('debe permitir login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@gmail.com',
          password: 'Admin123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.msg).toBe('Login exitoso');
      adminToken = response.body.token;
    });

    it('debe rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@gmail.com',
          password: 'WrongPassw1!'
        });

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('La contraseña es incorrecta');
    });

    it('debe rechazar login con email no registrado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@gmail.com',
          password: 'Admin123!'
        });

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('Lo sentimos, el usuario no se encuentra registrado');
    });

    it('debe rechazar login con campos vacíos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Lo sentimos, debes llenar todos los campos');
    });
  });

  //Este es otro flujo, por eso creamos de nuevo otro admin
  describe('Login de Docente', () => {
    let adminToken;
    let docenteId;
    let docenteEmail = 'docente@gmail.com';
    let docentePassword = 'Docente123!';

    beforeAll(async () => {
      // Crear admin
      const adminResponse = await request(app)
        .post('/api/register')
        .send({
          nombre: 'Admin Prueba',
          apellido: 'Rodríguez',
          email: 'admin2@gmail.com',
          password: 'Admin123!',
          confirmPassword: 'Admin123!'
        });
      adminToken = adminResponse.body.token;

      // Crear docente
      const docenteResponse = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombreDocente: 'Docente Prueba',
          apellidoDocente: 'García',
          celularDocente: '0998765432',
          emailDocente: docenteEmail,
          passwordDocente: docentePassword,
          //confirmPasswordDocente: docentePassword
        });

      docenteId = docenteResponse.body.docente._id;
    });

    it('debe permitir login exitoso de docente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: docenteEmail,
          password: docentePassword
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.msg).toBe('Login exitoso');
    });

    it('debe rechazar login de docente con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: docenteEmail,
          password: 'WrongPassw2!'
        });

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('La contraseña es incorrecta');
    });
  });

  describe('Endpoints Protegidos', () => {
    it('debe rechazar acceso sin token', async () => {
      const response = await request(app)
        .get('/api/docente/profile');

      expect(response.status).toBe(403);
      expect(response.body.msg).toContain('token');
    });

    it('debe rechazar acceso con token inválido', async () => {
      const response = await request(app)
        .get('/api/docente/profile')
        .set('Authorization', 'Bearer tokenInvalido123');

      expect(response.status).toBe(403);
      expect(response.body.msg).toContain('token');
    });

    it('debe permitir acceso con token válido', async () => {
      // Crear admin y obtener token
      const adminResponse = await request(app)
        .post('/api/register')
        .send({
          nombre: 'Admin Prueba',
          apellido: 'López',
          email: 'admin3@gmail.com',
          password: 'Admin123!',
          confirmPassword: 'Admin123!'
        });

      const token = adminResponse.body.token;

      // Intentar acceder a endpoint protegido
      const response = await request(app)
        .get('/api/administrador/listDocentes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});