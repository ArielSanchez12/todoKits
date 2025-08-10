import { MdDeleteForever, MdOutlinePayments } from "react-icons/md"
import storeTreatments from "../../context/storeTreatments"
import storeAuth from "../../context/storeAuth"
import ModalPayment from "./ModalPayment"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useState } from "react"
const stripePromise = loadStripe(import.meta.env.VITE_STRAPI_KEY)

const TableTreatments = ({ treatments, listDocente }) => {
    const { deleteTreatments } = storeTreatments()
    const { rol } = storeAuth()
    const { modal, toggleModal } = storeTreatments()
    const [selectedTreatment, setSelectedTreatment] = useState(null)

    const handleDelete = async (id) => {
        deleteTreatments(id);
        listDocente();
    }


    return (
        <>
            <table className="w-full mt-5 table-auto shadow-lg bg-white">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-2">N°</th>
                        <th className="p-2">Nombre Materia</th>
                        <th className="p-2">Motivo</th>
                        <th className="p-2">Tipo Recuperación</th>
                        <th className="p-2">N° Créditos</th>
                        <th className="p-2">Precio x Crédito</th>
                        <th className="p-2">Precio Total</th>
                        <th className="p-2">Estado pago</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {treatments.map((treatment, index) => (
                        <tr className="hover:bg-gray-300 text-center" key={treatment._id || index}>
                            <td>{index + 1}</td>
                            <td>{treatment.nombreMateria}</td>
                            <td>{treatment.motivo}</td>
                            <td>{treatment.tipoRecuperacion}</td>
                            <td>{treatment.numeroCreditos}</td>
                            <td>$ {treatment.precioPorCredito}</td>
                            <td>$ {treatment.precioTotal}</td>
                            <td className={treatment.estadoPago === "Pagado" ? "text-green-500 text-base" : "text-red-500 text-base"}>
                                {treatment.estadoPago}
                            </td>
                            <td className="py-2 text-center">
                                {rol === "Docente" && (
                                    <MdOutlinePayments
                                        className={
                                            treatment.estadoPago === "Pagado"
                                                ? "h-8 w-8 text-gray-600 pointer-events-none inline-block mr-2"
                                                : "h-8 w-8 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-500"
                                        }
                                        title="Pagar"
                                        onClick={() => {
                                            setSelectedTreatment(treatment)
                                            toggleModal("payment")
                                        }}
                                    />
                                )}

                                {rol === "Administrador" && (
                                    <MdDeleteForever
                                        className={
                                            treatment.estadoPago === "Pagado"
                                                ? "h-8 w-8 text-gray-600 pointer-events-none inline-block"
                                                : "h-8 w-8 text-red-800 cursor-pointer inline-block hover:text-red-500"
                                        }
                                        title="Eliminar"
                                        onClick={() => handleDelete(treatment._id)}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {modal === "payment" && selectedTreatment && (
                <Elements stripe={stripePromise}>
                    <ModalPayment treatment={selectedTreatment} />
                </Elements>
            )}
        </>
    );
};


export default TableTreatments