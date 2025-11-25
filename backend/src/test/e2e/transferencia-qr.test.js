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

describe('E2E - Transferencia con QR y mensaje por chat', () => {
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


  beforeEach(async () => {
    // crear ADMIN
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

    // crear DOCENTE ORIGEN
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

    // crear DOCENTE DESTINO
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

    // LOGIN DOCENTES
    const loginOrigen = await request(app)
      .post('/api/login')
      .send({ email: 'docenteorigen@gmail.com', password: 'DocenteOrigen123!' });
    expect(loginOrigen.status).toBe(200);
    docenteOrigenToken = loginOrigen.body.token;

    const loginDestino = await request(app)
      .post('/api/login')
      .send({ email: 'docentedestino@gmail.com', password: 'DocenteDestino123!' });
    expect(loginDestino.status).toBe(200);
    docenteDestinoToken = loginDestino.body.token;

    // RECURSO
    const recursoResponse = await request(app)
      .post('/api/administrador/recurso/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'kit',
        laboratorio: 'LAB 22B',
        aula: 'E034',
        contenido: ['CABLE VGA', 'CONTROL'],
      });

    expect(recursoResponse.status).toBe(201);
    recursoId = recursoResponse.body.recurso._id;

    // PRÉSTAMO ORIGINAL
    const prestamoResponse = await request(app)
      .post('/api/administrador/prestamo/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        recurso: recursoId,
        docente: docenteOrigenId,
        motivo: { tipo: 'Clase', descripcion: '' },
        observaciones: 'Préstamo inicial',
      });

    expect(prestamoResponse.status).toBe(201);
    prestamoOriginalId = prestamoResponse.body.prestamo._id;

    // CONFIRMAR PRÉSTAMO ORIGINAL
    const confirmar = await request(app)
      .patch(`/api/docente/prestamo/${prestamoOriginalId}/confirmar`)
      .set('Authorization', `Bearer ${docenteOrigenToken}`)
      .send({ confirmar: true });

    expect(confirmar.status).toBe(200);
    expect(confirmar.body.prestamo.estado).toBe('activo');
  });

  // ADMIN CREA TRANSFERENCIA
  describe('PASO 1: Administrador crea transferencia', () => {
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

    // no permite transferir a sí mismo
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

  // DOCENTE ORIGEN CONFIRMA (ESCANEA QR)
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

      expect(response.status).toBe(201);
      transferenciaId = response.body.transferencia._id;
      codigoQR = response.body.transferencia.codigoQR;
    });

    it('debe obtener transferencia por código QR', async () => {
      const response = await request(app).get(`/api/transferencia/${codigoQR}`);

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

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('confirmado_origen');
      expect(response.body.transferencia).toHaveProperty('fechaConfirmacionOrigen');

      const prestamosDestino = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      expect(prestamosDestino.status).toBe(200);
      const prestamoTransferencia = prestamosDestino.body.find(
        (p) => p.motivo.tipo === 'Transferencia',
      );
      expect(prestamoTransferencia).toBeDefined();
      expect(prestamoTransferencia.estado).toBe('pendiente');
    });

    // otro docente no puede confirmar
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

  //ENVIAR MENSAJE DE TRANSFERENCIA POR CHAT
  describe('PASO 3: Enviar mensaje de transferencia por chat', () => {
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

      expect(enviar.status).toBe(200);
      const chatHistory = await request(app)
        .get(`/api/chat/chat-history/${adminId}`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      expect(chatHistory.status).toBe(200);
      expect(Array.isArray(chatHistory.body)).toBe(true);
      const msgTransf = chatHistory.body.find((m) => m.tipo === 'transferencia');
      expect(msgTransf).toBeDefined();
      expect(msgTransf.transferencia.codigo).toBe(codigoQR);
    });
  });

  //DOCENTE DESTINO RESPONDE TRANSFERENCIA
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

      expect(crear.status).toBe(201);
      codigoQR = crear.body.transferencia.codigoQR;

      const confirmar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          observaciones: 'Recursos entregados en buen estado',
          firma: docenteOrigenId,
        });

      expect(confirmar.status).toBe(200);

      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

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

      expect(aceptar.status).toBe(200);

      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

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

      expect(aceptar.status).toBe(200);

      const response = await request(app)
        .get(`/api/administrador/recurso/${recursoId}`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('prestado');

      // asignadoA viene populado como objeto Docente
      expect(response.body.asignadoA).toBeDefined();
      expect(response.body.asignadoA._id.toString()).toBe(docenteDestinoId);
    });

    // docente destino puede rechazar transferencia
    it('docente destino puede rechazar transferencia', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: false,
          observaciones: 'No puedo recibir ahora',
          firma: docenteDestinoId,
        });

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('rechazado');
    });
  });

  // VALIDAR FINALIZACIÓN
  describe('PASO 5: Validar transferencia finalizada', () => {
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

      expect(crear.status).toBe(201);
      codigoQR = crear.body.transferencia.codigoQR;

      const confirmar = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          observaciones: 'Recursos entregados en buen estado',
          firma: docenteOrigenId,
        });

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

      expect(aceptar.status).toBe(200);
    });

    it('transferencia debe tener estado finalizado', async () => {
      const response = await request(app).get(`/api/transferencia/${codigoQR}`);

      //Puede ser 200 si devuelve decide devolver 'ok' o 410 si esta caducada
      expect([200, 410]).toContain(response.status);
      expect(response.body.estado).toBe('finalizado'); //lo importante es el estado 'finalizado'
    });
    // préstamo original debe estar finalizado
    it('préstamo original debe estar finalizado', async () => {
      const prestamo = await Prestamo.findById(prestamoOriginalId);
      expect(prestamo).not.toBeNull();
      expect(prestamo.estado).toBe('finalizado');
    });
  });
});