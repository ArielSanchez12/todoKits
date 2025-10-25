import { useEffect, useState } from "react";
import { MdNotifications, MdQrCodeScanner } from "react-icons/md";
import { toast } from "react-toastify";
import Pusher from "pusher-js";
import ModalResponderTransferencia from "./ModalResponderTransferencia";

const NotificacionesTransferencia = ({ docenteId }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [transferenciaSeleccionada, setTransferenciaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    // Configurar Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("chat");

    // Escuchar evento de transferencia confirmada por origen
    channel.bind("transferencia-confirmada-origen", (data) => {
      if (data.para === docenteId) {
        setNotificaciones((prev) => [data.transferencia, ...prev]);
        toast.info("Tienes una nueva solicitud de transferencia", {
          autoClose: 5000,
        });
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [docenteId]);

  const handleVerTransferencia = (transferencia) => {
    setTransferenciaSeleccionada(transferencia);
    setMostrarModal(true);
  };

  const handleSuccessRespuesta = () => {
    setNotificaciones((prev) =>
      prev.filter((n) => n._id !== transferenciaSeleccionada._id)
    );
  };

  if (notificaciones.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start gap-3">
          <MdNotifications className="text-blue-600 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-2">
              Solicitudes de Transferencia Pendientes
            </h3>
            <div className="space-y-2">
              {notificaciones.map((transferencia) => (
                <div
                  key={transferencia._id}
                  className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Transferencia desde{" "}
                      {transferencia.docenteOrigen.nombreDocente}{" "}
                      {transferencia.docenteOrigen.apellidoDocente}
                    </p>
                    <p className="text-xs text-gray-600">
                      {transferencia.recursos.length +
                        transferencia.recursosAdicionales.length}{" "}
                      recurso(s)
                    </p>
                  </div>
                  <button
                    onClick={() => handleVerTransferencia(transferencia)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Solicitud
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de respuesta */}
      {mostrarModal && transferenciaSeleccionada && (
        <ModalResponderTransferencia
          transferencia={transferenciaSeleccionada}
          onClose={() => {
            setMostrarModal(false);
            setTransferenciaSeleccionada(null);
          }}
          onSuccess={handleSuccessRespuesta}
        />
      )}
    </>
  );
};

export default NotificacionesTransferencia;