import request from 'supertest';
import app from '../../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
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
  await Docente.deleteMany({});
  await Administrador.deleteMany({});
});

describe('Integration - Registro y Gestión de Docentes', () => {
  let adminToken;
  let adminId;

  beforeEach(async () => {
    // Crear administrador para cada test
    const adminResponse = await request(app)
      .post('/api/register')
      .send({
        nombre: 'Gregory', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
        apellido: 'Sanchez',
        email: 'admin@gmail.com',
        password: 'Admin123!',
        confirmPassword: 'Admin123!'
      });

    adminToken = adminResponse.body.token;
    adminId = adminResponse.body.administrador._id;
  });

  // CREACIÓN DE DOCENTES
  describe('Creación de Docentes', () => {
    it('debe crear un docente correctamente', async () => {
      const docenteData = {
        nombreDocente: 'María', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
        apellidoDocente: 'López',
        celularDocente: '0998765432',
        emailDocente: 'maria@gmail.com',
        passwordDocente: 'Docente123!',
        confirmPasswordDocente: 'Docente123!'
      };

      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('docente');
      expect(response.body.docente.emailDocente).toBe(docenteData.emailDocente);
      expect(response.body.docente.nombreDocente).toBe(docenteData.nombreDocente);
      expect(response.body.docente.admin).toBe(adminId);

      // Verificar en base de datos
      const docenteEnDB = await Docente.findOne({ emailDocente: docenteData.emailDocente });
      expect(docenteEnDB).toBeDefined();
      expect(docenteEnDB.nombreDocente).toBe(docenteData.nombreDocente);
    });

    it('no debe crear docente con email duplicado', async () => {
      const docenteData = {
        nombreDocente: 'María', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
        apellidoDocente: 'López',
        celularDocente: '0998765432',
        emailDocente: 'maria@gmail.com',
        passwordDocente: 'Docente123!',
        confirmPasswordDocente: 'Docente123!'
      };

      // Primer registro
      await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteData);

      // Segundo registro (debe fallar)
      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteData);

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('email');
    }); 

    it('debe validar formato de email Gmail', async () => {
      const docenteData = {
        nombreDocente: 'María',
        apellidoDocente: 'López', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
        celularDocente: '0998765432',
        emailDocente: 'maria@gmail.com',
        passwordDocente: 'Docente123!',
        confirmPasswordDocente: 'Docente123!'
      };

      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteData);

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('Gmail');
    });

    it('debe validar contraseñas coincidan', async () => {
      const docenteData = {
        nombreDocente: 'María',
        apellidoDocente: 'López',
        celularDocente: '0998765432', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
        emailDocente: 'maria@gmail.com',
        passwordDocente: 'Docente123!',
        confirmPasswordDocente: 'Docente456!' // No coincide
      };

      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(docenteData);

      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('coincid');
    });
  });

  // LISTADO DE DOCENTES
  describe('Listado de Docentes', () => {
    beforeEach(async () => {
      // Crear varios docentes
      const docentes = [
        {
          nombreDocente: 'María',
          apellidoDocente: 'López',
          celularDocente: '0998765432',  //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
          emailDocente: 'maria@gmail.com',
          passwordDocente: 'Docente123!',
          confirmPasswordDocente: 'Docente123!'
        },
        {
          nombreDocente: 'Carlos',
          apellidoDocente: 'Ramírez', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
          celularDocente: '0987654321',
          emailDocente: 'carlos@gmail.com',
          passwordDocente: 'Docente123!',
          confirmPasswordDocente: 'Docente123!'
        }
      ];

      for (const docente of docentes) {
        await request(app)
          .post('/api/administrador/registerDocente')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(docente);
      }
    });

    it('debe listar todos los docentes del administrador', async () => {
      const response = await request(app)
        .get('/api/administrador/listDocentes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('debe buscar docente por email', async () => {
      const response = await request(app)
        .get('/api/administrador/listDocentes')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ emailDocente: 'maria@gmail.com' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].emailDocente).toBe('maria@gmail.com');
    });
  });


  // ACTUALIZACIÓN DE DOCENTES
  describe('Actualización de Docentes', () => {
    let docenteId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombreDocente: 'María',
          apellidoDocente: 'López',
          celularDocente: '0998765432',
          emailDocente: 'maria@gmail.com', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
          passwordDocente: 'Docente123!',
          confirmPasswordDocente: 'Docente123!'
        });

      docenteId = response.body.docente._id;
    });

    it('debe actualizar datos del docente', async () => {
      const response = await request(app)
        .put(`/api/administrador/actualizarDocente/${docenteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombreDocente: 'María Fernanda',
          apellidoDocente: 'López García', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
          celularDocente: '0999999999'
        });

      expect(response.status).toBe(200);
      expect(response.body.docente.nombreDocente).toBe('María Fernanda'); //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
      expect(response.body.docente.apellidoDocente).toBe('López García');
      expect(response.body.docente.celularDocente).toBe('0999999999');

      // Verificar en DB
      const docenteActualizado = await Docente.findById(docenteId);
      expect(docenteActualizado.nombreDocente).toBe('María Fernanda');
    });

    it('debe cambiar contraseña del docente', async () => {
      const response = await request(app)
        .put(`/api/administrador/actualizarPasswordDocente/${docenteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPasswordDocente: 'NuevaPass123!',
          confirmPasswordDocente: 'NuevaPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.msg).toContain('actualizada');

      // Verificar login con nueva contraseña
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'maria@gmail.com',
          password: 'NuevaPass123!'
        });

      expect(loginResponse.status).toBe(200);
    });
  });

  // ELIMINACIÓN DE DOCENTES
  describe('Eliminación de Docentes', () => {
    let docenteId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/administrador/registerDocente')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombreDocente: 'María',
          apellidoDocente: 'López', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
          celularDocente: '0998765432',
          emailDocente: 'maria@gmail.com',
          passwordDocente: 'Docente123!',
          confirmPasswordDocente: 'Docente123!'
        });

      docenteId = response.body.docente._id;
    });

    it('debe eliminar docente correctamente', async () => {
      const response = await request(app)
        .delete(`/api/administrador/eliminarDocente/${docenteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.msg).toContain('eliminado');

      // Verificar que ya no existe en DB
      const docenteEliminado = await Docente.findById(docenteId);
      expect(docenteEliminado).toBeNull();
    });

    it('no debe eliminar docente inexistente', async () => {
      const idInvalido = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/administrador/eliminarDocente/${idInvalido}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  // // BÚSQUEDA Y FILTRADO
  // describe('Búsqueda y Filtrado de Docentes', () => {
  //   beforeEach(async () => {
  //     const docentes = [
  //       {
  //         nombreDocente: 'María', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
  //         apellidoDocente: 'López',
  //         celularDocente: '0998765432',
  //         emailDocente: 'maria.lopez@gmail.com',
  //         passwordDocente: 'Docente123!',
  //         confirmPasswordDocente: 'Docente123!'
  //       },
  //       {
  //         nombreDocente: 'Carlos',
  //         apellidoDocente: 'Ramírez',
  //         celularDocente: '0987654321', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
  //         emailDocente: 'carlos.ramirez@gmail.com',
  //         passwordDocente: 'Docente123!',
  //         confirmPasswordDocente: 'Docente123!'
  //       },
  //       {
  //         nombreDocente: 'Ana',
  //         apellidoDocente: 'García',
  //         celularDocente: '0976543210', //PONER BIEN LOS DATOS SEGUN LAS VALIDACIONES ZOD
  //         emailDocente: 'ana.garcia@gmail.com',
  //         passwordDocente: 'Docente123!',
  //         confirmPasswordDocente: 'Docente123!'
  //       }
  //     ];

  //     for (const docente of docentes) {
  //       await request(app)
  //         .post('/api/administrador/registerDocente')
  //         .set('Authorization', `Bearer ${adminToken}`)
  //         .send(docente);
  //     }
  //   });

  //   it('debe encontrar docentes por email usando Mongoose', async () => {
  //     const docenteEncontrado = await Docente.findOne({ 
  //       emailDocente: 'maria.lopez@gmail.com' 
  //     });

  //     expect(docenteEncontrado).toBeDefined();
  //     expect(docenteEncontrado.emailDocente).toBe('maria.lopez@gmail.com');
  //     expect(docenteEncontrado.nombreDocente).toBe('María');
  //   });

  //   it('debe encontrar múltiples docentes por administrador', async () => {
  //     const docentes = await Docente.find({ admin: adminId });

  //     expect(docentes.length).toBe(3);
  //     expect(docentes.every(d => d.admin.toString() === adminId)).toBe(true);
  //   });

  //   it('debe buscar docentes por nombre parcial', async () => {
  //     const docentes = await Docente.find({
  //       nombreDocente: { $regex: 'Mar', $options: 'i' }
  //     });

  //     expect(docentes.length).toBeGreaterThan(0);
  //     expect(docentes[0].nombreDocente).toContain('Mar');
  //   });
  // });
});