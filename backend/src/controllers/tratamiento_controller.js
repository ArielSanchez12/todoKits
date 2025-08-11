// Actualizar tratamiento
export const actualizarTratamiento = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID de materia no existe" });
  }
  try {
    const tratamiento = await Tratamiento.findByIdAndUpdate(id, req.body, { new: true });
    if (!tratamiento) return res.status(404).json({ msg: "Materia no encontrada" });
    res.status(200).json({ msg: "Materia actualizada exitosamente", tratamiento });
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar materia" });
  }
};
import mongoose from "mongoose";
import Tratamiento from "../models/tratamiento.js";
import docente from "../models/docente.js";
import { Stripe } from "stripe";


const registrarTratamiento = async (req, res) => {
  const { docente } = req.body;

  if (!mongoose.Types.ObjectId.isValid(docente)) {
    return res.status(400).json({ msg: "ID del estudiante inválido" })
  }

  await Tratamiento.create(req.body)
  res.status(201).json({ msg: "Materia registrado exitosamente" })

}

const listarTratamiento = async (req, res) => {
  const tratamientos = await Tratamiento.find()
  res.status(200).json(tratamientos)
}

const eliminarTratamiento = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: `ID de materia no existe` });
  }

  await Tratamiento.findByIdAndDelete(id)
  res.status(200).json({ msg: "Materia eliminado exitosamente" })
}



const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

const pagarTratamiento = async (req, res) => {

  console.log(req.body)

  const { paymentMethodId, treatmentId, cantidad, motivo } = req.body

  try {
    const tratamiento = await Tratamiento.findById(treatmentId)
    if (!tratamiento) return res.status(404).json({ msg: "Materia no encontrado" })
    if (tratamiento.estadoPago === 'Pagado') return res.status(400).json({ msg: "La materia ya ha sido pagado" })
    if (!paymentMethodId) return res.status(400).json({ msg: "paymentMethodId no proporcionado" })

    let [docente] = (await stripe.customers.list({ email: tratamiento.emailDocente, limit: 1 })).data || [];

    if (!docente) {
      docente = await stripe.customers.create({ name: tratamiento.nombreDocente, email: tratamiento.emailDocente });
    }

    const payment = await stripe.paymentIntents.create({
      amount: cantidad,
      currency: "USD",
      description: motivo,
      payment_method: paymentMethodId,
      confirm: true,
      customer: docente.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never"
      }
    })
    console.log(payment)

    if (payment.status === "succeeded") {
      await Tratamiento.findByIdAndUpdate(treatmentId, { estadoPago: "Pagado" });
      return res.status(200).json({ msg: "El pago se realizó exitosamente" })
    }

  } catch (error) {
    res.status(500).json({ msg: "Error al intentar pagar la matyeria", error });
  }
}

export {
  registrarTratamiento,
  listarTratamiento,
  eliminarTratamiento,
  pagarTratamiento
}