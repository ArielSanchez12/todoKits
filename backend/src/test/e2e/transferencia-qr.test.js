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

describe('Transferencia con QR y Mensaje por Chat', () => {
  let adminToken;
  let docenteOrigenToken;
  let docenteDestinoToken;
  let docenteOrigenId;
  let docenteDestinoId;
  let recursoId;
  let prestamoOriginalId;
  let transferenciaId;
  let codigoQR;

  const adminData = {
    nombre: 'Admin Prueba',
    apellido: 'Sanchez',
    email: 'admin@gmail.com',
    password: 'Admin123!',
    //confirmPassword: 'Admin123!'
  };

  const docenteOrigenData = {
    nombreDocente: 'Docente Origen',
    apellidoDocente: 'López Prueba',
    celularDocente: '0998765432',
    emailDocente: 'docenteorigen@gmail.com',
    passwordDocente: 'Docente123!',
    //confirmPasswordDocente: 'Docente123!'
  };

  const docenteDestinoData = {
    nombreDocente: 'Docente Destino',
    apellidoDocente: 'Ramírez Prueba',
    celularDocente: '0987654321',
    emailDocente: 'docentedestino@gmail.com',
    passwordDocente: 'Docente123!',
    //confirmPasswordDocente: 'Docente123!'
  };

  // PREPARAR EL AMBIENTE
  describe('Preparar ambiente para transferencia', () => {
    it('debe registrar administrador', async () => {
      const response = await request(app)
        .post('/api/register')
        .send(adminData);

      expect(response.status).toBe(201);
      adminToken = response.body.token;
    });

    it('debe registrar docente origen', async () => {
      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteOrigenData);

      expect(response.status).toBe(201);
      docenteOrigenId = response.body.docente._id;
    });

    it('debe registrar docente destino', async () => {
      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteDestinoData);

      expect(response.status).toBe(201);
      docenteDestinoId = response.body.docente._id;
    });

    it('docente origen debe poder login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: docenteOrigenData.emailDocente,
          password: docenteOrigenData.passwordDocente
        });

      expect(response.status).toBe(200);
      docenteOrigenToken = response.body.token;
    });

    it('docente destino debe poder login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: docenteDestinoData.emailDocente,
          password: docenteDestinoData.passwordDocente
        });

      expect(response.status).toBe(200);
      docenteDestinoToken = response.body.token;
    });

    it('debe crear recurso para préstamo', async () => {
      const response = await request(app)
        .post('/api/recurso')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tipo: 'kit',
          laboratorio: 'LAB 23A',
          aula: 'E030',
          contenido: ['CABLE VGA', 'CONTROL']
        });

      expect(response.status).toBe(201);
      recursoId = response.body.recurso._id;
    });

    it('debe crear préstamo para docente origen', async () => {
      const response = await request(app)
        .post('/api/prestamo/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recurso: recursoId,
          docente: docenteOrigenId,
          motivo: { tipo: 'Clase' },
          observaciones: 'Préstamo inicial'
        });

      expect(response.status).toBe(201);
      prestamoOriginalId = response.body.prestamo._id;
    });

    it('docente origen confirma préstamo', async () => {
      const response = await request(app)
        .patch(`/api/docente/prestamo/${prestamoOriginalId}/confirmar`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({ confirmar: true });

      expect(response.status).toBe(200);
      expect(response.body.prestamo.estado).toBe('activo');
    });
  });

  // PASO 1: ADMIN CREA TRANSFERENCIA
  describe('PASO 1: Administrador crea Transferencia', () => {
    it('debe crear transferencia exitosamente', async () => {
      const response = await request(app)
        .post('/api/transferencia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prestamoOrigen: prestamoOriginalId,
          docenteOrigen: docenteOrigenId,
          docenteDestino: docenteDestinoId,
          recursos: [recursoId],
          //observaciones: 'Transferencia' las transferencias no llevan observaciones al crearlas o si?
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('transferencia');
      expect(response.body.transferencia.estado).toBe('pendiente_origen');
      expect(response.body.transferencia).toHaveProperty('codigoQR');

      transferenciaId = response.body.transferencia._id;
      codigoQR = response.body.transferencia.codigoQR;
    });

    it('debe generar código QR válido', async () => {
      expect(codigoQR).toBeDefined();
      expect(typeof codigoQR).toBe('string');
      expect(codigoQR.length).toBeGreaterThan(0);
    });
  });

  // PASO 2: DOCENTE ORIGEN CONFIRMA (ESCANEA QR)
  describe('PASO 2: Docente origen confirma transferencia (Escanea QR)', () => {
    it('debe obtener transferencia por código QR', async () => {
      const response = await request(app)
        .get(`/api/transferencia/${codigoQR}`);

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
          //firma: 'María López' la firma debe ser el ObjectId no el nombre
        });

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('confirmado_origen');
      expect(response.body.transferencia).toHaveProperty('fechaConfirmacionOrigen');
      expect(response.body.transferencia.firmaOrigen).toBe('María López');
    });

    it('debe crear préstamo pendiente para docente destino', async () => {
      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      const prestamoTransferencia = response.body.find(
        p => p.motivo.tipo === 'Transferencia'
      );
      expect(prestamoTransferencia).toBeDefined();
      expect(prestamoTransferencia.estado).toBe('pendiente');
    });
  });

  // PASO 3: ENVIAR MENSAJE DE TRANSFERENCIA POR CHAT
  describe('PASO 3: Enviar Mensaje de Transferencia por Chat', () => {
    it('docente origen debe poder enviar mensaje al admin', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${docenteOrigenToken}`)
        .send({
          texto: 'He confirmado la transferencia del KIT #1', //CORREGIR ESTO, DEBE BASARSE EN LO DEL FRONTEND PARA ENVIAR LA TRANSFERENCIA POR CHAT
          de: docenteOrigenId,
          deNombre: 'María López',
          para: adminData._id || 'admin',
          paraNombre: 'Gregory Sanchez',
          deTipo: 'docente',
          paraTipo: 'admin'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.texto).toBe('He confirmado la transferencia del KIT #1');
    });

    it('debe poder obtener historial de chat', async () => {
      const response = await request(app)
        .get(`/api/chat/chat-history/${adminData._id || 'admin'}`)
        .set('Authorization', `Bearer ${docenteOrigenToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // PASO 4: DOCENTE DESTINO RESPONDE TRANSFERENCIA
  describe('PASO 4: Docente Destino Responde Transferencia', () => {
    let prestamoDestinoId;

    beforeAll(async () => {
      // Obtener el préstamo pendiente para docente destino
      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      const prestamoTransferencia = response.body.find(
        p => p.motivo.tipo === 'Transferencia'
      );
      prestamoDestinoId = prestamoTransferencia._id;
    });

    it('docente destino debe aceptar transferencia', async () => {
      const response = await request(app)
        .patch(`/api/docente/transferencia/${codigoQR}/responder`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`)
        .send({
          aceptar: true,
          observaciones: 'Recursos recibidos correctamente',
          firma: 'Carlos Ramírez', //LO MIMSO, LA FIRMA  NO PUEDE SER EL NOMBRE
          nuevoMotivo: {
            tipo: 'Clase',
            descripcion: 'Uso para laboratorio'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.transferencia.estado).toBe('finalizado');
      expect(response.body.transferencia).toHaveProperty('fechaConfirmacionDestino');
    });

    it('nuevo préstamo debe estar activo para docente destino', async () => {
      const response = await request(app)
        .get('/api/docente/prestamos')
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      expect(response.status).toBe(200);
      const prestamoActivo = response.body.find(p => p.estado === 'activo');
      expect(prestamoActivo).toBeDefined();
      expect(prestamoActivo.motivo.tipo).toBe('Clase');
    });

    it('recurso debe estar asignado a docente destino', async () => {
      const response = await request(app)
        .get(`/api/recurso/${recursoId}`)
        .set('Authorization', `Bearer ${docenteDestinoToken}`);

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('prestado');
      expect(response.body.asignadoA).toBe(docenteDestinoId);
    });
  });

  // PASO 5: VALIDAR FINALIZACIÓN
  describe('PASO 5: Validar Transferencia Finalizada', () => {
    it('transferencia debe tener estado finalizado', async () => {
      const response = await request(app)
        .get(`/api/transferencia/${codigoQR}`);

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('finalizado');
    });

    it('docente origen debe ver préstamo en historial', async () => {
      const response = await request(app)
        .get('/api/docente/prestamos/historial')
        .set('Authorization', `Bearer ${docenteOrigenToken}`);

      expect(response.status).toBe(200);
      const prestamoFinalizado = response.body.find(
        p => p.motivo.tipo === 'Transferencia'
      );
      expect(prestamoFinalizado).toBeDefined();
    });
  });

  // // BONUS: PRUEBA DE RECHAZO DE TRANSFERENCIA
  // describe('BONUS: Docente Destino Rechaza Transferencia', () => {
  //   let adminToken2;
  //   let docenteOrigen2Token;
  //   let docenteDestino2Token;
  //   let docenteOrigen2Id;
  //   let docenteDestino2Id;
  //   let recurso2Id;
  //   let prestamoOrigen2Id;
  //   let codigoQR2;

  //   beforeAll(async () => {
  //     // Setup para segunda transferencia
  //     const adminRes = await request(app)
  //       .post('/api/register')
  //       .send({
  //         nombre: 'Pedro',
  //         apellido: 'García',
  //         email: 'admin2@gmail.com',
  //         password: 'Admin123!',
  //         //confirmPassword: 'Admin123!'
  //       });
  //     adminToken2 = adminRes.body.token;

  //     const docOrig = await request(app)
  //       .post('/api/administrador/registerDocente')
  //       .set('Authorization', `Bearer ${adminToken2}`)
  //       .send({
  //         nombreDocente: 'Ana',
  //         apellidoDocente: 'Morales',
  //         celularDocente: '0998765432',
  //         emailDocente: 'ana@gmail.com',
  //         passwordDocente: 'Docente123!',
  //         //confirmPasswordDocente: 'Docente123!'
  //       });
  //     docenteOrigen2Id = docOrig.body.docente._id;

  //     const docDest = await request(app)
  //       .post('/api/administrador/registerDocente')
  //       .set('Authorization', `Bearer ${adminToken2}`)
  //       .send({
  //         nombreDocente: 'Diego',
  //         apellidoDocente: 'Herrera',
  //         celularDocente: '0987654321',
  //         emailDocente: 'diego@gmail.com',
  //         passwordDocente: 'Docente123!',
  //         //confirmPasswordDocente: 'Docente123!'
  //       });
  //     docenteDestino2Id = docDest.body.docente._id;

  //     const docOrigLogin = await request(app)
  //       .post('/api/auth/login')
  //       .send({
  //         email: 'ana@gmail.com',
  //         password: 'Docente123!'
  //       });
  //     docenteOrigen2Token = docOrigLogin.body.token;

  //     const docDestLogin = await request(app)
  //       .post('/api/auth/login')
  //       .send({
  //         email: 'diego@gmail.com',
  //         password: 'Docente123!'
  //       });
  //     docenteDestino2Token = docDestLogin.body.token;

  //     // Crear recurso y préstamo
  //     const recursoRes = await request(app)
  //       .post('/api/recurso')
  //       .set('Authorization', `Bearer ${adminToken2}`)
  //       .send({
  //         tipo: 'llave',
  //         laboratorio: 'Laboratorio de Sistemas',
  //         aula: 'Aula 101',
  //         contenido: []
  //       });
  //     recurso2Id = recursoRes.body.recurso._id;

  //     const prestamoRes = await request(app)
  //       .post('/api/prestamo/crear')
  //       .set('Authorization', `Bearer ${adminToken2}`)
  //       .send({
  //         recurso: recurso2Id,
  //         docente: docenteOrigen2Id,
  //         motivo: { tipo: 'Clase', descripcion: '' }
  //       });
  //     prestamoOrigen2Id = prestamoRes.body.prestamo._id;

  //     await request(app)
  //       .patch(`/api/docente/prestamo/${prestamoOrigen2Id}/confirmar`)
  //       .set('Authorization', `Bearer ${docenteOrigen2Token}`)
  //       .send({ confirmar: true });

  //     // Crear transferencia
  //     const transferRes = await request(app)
  //       .post('/api/transferencia/crear')
  //       .set('Authorization', `Bearer ${adminToken2}`)
  //       .send({
  //         prestamoOrigen: prestamoOrigen2Id,
  //         docenteOrigen: docenteOrigen2Id,
  //         docenteDestino: docenteDestino2Id,
  //         recursos: [recurso2Id]
  //       });
  //     codigoQR2 = transferRes.body.transferencia.codigoQR;

  //     // Confirmar origen
  //     await request(app)
  //       .patch(`/api/docente/transferencia/${codigoQR2}/confirmar`)
  //       .set('Authorization', `Bearer ${docenteOrigen2Token}`)
  //       .send({});
  //   });

  //   it('docente destino debe poder rechazar transferencia', async () => {
  //     const response = await request(app)
  //       .patch(`/api/docente/transferencia/${codigoQR2}/responder`)
  //       .set('Authorization', `Bearer ${docenteDestino2Token}`)
  //       .send({
  //         aceptar: false,
  //         observaciones: 'No necesito estos recursos ahora',
  //         firma: 'Diego Herrera'
  //       });

  //     expect(response.status).toBe(200);
  //     expect(response.body.transferencia.estado).toBe('rechazado');
  //   });

  //   it('recurso debe volver con docente origen después del rechazo', async () => {
  //     const response = await request(app)
  //       .get(`/api/recurso/${recurso2Id}`)
  //       .set('Authorization', `Bearer ${docenteOrigen2Token}`);

  //     expect(response.status).toBe(200);
  //     expect(response.body.asignadoA).toBe(docenteOrigen2Id);
  //   });
  // });
});