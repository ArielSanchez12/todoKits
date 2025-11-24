import request from 'supertest';
import app from '../../server.js';
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

describe('E2E - Flujo Completo: Registro → Préstamo → Devolución', () => {
  let adminToken;
  let docenteToken;
  let docenteId;
  let recursoId;
  let prestamoId;

  const adminData = {
    nombre: 'Admin Prueba',
    apellido: 'Sanchez',
    email: 'admin@gmail.com',
    password: 'Admin123!',
    //confirmPassword: 'Admin123!'
  };

  const docenteData = {
    nombreDocente: 'Docente Prueba',
    apellidoDocente: 'López',
    celularDocente: '0998765432',
    emailDocente: 'maria@gmail.com',
    passwordDocente: 'Docente123!',
    //confirmPasswordDocente: 'Docente123!'
  };

  const recursoData = {
    tipo: 'kit',
    laboratorio: 'LAB 16',
    aula: 'E042',
    contenido: ['CABLE HDMI', 'CABLE VGA', '2 CONTROLES', 'LLAVES']
  };

  // PASO 1: REGISTRO DE ADMINISTRADOR
  describe('PASO 1: Registro de Administrador', () => {
    it('debe registrar administrador exitosamente', async () => {
      const response = await request(app)
        .post('/api/register')
        .send(adminData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('administrador');
      expect(response.body).toHaveProperty('token');
      expect(response.body.administrador.email).toBe(adminData.email);
      
      adminToken = response.body.token;
    });
  });

  // PASO 2: REGISTRO DE DOCENTE (por Admin)
  describe('PASO 2: Registro de Docente por Administrador', () => {
    it('debe registrar docente exitosamente', async () => {
      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('docente');
      expect(response.body.docente.emailDocente).toBe(docenteData.emailDocente);
      expect(response.body.docente.nombreDocente).toBe(docenteData.nombreDocente);

      docenteId = response.body.docente._id;
    });
  });

  // PASO 3: LOGIN DE DOCENTE
  describe('PASO 3: Login de Docente', () => {
    it('debe permitir login exitoso de docente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: docenteData.emailDocente,
          password: docenteData.passwordDocente
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.msg).toBe('Login exitoso');

      docenteToken = response.body.token;
    });
  });

  // PASO 4: CREAR RECURSO (KIT)
  describe('PASO 4: Crear Recurso (KIT)', () => {
    it('debe crear recurso (kit) exitosamente', async () => {
      const response = await request(app)
        .post('/api/recurso')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(recursoData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('recurso');
      expect(response.body.recurso.tipo).toBe('kit');
      expect(response.body.recurso.nombre).toBe('KIT #1');
      expect(response.body.recurso.estado).toBe('pendiente');
      expect(response.body.recurso.contenido).toHaveLength(4);

      recursoId = response.body.recurso._id;
    });

    it('docente debe poder listar recursos', async () => {
      const response = await request(app)
        .get('/api/recurso/listar')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].tipo).toBe('kit');
    });

    it('docente debe poder ver detalles del recurso', async () => {
      const response = await request(app)
        .get(`/api/recurso/${recursoId}`)
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(recursoId);
      expect(response.body.nombre).toBe('KIT #1');
      expect(response.body.contenido).toEqual(recursoData.contenido);
    });
  });

  // PASO 5: CREAR PRÉSTAMO
  describe('PASO 5: Crear Préstamo', () => {
    it('debe crear préstamo exitosamente', async () => {
      const response = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: {
            tipo: 'Clase',
            //descripcion: ''
          },
          observaciones: 'Préstamo para clases de desarrollo web'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('prestamo');
      expect(response.body.prestamo.estado).toBe('pendiente');
      expect(response.body.prestamo.recurso).toBe(recursoId);
      expect(response.body.prestamo.docente).toBe(docenteId);

      prestamoId = response.body.prestamo._id;
    });

    it('docente debe poder listar sus préstamos pendientes', async () => {
      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].estado).toBe('pendiente');
    });
  });

  // PASO 6: DOCENTE CONFIRMA PRÉSTAMO
  describe('PASO 6: Docente Confirma Préstamo', () => {
    it('debe confirmar préstamo y cambiar estado a activo', async () => {
      const response = await request(app)
        .patch(`/api/docente/prestamo/${prestamoId}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          confirmar: true
        });

      expect(response.status).toBe(200);
      expect(response.body.prestamo.estado).toBe('activo');
      expect(response.body.prestamo).toHaveProperty('horaConfirmacion');
      expect(response.body.prestamo).toHaveProperty('firmaDocente');
    });

    it('recurso debe estar en estado "prestado"', async () => {
      const response = await request(app)
        .get(`/api/recurso/${recursoId}`)
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('prestado');
      expect(response.body.asignadoA).toBe(docenteId);
    });

    it('docente debe ver préstamo como activo', async () => {
      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      const prestamoActivo = response.body.find(p => p._id === prestamoId);
      expect(prestamoActivo.estado).toBe('activo');
    });
  });

  // PASO 7: DOCENTE DEVUELVE PRÉSTAMO
  describe('PASO 7: Docente Devuelve Préstamo', () => {
    it('debe finalizar préstamo exitosamente', async () => {
      const response = await request(app)
        .patch(`/api/docente/prestamo/${prestamoId}/finalizar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          observacionesDevolucion: 'Recursos devueltos en perfecto estado'
        });

      expect(response.status).toBe(200);
      expect(response.body.prestamo.estado).toBe('finalizado');
      expect(response.body.prestamo).toHaveProperty('horaDevolucion');
    });

    it('recurso debe volver a estado "pendiente"', async () => {
      const response = await request(app)
        .get(`/api/recurso/${recursoId}`)
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('pendiente');
      expect(response.body.asignadoA).toBeNull();
    });

    it('préstamo debe aparecer en historial del docente', async () => {
      const response = await request(app)
        .get('/api/docente/prestamos/historial')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const prestamoFinalizado = response.body.find(p => p._id === prestamoId);
      expect(prestamoFinalizado.estado).toBe('finalizado');
    });
  });
});