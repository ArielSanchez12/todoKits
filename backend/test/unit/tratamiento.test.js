import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import Tratamiento from '../../src/models/tratamiento.js';

describe('Tratamiento Model Test', () => {
  
  // Prueba de validación de modelo
  it('debe validar un tratamiento válido', () => {
    const tratamientoValido = new Tratamiento({
      nombre: "TratamientoTest",
      descripcion: "Descripcióndeprueba",
      prioridad: "Alta",
      docente: new mongoose.Types.ObjectId(),
      estadoPago: "Pendiente",
      precio: 1000
    });

    expect(tratamientoValido.validateSync()).toBeUndefined();
  });

  // Prueba de campo requerido
  it('debe requerir precio', () => {
    const tratamientoInvalido = new Tratamiento({});
    const error = tratamientoInvalido.validateSync();
    expect(error.errors.precio).toBeDefined();
  });
});