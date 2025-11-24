import request from 'supertest';
import app from '../../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Transferencia from '../../models/transferencia.js';
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
  await Transferencia.deleteMany({});
  await Prestamo.deleteMany({});
  await Recurso.deleteMany({});
  await Docente.deleteMany({});
  await Administrador.deleteMany({});
});

describe('Integration - Gestión de Transferencias', () => {
  let adminToken;
  let adminId;
  let docenteOrigenToken;
  let docenteDestinoToken;
  let docenteOrigenId;
  let docenteDestinoId;
  let recursoId;
  let prestamoOrigenId;

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

    // Crear docente origen
    const docenteOrigenResponse = await request(app)
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

    docenteOrigenId = docenteOrigenResponse.body.docente._id;

    // Crear docente destino
    const docenteDestinoResponse = await request(app)
      .post('/api/administrador/registerDocente')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombreDocente: 'Carlos',
        apellidoDocente: 'Ramírez',
        celularDocente: '0987654321',
        emailDocente: 'carlos@gmail.com',
        passwordDocente: 'Docente123!',
        confirmPasswordDocente: 'Docente123!'
      });

    docenteDestinoId = docenteDestinoResponse.body.docente._id;

    // Login docente origen
    const loginOrigenResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria@gmail.com',
        password: 'Docente123!'
      });

    docenteOrigenToken = loginOrigenResponse.body.token;

    // Login docente destino
    const loginDestinoResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'carlos@gmail.com',
        password: 'Docente123!'
      });

    docenteDestinoToken = loginDestinoResponse.body.token;

    // Crear recurso
    const recursoResponse = await request(app)
      .post('/api/recurso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'kit',
        laboratorio: 'Laboratorio de Electrónica',
        aula: 'Aula 301',
        contenido: ['Arduino UNO R3']
      });

    recursoId = recursoResponse.body.recurso._id;

    // Crear préstamo para docente origen
    const prestamoResponse = await request(app)
      .post('/api/prestamo/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        recurso: recursoId,
        docente: docenteOrigenId,
        motivo: { tipo: 'Clase', descripcion: '' }
      });

    prestamoOrigenId = prestamoResponse.body.prestamo._id;

    // Confirmar préstamo
    await request(app)
      .patch(`/api/docente/prestamo/${prestamoOrigenId}/confirmar`)
      .set('Authorization', `Bearer ${docenteOrigenToken}`)
      .send({ confirmar: true });
  });

  // ============================================
  // CREACIÓN DE TRANSFERENCIAS
  // ============================================
  describe('Creación de Transferencias', () => {
    it('debe crear transferencia correctamente', async () => {
      const response = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOrigenId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteDestinoId,
          recursos: [recursoId],
          observaciones: 'Transferencia de prueba'
        });

      expect(response.status).toBe(201);
      expect(response.body.transferencia.estado).toBe('pendiente_origen');
      expect(response.body.transferencia).toHaveProperty('codigoQR');
      expect(response.body.transferencia.docenteOrigen).toBe(docenteOrigenId);
      expect(response.body.transferencia.docenteDestino).toBe(docenteDestinoId);

      // Verificar en DB
      const transferenciaEnDB = await Transferencia.findById(
        response.body.transferencia._id
      );
      expect(transferenciaEnDB).toBeDefined();
      expect(transferenciaEnDB.recursos).toHaveLength(1);
    });

    it('debe generar código QR único', async () => {
      const response = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOrigenId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteDestinoId,
          recursos: [recursoId]
        });

      const codigoQR = response.body.transferencia.codigoQR;
      expect(codigoQR).toBeDefined();
      expect(typeof codigoQR).toBe('string');
      expect(codigoQR.length).toBeGreaterThan(0);

      // Verificar que se puede obtener por QR
      const getResponse = await request(app).get(`/api/transferencia/${codigoQR}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.codigoQR).toBe(codigoQR);
    });

    it('no debe crear transferencia con mismo docente origen y destino', async () => {
      const response = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOrigenId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteOrigenId, // Mismo docente
          recursos: [recursoId]
        });

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // CONFIRMACIÓN DE TRANSFERENCIA (ORIGEN)
  // ============================================
  describe('Confirmación de Transferencia por Docente Origen', () => {
    let codigoQR;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOrigenId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteDestinoId,
          recursos: [recursoId]
        });

      codigoQR = response.body.transferencia.codigoQR;
    });

    it('debe confirmar transferencia como docente origen', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          observaciones: 'Recursos entregados',
          firma: 'María López'
        });

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('confirmado_origen');
      expect(response.body.transferencia.firmaOrigen).toBe('María López');
      expect(response.body.transferencia).toHaveProperty('fechaConfirmacionOrigen');

      // Verificar que se creó préstamo pendiente para destino
      const prestamos = await Prestamo.find({
        docente: docenteDestinoId,
        estado: 'pendiente'
      });
      expect(prestamos.length).toBeGreaterThan(0);
      expect(prestamos[0].motivo.tipo).toBe('Transferencia');
    });

    it('solo docente origen puede confirmar', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`) // Docente equivocado
        .send({});

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // RESPUESTA DE TRANSFERENCIA (DESTINO)
  // ============================================
  describe('Respuesta de Transferencia por Docente Destino', () => {
    let codigoQR;
    let prestamoDestinoId;

    beforeEach(async () => {
      // Crear transferencia
      const transferenciaResponse = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOrigenId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteDestinoId,
          recursos: [recursoId]
        });

      codigoQR = transferenciaResponse.body.transferencia.codigoQR;

      // Confirmar origen
      await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({});

      // Obtener préstamo pendiente del destino
      const prestamosResponse = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      prestamoDestinoId = prestamosResponse.body[0]._id;
    });

    it('debe aceptar transferencia como docente destino', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: true,
          observaciones: 'Recursos recibidos',
          firma: 'Carlos Ramírez',
          nuevoMotivo: {
            tipo: 'Clase',
            descripcion: 'Para laboratorio'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('finalizado');
      expect(response.body.nuevoPrestamo.estado).toBe('activo');

      // Verificar recurso asignado a docente destino
      const recurso = await Recurso.findById(recursoId);
      expect(recurso.asignadoA.toString()).toBe(docenteDestinoId);
      expect(recurso.estado).toBe('prestado');

      // Verificar préstamo original finalizado
      const prestamoOrigen = await Prestamo.findById(prestamoOrigenId);
      expect(prestamoOrigen.estado).toBe('finalizado');
    });

    it('debe rechazar transferencia como docente destino', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: false,
          observaciones: 'No necesito los recursos',
          firma: 'Carlos Ramírez'
        });

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('rechazado');

      // Verificar recurso vuelve a docente origen
      const recurso = await Recurso.findById(recursoId);
      expect(recurso.asignadoA.toString()).toBe(docenteOrigenId);
      expect(recurso.estado).toBe('prestado');

      // Verificar préstamo origen sigue activo
      const prestamoOrigen = await Prestamo.findById(prestamoOrigenId);
      expect(prestamoOrigen.estado).toBe('activo');
    });

    it('solo docente destino puede responder', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`) // Docente equivocado
        .send({ aceptar: true });

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // CANCELACIÓN DE TRANSFERENCIAS
  // ============================================
  describe('Cancelación de Transferencias', () => {
    let codigoQR;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOrigenId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteDestinoId,
          recursos: [recursoId]
        });

      codigoQR = response.body.transferencia.codigoQR;
    });

    it('debe cancelar transferencia pendiente', async () => {
      const response = await request(app)
        .patch(`/api/transferencia/${codigoQR}/cancelar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          motivoCancelacion: 'Ya no es necesaria'
        });

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('cancelado');

      // Verificar transferencia en DB
      const transferencia = await Transferencia.findOne({ codigoQR });
      expect(transferencia.estado).toBe('cancelado');
    });

    it('debe cancelar transferencia confirmada por origen', async () => {
      // Confirmar origen primero
      await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({});

      // Cancelar
      const response = await request(app)
        .patch(`/api/transferencia/${codigoQR}/cancelar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('cancelado');

      // Verificar préstamo pendiente del destino fue eliminado
      const prestamos = await Prestamo.find({
        docente: docenteDestinoId,
        estado: 'pendiente'
      });
      expect(prestamos.length).toBe(0);
    });
  });

  // ============================================
  // ESTADOS DE TRANSFERENCIA
  // ============================================
  describe('Estados de Transferencia', () => {
    it('debe seguir flujo completo de estados', async () => {
      // 1. Crear (pendiente_origen)
      const crearResponse = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOrigenId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteDestinoId,
          recursos: [recursoId]
        });

      const codigoQR = crearResponse.body.transferencia.codigoQR;
      let transferencia = await Transferencia.findOne({ codigoQR });
      expect(transferencia.estado).toBe('pendiente_origen');

      // 2. Confirmar origen (confirmado_origen)
      await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({});

      transferencia = await Transferencia.findOne({ codigoQR });
      expect(transferencia.estado).toBe('confirmado_origen');

      // 3. Aceptar destino (finalizado)
      await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({ aceptar: true });

      transferencia = await Transferencia.findOne({ codigoQR });
      expect(transferencia.estado).toBe('finalizado');
    });
  });

  // ============================================
  // VALIDACIONES DE MODELOS
  // ============================================
  describe('Validaciones de Modelos de Transferencia', () => {
    it('debe validar estado enum', async () => {
      const transferenciaInvalida = new Transferencia({
        prestamoOriginal: prestamoOrigenId,
        docenteOrigen: docenteOrigenId,
        docenteDestino: docenteDestinoId,
        recursos: [recursoId],
        estado: 'estadoInvalido',
        codigoQR: 'test-qr'
      });

      await expect(transferenciaInvalida.save()).rejects.toThrow();
    });

    it('debe crear transferencia con valores por defecto', async () => {
      const transferencia = new Transferencia({
        prestamoOriginal: prestamoOrigenId,
        docenteOrigen: docenteOrigenId,
        docenteDestino: docenteDestinoId,
        recursos: [recursoId],
        codigoQR: 'test-qr-unique-123'
      });

      const transferenciaGuardada = await transferencia.save();

      expect(transferenciaGuardada.estado).toBe('pendiente_origen');
      expect(transferenciaGuardada.recursosAdicionales).toEqual([]);
    });
  });
});