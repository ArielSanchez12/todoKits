import request from 'supertest';
import app from '../../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Admin from '../../models/admin.js';
import Docente from '../../models/docente.js';
import Recurso from '../../models/recurso.js';
import Prestamo from '../../models/prestamo.js';
import Transferencia from '../../models/transferencia.js';
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
  await Transferencia.deleteMany({});
  await Prestamo.deleteMany({});
  await Recurso.deleteMany({});
  await Docente.deleteMany({});
  await Admin.deleteMany({});
});

describe('E2E - Transferencia con QR y Mensaje por Chat', () => {
  let adminToken;
  let adminId;
  let docenteOrigenToken;
  let docenteDestinoToken;
  let docenteOrigenId;
  let docenteDestinoId;
  let recursoId;
  let prestamoOriginalId;
  let transferenciaId;
  let codigoQR;

  const logIfError = (label, res, expected) => {
    if (res.status !== expected) {
      // eslint-disable-next-line no-console
      console.log(`❌ [${label}] status=${res.status}`, res.body);
    }
  };

  beforeEach(async () => {
    // 1) ADMIN
    const admin = new Admin({
      nombre: 'Admin Prueba',
      apellido: 'Sanchez',
      celular: '0998765432',
      email: 'admin@test.com',
      password: 'Temp',
      confirmEmail: true,
      rol: 'Administrador',
    });
    admin.password = await admin.encryptPassword('Admin123!');
    await admin.save();

    adminId = admin._id.toString();
    adminToken = crearTokenJWT(adminId, admin.rol);

    // 2) DOCENTE ORIGEN
    const docenteOrigen = new Docente({
      nombreDocente: 'Docente Origen',
      apellidoDocente: 'López Prueba',
      celularDocente: '0998765432',
      emailDocente: 'docenteorigen@gmail.com',
      passwordDocente: 'Temp',
      confirmEmailDocente: true,
      rolDocente: 'Docente',
      admin: adminId,
    });
    docenteOrigen.passwordDocente = await docenteOrigen.encryptPassword('DocenteOrigen123!');
    await docenteOrigen.save();
    docenteOrigenId = docenteOrigen._id.toString();

    // 3) DOCENTE DESTINO
    const docenteDestino = new Docente({
      nombreDocente: 'Docente Destino',
      apellidoDocente: 'Ramírez Prueba',
      celularDocente: '0987654321',
      emailDocente: 'docentedestino@gmail.com',
      passwordDocente: 'Temp',
      confirmEmailDocente: true,
      rolDocente: 'Docente',
      admin: adminId,
    });
    docenteDestino.passwordDocente = await docenteDestino.encryptPassword('DocenteDestino123!');
    await docenteDestino.save();
    docenteDestinoId = docenteDestino._id.toString();

    // 4) LOGIN DOCENTES
    const loginOrigen = await request(app)
      .post('/api/login')
      .send({ email: 'docenteorigen@gmail.com', password: 'DocenteOrigen123!' });
    logIfError('Login Docente Origen', loginOrigen, 200);
    expect(loginOrigen.status).toBe(200);
    docenteOrigenToken = loginOrigen.body.token;

    const loginDestino = await request(app)
      .post('/api/login')
      .send({ email: 'docentedestino@gmail.com', password: 'DocenteDestino123!' });
    logIfError('Login Docente Destino', loginDestino, 200);
    expect(loginDestino.status).toBe(200);
    docenteDestinoToken = loginDestino.body.token;

    // 5) RECURSO
    const recursoResponse = await request(app)
      .post('/api/administrador/recurso/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'kit',
        laboratorio: 'LAB 23A',
        aula: 'E030',
        contenido: ['CABLE VGA', 'CONTROL'],
      });

    logIfError('Crear Recurso para Préstamo', recursoResponse, 201);
    expect(recursoResponse.status).toBe(201);
    recursoId = recursoResponse.body.recurso._id;

    // 6) PRÉSTAMO ORIGINAL
    const prestamoResponse = await request(app)
      .post('/api/administrador/prestamo/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        recurso: recursoId,
        docente: docenteOrigenId,
        motivo: { tipo: 'Clase', descripcion: '' },
        observaciones: 'Préstamo inicial',
      });

    logIfError('Crear Préstamo Original', prestamoResponse, 201);
    expect(prestamoResponse.status).toBe(201);
    prestamoOriginalId = prestamoResponse.body.prestamo._id;

    // 7) CONFIRMAR PRÉSTAMO ORIGINAL
    const confirmar = await request(app)
      .patch(`/api/docente/prestamo/${prestamoOriginalId}/confirmar`)
      .set('Authorization', `Bearer ${docenteOrigenToken}`)
      .send({ confirmar: true });

    logIfError('Confirmar Préstamo Original', confirmar, 200);
    expect(confirmar.status).toBe(200);
    expect(confirmar.body.prestamo.estado).toBe('activo');
  });

  // PASO 1: ADMIN CREA TRANSFERENCIA
  describe('PASO 1: Administrador crea Transferencia', () => {
    it('debe crear transferencia exitosamente y generar QR', async () => {
      const response = await request(app)
        .post('/api/administrador/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoId: prestamoOriginalId,
          docenteDestinoId: docenteDestinoId,
          recursosSeleccionados: {
            principales: [recursoId],
            adicionales: [],
          },
        });

      logIfError('Crear Transferencia', response, 201);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('transferencia');
      expect(response.body.transferencia.estado).toBe('pendiente_origen');
      expect(response.body.transferencia).toHaveProperty('codigoQR');

      transferenciaId = response.body.transferencia._id;
      codigoQR = response.body.transferencia.codigoQR;

      expect(codigoQR).toBeDefined();
      expect(typeof codigoQR).toBe('string');
      expect(codigoQR.length).toBeGreaterThan(0);
    });

    // ✅ nuevo test: no permite transferir a sí mismo
    it('no debe permitir transferencia al mismo docente', async () => {
      const response = await request(app)
        .post('/api/administrador/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoId: prestamoOriginalId,
          docenteDestinoId: docenteOrigenId, // mismo origen
          recursosSeleccionados: {
            principales: [recursoId],
            adicionales: [],
          },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg');
    });
  });

  // PASO 2: DOCENTE ORIGEN CONFIRMA (ESCANEA QR)
  describe('PASO 2: Docente origen confirma transferencia (Escanea QR)', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/administrador/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoId: prestamoOriginalId,
          docenteDestinoId: docenteDestinoId,
          recursosSeleccionados: {
            principales: [recursoId],
            adicionales: [],
          },
        });

      logIfError('Crear Transferencia (Paso2 setup)', response, 201);
      expect(response.status).toBe(201);
      transferenciaId = response.body.transferencia._id;
      codigoQR = response.body.transferencia.codigoQR;
    });

    it('debe obtener transferencia por código QR', async () => {
      const response = await request(app).get(`/api/transferencia/${codigoQR}`);

      logIfError('Obtener Transferencia por QR', response, 200);
      expect(response.status).toBe(200);
      expect(response.body.codigoQR).toBe(codigoQR);
      expect(response.body.estado).toBe('pendiente_origen');
    });

    it('docente origen debe confirmar transferencia', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          observaciones: 'Recursos entregados en buen estado',
          firma: docenteOrigenId,
        });

      logIfError('Confirmar Transferencia Origen', response, 200);
      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('confirmado_origen');
      expect(response.body.transferencia).toHaveProperty('fechaConfirmacionOrigen');

      const prestamosDestino = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      logIfError(
        'Listar Préstamos Docente Destino tras confirmación origen',
        prestamosDestino,
        200,
      );
      expect(prestamosDestino.status).toBe(200);
      const prestamoTransferencia = prestamosDestino.body.find(
        (p) => p.motivo.tipo === 'Transferencia',
      );
      expect(prestamoTransferencia).toBeDefined();
      expect(prestamoTransferencia.estado).toBe('pendiente');
    });

    // ✅ nuevo test: otro docente no puede confirmar
    it('debe rechazar confirmación por docente que no es origen', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          observaciones: 'Intento malicioso',
          firma: docenteDestinoId,
        });

      expect([400, 403]).toContain(response.status);
    });
  });

  // PASO 3: ENVIAR MENSAJE DE TRANSFERENCIA POR CHAT
  describe('PASO 3: Enviar Mensaje de Transferencia por Chat', () => {
    beforeEach(async () => {
      const crear = await request(app)
        .post('/api/administrador/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoId: prestamoOriginalId,
          docenteDestinoId: docenteDestinoId,
          recursosSeleccionados: {
            principales: [recursoId],
            adicionales: [],
          },
        });

      logIfError('Crear Transferencia (Paso3 setup)', crear, 201);
      expect(crear.status).toBe(201);
      transferenciaId = crear.body.transferencia._id;
      codigoQR = crear.body.transferencia.codigoQR;

      const confirmar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          observaciones: 'Recursos entregados en buen estado',
          firma: docenteOrigenId,
        });

      logIfError('Confirmar Transferencia Origen (Paso3 setup)', confirmar, 200);
      expect(confirmar.status).toBe(200);
    });

    it('admin debe poder enviar transferencia por chat al docente destino', async () => {
      const response = await request(app)
        .post('/api/chat/enviar-transferencia')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          codigoTransferencia: codigoQR,
          docenteDestinoId: docenteDestinoId,
        });

      logIfError('Enviar Transferencia por Chat', response, 200);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje.tipo).toBe('transferencia');
      expect(response.body.mensaje.transferencia.codigo).toBe(codigoQR);
    });

    it('docente destino debe poder ver el mensaje de transferencia en el historial de chat', async () => {
      const enviar = await request(app)
        .post('/api/chat/enviar-transferencia')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          codigoTransferencia: codigoQR,
          docenteDestinoId: docenteDestinoId,
        });

      logIfError('Enviar Transferencia por Chat (Paso3 hist)', enviar, 200);
      expect(enviar.status).toBe(200);

      const chatHistory = await request(app)
        .get(`/api/chat/chat-history/${adminId}`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      logIfError('Historial Chat Docente Destino', chatHistory, 200);
      expect(chatHistory.status).toBe(200);
      expect(Array.isArray(chatHistory.body)).toBe(true);
      const msgTransf = chatHistory.body.find((m) => m.tipo === 'transferencia');
      expect(msgTransf).toBeDefined();
      expect(msgTransf.transferencia.codigo).toBe(codigoQR);
    });
  });

  // PASO 4: DOCENTE DESTINO RESPONDE TRANSFERENCIA
  describe('PASO 4: Docente destino responde transferencia', () => {
    let prestamoDestinoId;

    beforeEach(async () => {
      const crear = await request(app)
        .post('/api/administrador/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoId: prestamoOriginalId,
          docenteDestinoId: docenteDestinoId,
          recursosSeleccionados: {
            principales: [recursoId],
            adicionales: [],
          },
        });

      logIfError('Crear Transferencia (Paso4 setup)', crear, 201);
      expect(crear.status).toBe(201);
      codigoQR = crear.body.transferencia.codigoQR;

      const confirmar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          observaciones: 'Recursos entregados en buen estado',
          firma: docenteOrigenId,
        });

      logIfError('Confirmar Transferencia Origen (Paso4 setup)', confirmar, 200);
      expect(confirmar.status).toBe(200);

      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      logIfError('Listar Préstamos Destino (Paso4 setup)', response, 200);
      expect(response.status).toBe(200);
      const prestamoTransferencia = response.body.find(
        (p) => p.motivo.tipo === 'Transferencia',
      );
      expect(prestamoTransferencia).toBeDefined();
      prestamoDestinoId = prestamoTransferencia._id;
    });

    it('docente destino debe aceptar transferencia', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: true,
          observaciones: 'Recursos recibidos correctamente',
          firma: docenteDestinoId,
          nuevoMotivo: {
            tipo: 'Clase',
            descripcion: 'Uso para laboratorio',
          },
        });

      logIfError('Responder Transferencia Destino', response, 200);
      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('finalizado');
      expect(response.body.transferencia).toHaveProperty(
        'fechaConfirmacionDestino',
      );
    });

    it('nuevo préstamo debe estar activo para docente destino', async () => {
      const aceptar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: true,
          observaciones: 'Recursos recibidos correctamente',
          firma: docenteDestinoId,
          nuevoMotivo: {
            tipo: 'Clase',
            descripcion: 'Uso para laboratorio',
          },
        });

      logIfError('Responder Transferencia Destino (Paso4 activo)', aceptar, 200);
      expect(aceptar.status).toBe(200);

      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      logIfError(
        'Listar Préstamos Docente Destino tras aceptar',
        response,
        200,
      );
      expect(response.status).toBe(200);
      const prestamoActivo = response.body.find((p) => p.estado === 'activo');
      expect(prestamoActivo).toBeDefined();
      expect(prestamoActivo.motivo.tipo).toBe('Clase');
    });

    it('recurso debe estar asignado a docente destino', async () => {
      const aceptar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: true,
          observaciones: 'Recursos recibidos correctamente',
          firma: docenteDestinoId,
          nuevoMotivo: {
            tipo: 'Clase',
            descripcion: 'Uso para laboratorio',
          },
        });

      logIfError(
        'Responder Transferencia Destino (Paso4 recurso)',
        aceptar,
        200,
      );
      expect(aceptar.status).toBe(200);

      const response = await request(app)
        .get(`/api/administrador/recurso/${recursoId}`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      logIfError('Recurso tras Transferencia', response, 200);
      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('prestado');

      // asignadoA viene populado como objeto Docente
      expect(response.body.asignadoA).toBeDefined();
      expect(response.body.asignadoA._id.toString()).toBe(docenteDestinoId);
    });

    // ✅ nuevo test: docente destino puede rechazar transferencia
    it('docente destino puede rechazar transferencia', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: false,
          observaciones: 'No puedo recibir ahora',
          firma: docenteDestinoId,
        });

      logIfError('Rechazar Transferencia Destino', response, 200);
      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('rechazado');
    });
  });

  // PASO 5: VALIDAR FINALIZACIÓN
  describe('PASO 5: Validar Transferencia Finalizada', () => {
    beforeEach(async () => {
      const crear = await request(app)
        .post('/api/administrador/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoId: prestamoOriginalId,
          docenteDestinoId: docenteDestinoId,
          recursosSeleccionados: {
            principales: [recursoId],
            adicionales: [],
          },
        });

      logIfError('Crear Transferencia (Paso5 setup)', crear, 201);
      expect(crear.status).toBe(201);
      codigoQR = crear.body.transferencia.codigoQR;

      const confirmar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          observaciones: 'Recursos entregados en buen estado',
          firma: docenteOrigenId,
        });

      logIfError('Confirmar Transferencia Origen (Paso5 setup)', confirmar, 200);
      expect(confirmar.status).toBe(200);

      const aceptar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: true,
          observaciones: 'Recursos recibidos correctamente',
          firma: docenteDestinoId,
          nuevoMotivo: { tipo: 'Clase', descripcion: 'Uso para laboratorio' },
        });

      logIfError(
        'Responder Transferencia Destino (Paso5 setup)',
        aceptar,
        200,
      );
      expect(aceptar.status).toBe(200);
    });

    it('transferencia debe tener estado finalizado', async () => {
      const response = await request(app).get(`/api/transferencia/${codigoQR}`);

      //Puede ser 200 si devuelve decide devolver 'ok' o 410 si esta caducada
      logIfError('Obtener Transferencia Finalizada', response, 200);
      expect([200, 410]).toContain(response.status);
      expect(response.body.estado).toBe('finalizado'); //lo importante es el estado 'finalizado'
    });
    // ✅ nuevo test: préstamo original debe estar finalizado
    it('préstamo original debe estar finalizado', async () => {
      const prestamo = await Prestamo.findById(prestamoOriginalId);
      expect(prestamo).not.toBeNull();
      expect(prestamo.estado).toBe('finalizado');
    });
  });
});