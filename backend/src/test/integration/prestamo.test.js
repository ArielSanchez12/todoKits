import request from 'supertest';
import app from '../../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Prestamo from '../../models/prestamo.js';
import Recurso from '../../models/recurso.js';
import Docente from '../../models/docente.js';
import Admin from '../../models/admin.js';
import { crearTokenJWT } from '../../middlewares/jwt.js';

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

afterEach(async () => {
  await Prestamo.deleteMany({});
  await Recurso.deleteMany({});
  await Docente.deleteMany({});
  await Admin.deleteMany({});
});

describe('Integration - Gestion de préstamos', () => {
  let adminToken;
  let adminId;
  let docenteToken;
  let docenteId;
  let recursoId;
  let recursoAdicionalId;

  beforeEach(async () => {
    // 1) Crear ADMIN 
    const admin = new Admin({
      nombre: 'Gregory',
      apellido: 'Sanchez',
      celular: '0998765432',
      email: 'admin@test.com',
      password: 'Temp1234!', // se sobreescribe abajo con hash
      confirmEmail: true,     // simulamos cuenta ya confirmada
      rol: 'Administrador'
    });
    admin.password = await admin.encryptPassword('Admin123!');
    await admin.save();

    adminId = admin._id.toString();
    adminToken = crearTokenJWT(adminId, admin.rol);

    // Crear DOCENTE
    const docente = new Docente({
      nombreDocente: 'María',
      apellidoDocente: 'López',
      celularDocente: '0998765432',
      emailDocente: 'maria@gmail.com',
      passwordDocente: 'Temp1234!', // se sobreescribe abajo
      confirmEmailDocente: true,
      rolDocente: 'Docente',
      admin: adminId
    });
    docente.passwordDocente = await docente.encryptPassword('Docente123!');
    await docente.save();

    docenteId = docente._id.toString();

    // Login DOCENTE
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'maria@gmail.com',
        password: 'Docente123!'
      });
    expect(loginResponse.status).toBe(200);
    docenteToken = loginResponse.body.token;

    // 4) Crear RECURSOS
    // Recurso principal (KIT)
    const recursoResponse = await request(app)
      .post('/api/administrador/recurso/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'kit',
        laboratorio: 'LAB 16',
        aula: 'E042',
        contenido: ['CABLE HDMI', 'CABLE VGA', '2 CONTROLES', 'LLAVES']
      });

    expect(recursoResponse.status).toBe(201);
    recursoId = recursoResponse.body.recurso._id;

    // Recurso adicional (LLAVE)
    const recursoAdicionalResponse = await request(app)
      .post('/api/administrador/recurso/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'llave',
        laboratorio: 'LAB 22A',
        aula: 'E035'
        // llaves no llevan contenido
      });

    expect(recursoAdicionalResponse.status).toBe(201);
    recursoAdicionalId = recursoAdicionalResponse.body.recurso._id;
  });

  // CREACIÓN DE PRÉSTAMOS
  describe('Creación de préstamos', () => {
    it('debe crear préstamo simple correctamente', async () => {
      const response = await request(app)
        .post('/api/administrador/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: {
            tipo: 'Clase',
            descripcion: '' //llenar para tipo de motivo 'Otro'
          },
          observaciones: 'Préstamo para práctica'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('prestamo');
      expect(response.body.prestamo.estado).toBe('pendiente');
      expect(response.body.prestamo.recurso).toBe(recursoId);
      expect(response.body.prestamo.docente).toBe(docenteId);

      // Verificar en DB
      const prestamoEnDB = await Prestamo.findById(response.body.prestamo._id);
      expect(prestamoEnDB).toBeDefined();
      expect(prestamoEnDB.motivo.tipo).toBe('Clase');
    });

    it('debe crear préstamo con recursos adicionales (por observaciones)', async () => {
      const recursoPrincipal = await Recurso.findById(recursoId);
      const recursoAdicional = await Recurso.findById(recursoAdicionalId); //la llave

      const response = await request(app)
        .post('/api/administrador/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: {
            tipo: 'Clase',
            descripcion: ''
          }, // la lógica de recursos adicionales se basa en NOMBRES dentro de observaciones
          observaciones: `Préstamo con recursos adicionales: ${recursoAdicional.nombre}` // Ejemplo: "KIT #1, LLAVE #2"
        });

      expect(response.status).toBe(201);

      // Verificar que recursosAdicionales tenga 1 elemento
      expect(response.body.prestamo.recursosAdicionales).toHaveLength(1);

      // Verificar estados en DB
      const recursoAdicionalEnDB = await Recurso.findById(recursoAdicionalId);
      expect(recursoAdicionalEnDB.estado).toBe('activo'); // según crearPrestamo
    });

    it('no debe crear préstamo con recurso ya prestado', async () => {
      // Crear primer préstamo
      const primerPrestamo = await request(app)
        .post('/api/administrador/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { 
            tipo: 'Clase', 
            descripcion: '' 
          }
        });

      expect(primerPrestamo.status).toBe(201);

      // Confirmar préstamo (docente)
      const confirmar = await request(app)
        .patch(`/api/docente/prestamo/${primerPrestamo.body.prestamo._id}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ confirmar: true });

      expect(confirmar.status).toBe(200);

      // Intentar crear segundo préstamo con mismo recurso ya prestado
      const response = await request(app)
        .post('/api/administrador/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' }
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('no está disponible para préstamo');
    });
  });

  // CONFIRMACIÓN Y RECHAZO DE PRÉSTAMOS
  describe('Confirmación y rechazo de préstamos', () => {
    let prestamoId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/administrador/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { 
            tipo: 'Clase', 
            descripcion: '' 
          },
          observaciones: 'Préstamo de prueba'
        });

      expect(response.status).toBe(201);
      prestamoId = response.body.prestamo._id;
    });

    it('debe confirmar préstamo y activar recursos', async () => {
      const response = await request(app)
        .patch(`/api/docente/prestamo/${prestamoId}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ confirmar: true });

      expect(response.status).toBe(200);
      expect(response.body.prestamo.estado).toBe('activo');
      expect(response.body.prestamo).toHaveProperty('horaConfirmacion');
      expect(response.body.prestamo).toHaveProperty('firmaDocente');

      // Verificar recurso
      const recurso = await Recurso.findById(recursoId);
      expect(recurso.estado).toBe('prestado');
      expect(recurso.asignadoA.toString()).toBe(docenteId);
    });
  });

  // FINALIZACIÓN DE PRÉSTAMOS
  describe('Finalización de préstamos', () => {
    let prestamoActivoId;

    beforeEach(async () => {
      // Crear y confirmar préstamo
      const prestamoResponse = await request(app)
        .post('/api/administrador/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { 
            tipo: 'Clase', 
            descripcion: '' 
          }
        });

      expect(prestamoResponse.status).toBe(201);
      prestamoActivoId = prestamoResponse.body.prestamo._id;

      const confirmar = await request(app)
        .patch(`/api/docente/prestamo/${prestamoActivoId}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ confirmar: true });

      expect(confirmar.status).toBe(200);
    });

    it('debe finalizar préstamo y liberar todos los recursos', async () => {
      const response = await request(app)
        .patch(`/api/docente/prestamo/${prestamoActivoId}/finalizar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          observacionesDevolucion: 'Recursos en perfecto estado'
        });

      expect(response.status).toBe(200);
      expect(response.body.prestamo.estado).toBe('finalizado');
      expect(response.body.prestamo).toHaveProperty('horaDevolucion');

      // Verificar recursos liberados
      const recursoPrincipal = await Recurso.findById(recursoId);
      expect(recursoPrincipal.estado).toBe('pendiente');
      expect(recursoPrincipal.asignadoA).toBeNull();
    });
  });

  // LISTADO Y FILTRADO DE PRÉSTAMOS
  describe('Listado y filtrado de préstamos', () => {
    beforeEach(async () => {
      // Crear préstamos pendientes
      const response = await request(app)
        .post('/api/administrador/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' },
          observaciones: 'Préstamo pendiente'
        });

      expect(response.status).toBe(201);
    });

    it('debe listar préstamos pendientes y activos del docente', async () => {
      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('debe listar historial de préstamos finalizados', async () => {
      // Convertir uno a finalizado
      const todos = await Prestamo.find({});
      const p = todos[0];

      p.estado = 'finalizado';
      p.horaDevolucion = new Date();
      await p.save();

      const response = await request(app)
        .get('/api/docente/prestamos/historial')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});