import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Docente from '../../src/models/docente.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Docente Integration Tests', () => {
  
  afterEach(async () => {
    await Docente.deleteMany({}); // Limpiar la base de datos después de cada prueba
  });

  it('debe crear un docente correctamente', async () => {
    const docenteData = {
      nombreDocente: "Integration Test",
      apellidoDocente: "Apellido Test",
      emailDocente: "buscar@test.com",
      passwordDocente: "123456",
      rolDocente: "Docente"
    };

    const docente = new Docente(docenteData);
    const docenteGuardado = await docente.save();

    expect(docenteGuardado._id).toBeDefined();
    expect(docenteGuardado.nombreDocente).toBe(docenteData.nombreDocente);
    expect(docenteGuardado.emailDocente).toBe(docenteData.emailDocente);
  });

  it('debe encontrar docentes por email', async () => {
    const docenteData = {
      nombreDocente: "Integration Test",
      apellidoDocente: "Apellido Test",
      emailDocente: "buscar@test.com",
      passwordDocente: "123456",
      rolDocente: "Docente"
    };

    await new Docente(docenteData).save();
    const docenteEncontrado = await Docente.findOne({ emailDocente: docenteData.emailDocente });

    expect(docenteEncontrado).toBeDefined();
    expect(docenteEncontrado.emailDocente).toBe(docenteData.emailDocente);
  });
});