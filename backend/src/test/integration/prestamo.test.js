import request from 'supertest';
import app from '../../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Prestamo from '../../models/prestamo.js';
import Recurso from '../../models/recurso.js';
import Docente from '../../models/docente.js';
import Administrador from '../../models/administrador.js';

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
  await Administrador.deleteMany({});
});

describe('Integration - Gestión de Préstamos', () => {
  let adminToken;
  let adminId;
  let docenteToken;
  let docenteId;
  let recursoId;
  let recursoAdicionalId;

  beforeEach(async () => {
    // Crear administrador
    const adminResponse = await request(app)
      .post('/api/register')
      .send({
        nombre: 'Gregory',
        apellido: 'Sanchez',
        email: 'admin@test.com',
        password: 'Admin123!',
        confirmPassword: 'Admin123!'
      });

    adminToken = adminResponse.body.token;
    adminId = adminResponse.body.administrador._id;

    // Crear docente
    const docenteResponse = await request(app)
      .post('/api/administrador/registerDocente')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombreDocente: 'María',
        apellidoDocente: 'López',
        celularDocente: '0998765432',
        emailDocente: 'maria@gmail.com',
        passwordDocente: 'Docente123!',
        confirmPasswordDocente: 'Docente123!'
      });

    docenteId = docenteResponse.body.docente._id;

    // Login docente
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria@gmail.com',
        password: 'Docente123!'
      });

    docenteToken = loginResponse.body.token;

    // Crear recurso principal
    const recursoResponse = await request(app)
      .post('/api/recurso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'kit',
        laboratorio: 'Laboratorio de Electrónica',
        aula: 'Aula 301',
        contenido: ['Arduino UNO R3', 'Cables Dupont']
      });

    recursoId = recursoResponse.body.recurso._id;

    // Crear recurso adicional
    const recursoAdicionalResponse = await request(app)
      .post('/api/recurso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'llave',
        laboratorio: 'Laboratorio de Redes',
        aula: 'Aula 205',
        contenido: []
      });

    recursoAdicionalId = recursoAdicionalResponse.body.recurso._id;
  });

  // ============================================
  // CREACIÓN DE PRÉSTAMOS
  // ============================================
  describe('Creación de Préstamos', () => {
    it('debe crear préstamo simple correctamente', async () => {
      const response = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: {
            tipo: 'Clase',
            descripcion: ''
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

    it('debe crear préstamo con recursos adicionales', async () => {
      const response = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: {
            tipo: 'Proyecto',
            descripcion: 'Proyecto de electrónica'
          },
          recursosAdicionales: [recursoAdicionalId],
          observaciones: 'Préstamo con recursos adicionales'
        });

      expect(response.status).toBe(201);
      expect(response.body.prestamo.recursosAdicionales).toHaveLength(1);
      expect(response.body.prestamo.recursosAdicionales[0]).toBe(recursoAdicionalId);

      // Verificar que recursos adicionales están bloqueados
      const recursoAdicional = await Recurso.findById(recursoAdicionalId);
      expect(recursoAdicional.estado).toBe('bloqueado');
    });

    it('no debe crear préstamo con recurso ya prestado', async () => {
      // Crear primer préstamo
      const primerPrestamo = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' }
        });

      // Confirmar préstamo
      await request(app)
        .patch(`/api/docente/prestamo/${primerPrestamo.body.prestamo._id}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ confirmar: true });

      // Intentar crear segundo préstamo con mismo recurso
      const response = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' }
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('prestado');
    });
  });

  // ============================================
  // CONFIRMACIÓN Y RECHAZO DE PRÉSTAMOS
  // ============================================
  describe('Confirmación y Rechazo de Préstamos', () => {
    let prestamoId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' },
          observaciones: 'Préstamo de prueba'
        });

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

    it('debe rechazar préstamo y liberar recursos', async () => {
      const response = await request(app)
        .patch(`/api/docente/prestamo/${prestamoId}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          confirmar: false,
          motivoRechazo: 'No puedo asistir'
        });

      expect(response.status).toBe(200);
      expect(response.body.prestamo.estado).toBe('rechazado');
      expect(response.body.prestamo.observaciones).toContain('RECHAZADO');

      // Verificar recurso
      const recurso = await Recurso.findById(recursoId);
      expect(recurso.estado).toBe('pendiente');
      expect(recurso.asignadoA).toBeNull();
    });

    it('debe confirmar préstamo con recursos adicionales', async () => {
      // Crear préstamo con adicionales
      const prestamoConAdicionales = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' },
          recursosAdicionales: [recursoAdicionalId]
        });

      const prestamoId2 = prestamoConAdicionales.body.prestamo._id;

      // Confirmar
      await request(app)
        .patch(`/api/docente/prestamo/${prestamoId2}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ confirmar: true });

      // Verificar recurso adicional
      const recursoAdicional = await Recurso.findById(recursoAdicionalId);
      expect(recursoAdicional.estado).toBe('prestado');
    });
  });

  // ============================================
  // FINALIZACIÓN DE PRÉSTAMOS
  // ============================================
  describe('Finalización de Préstamos', () => {
    let prestamoActivoId;

    beforeEach(async () => {
      // Crear y confirmar préstamo
      const prestamoResponse = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' },
          recursosAdicionales: [recursoAdicionalId]
        });

      prestamoActivoId = prestamoResponse.body.prestamo._id;

      await request(app)
        .patch(`/api/docente/prestamo/${prestamoActivoId}/confirmar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({ confirmar: true });
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

      const recursoAdicional = await Recurso.findById(recursoAdicionalId);
      expect(recursoAdicional.estado).toBe('pendiente');
      expect(recursoAdicional.asignadoA).toBeNull();
    });

    it('no debe finalizar préstamo que no está activo', async () => {
      // Crear préstamo pendiente
      const prestamoPendiente = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' }
        });

      const response = await request(app)
        .patch(`/api/docente/prestamo/${prestamoPendiente.body.prestamo._id}/finalizar`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // LISTADO Y FILTRADO DE PRÉSTAMOS
  // ============================================
  describe('Listado y Filtrado de Préstamos', () => {
    beforeEach(async () => {
      // Crear varios préstamos en diferentes estados
      const prestamos = [
        {
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' },
          estado: 'pendiente'
        }
      ];

      for (const prestamo of prestamos) {
        await request(app)
          .post('/api/prestamo/crear')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(prestamo);
      }
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
      const response = await request(app)
        .get('/api/docente/prestamos/historial')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('debe obtener detalles de un préstamo específico', async () => {
      // Crear préstamo
      const prestamoResponse = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteId,
          motivo: { tipo: 'Clase', descripcion: '' }
        });

      const prestamoId = prestamoResponse.body.prestamo._id;

      const response = await request(app)
        .get(`/api/docente/prestamo/${prestamoId}`)
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(prestamoId);
      expect(response.body).toHaveProperty('recurso');
      expect(response.body).toHaveProperty('docente');
    });
  });

  // ============================================
  // VALIDACIONES DE MODELOS
  // ============================================
  describe('Validaciones de Modelos de Préstamo', () => {
    it('debe validar motivo tipo enum', async () => {
      const prestamoInvalido = new Prestamo({
        recurso: recursoId,
        docente: docenteId,
        admin: adminId,
        motivo: {
          tipo: 'TipoInvalido', // No es Clase, Proyecto ni Transferencia
          descripcion: ''
        }
      });

      await expect(prestamoInvalido.save()).rejects.toThrow();
    });

    it('debe validar estado enum', async () => {
      const prestamo = new Prestamo({
        recurso: recursoId,
        docente: docenteId,
        admin: adminId,
        motivo: { tipo: 'Clase', descripcion: '' },
        estado: 'estadoInvalido'
      });

      await expect(prestamo.save()).rejects.toThrow();
    });

    it('debe crear préstamo con valores por defecto', async () => {
      const prestamo = new Prestamo({
        recurso: recursoId,
        docente: docenteId,
        admin: adminId,
        motivo: { tipo: 'Clase', descripcion: '' }
      });

      const prestamoGuardado = await prestamo.save();

      expect(prestamoGuardado.estado).toBe('pendiente');
      expect(prestamoGuardado.recursosAdicionales).toEqual([]);
      expect(prestamoGuardado.observaciones).toBe('');
    });
  });
});