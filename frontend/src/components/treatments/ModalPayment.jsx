import { useState } from "react";
import storeTreatments from "../../context/storeTreatments";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

function ModalPayment({ treatment }) {
    const { toggleModal, payTreatments } = storeTreatments();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handlePayment = async (e) => {
        e.preventDefault();

        setLoading(true);

        const cardElement = elements.getElement(CardElement);
        const { paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
        });

        const data = {
            paymentMethodId: paymentMethod.id,
            treatmentId: treatment._id,
            cantidad: Math.round(+treatment.precioTotal * 100), // Usar precioTotal
            motivo: treatment.motivo,
        };

        payTreatments(data);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                <div className="w-full max-w-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 bg-opacity-95 rounded-2xl shadow-xl p-8 overflow-y-auto animate-fadeScale">

                    <p className="text-white font-bold text-xl mb-6 text-center">Pagar Materia</p>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-base font-semibold text-gray-200">Detalle</label>
                            <ul className="text-gray-200 bg-gray-700 p-3 rounded-md space-y-1">
                                <li><strong>Nombre:</strong> {treatment.nombreMateria}</li>
                                <li><strong>Motivo:</strong> {treatment.motivo}</li>
                                <li><strong>Tipo Recuperación:</strong> {treatment.tipoRecuperacion}</li>
                                <li><strong>N° Créditos:</strong> {treatment.numeroCreditos}</li>
                                <li><strong>Precio por crédito:</strong> $ {treatment.precioPorCredito}</li>
                            </ul>
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-gray-200">Precio total</label>
                            <p className="text-green-400 bg-gray-700 p-2 rounded-md font-bold">$ {treatment.precioTotal}</p>
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-gray-200">Tarjeta de crédito</label>
                            <div className="p-3 border border-gray-600 rounded-lg bg-gray-200">
                                <CardElement options={{ style: { base: { fontSize: '16px', color: 'black' } } }} />
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className="bg-green-500 px-6 py-2 text-white rounded-lg hover:bg-green-900 transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? "Procesando..." : "Pagar"}
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleModal()}
                                className="bg-red-600 px-6 py-2 text-white rounded-lg hover:bg-red-800 transition-all duration-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Animación con estilo embebido */}
            <style>
                {`
                @keyframes fadeScale {
                    0% {
                        opacity: 0;
                        transform: scale(0.85);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeScale {
                    animation: fadeScale 0.35s ease-out forwards;
                }
                `}
            </style>
        </>
    );
}

export default ModalPayment;
