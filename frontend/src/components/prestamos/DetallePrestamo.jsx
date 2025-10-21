import { IoClose } from "react-icons/io5";

const DetallePrestamo = ({ prestamo, onClose }) => {
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      activo: "bg-green-100 text-green-800",
      finalizado: "bg-blue-100 text-blue-800",
      rechazado: "bg-red-100 text-red-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Detalle del Préstamo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600">Estado:</span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getBadgeEstado(
                prestamo.estado
              )}`}
            >
              {prestamo.estado.charAt(0).toUpperCase() +
                prestamo.estado.slice(1)}
            </span>
          </div>

          {/* Información del Recurso */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              📦 Información del Recurso
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-600">Nombre:</span>
                <p className="font-semibold">{prestamo.recurso?.nombre || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Tipo:</span>
                <p className="font-semibold">
                  {prestamo.recurso?.tipo?.toUpperCase() || "N/A"}
                </p>
              </div>
              {prestamo.recurso?.laboratorio && (
                <>
                  <div>
                    <span className="text-xs text-gray-600">Laboratorio:</span>
                    <p className="font-semibold">{prestamo.recurso.laboratorio}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Aula:</span>
                    <p className="font-semibold">{prestamo.recurso.aula}</p>
                  </div>
                </>
              )}
              {prestamo.recurso?.contenido &&
                prestamo.recurso.contenido.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-xs text-gray-600">Contenido:</span>
                    <ul className="list-disc pl-5 mt-1">
                      {prestamo.recurso.contenido.map((item, i) => (
                        <li key={i} className="text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          {/* Información del Docente */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              👤 Docente Responsable
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-600">Nombre:</span>
                <p className="font-semibold">
                  {prestamo.docente?.nombreDocente}{" "}
                  {prestamo.docente?.apellidoDocente}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Email:</span>
                <p className="font-semibold">{prestamo.docente?.emailDocente}</p>
              </div>
              {prestamo.docente?.celularDocente && (
                <div>
                  <span className="text-xs text-gray-600">Celular:</span>
                  <p className="font-semibold">{prestamo.docente.celularDocente}</p>
                </div>
              )}
              {prestamo.firmaDocente && (
                <div>
                  <span className="text-xs text-gray-600">Firma Digital:</span>
                  <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                    {prestamo.firmaDocente.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Motivo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📝 Motivo del Préstamo
            </p>
            <p className="font-semibold text-lg">{prestamo.motivo?.tipo}</p>
            {prestamo.motivo?.descripcion && (
              <p className="text-sm text-gray-600 mt-2">
                {prestamo.motivo.descripcion}
              </p>
            )}
          </div>

          {/* Fechas y Horas */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ⏰ Registro de Tiempos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-600">Fecha de Préstamo:</span>
                <p className="font-semibold text-sm">
                  {formatFecha(prestamo.fechaPrestamo)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Hora de Confirmación:</span>
                <p className="font-semibold text-sm">
                  {prestamo.horaConfirmacion ? (
                    formatFecha(prestamo.horaConfirmacion)
                  ) : (
                    <span className="text-gray-400">Pendiente</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Hora de Devolución:</span>
                <p className="font-semibold text-sm">
                  {prestamo.horaDevolucion ? (
                    formatFecha(prestamo.horaDevolucion)
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Recursos Adicionales con detalles completos */}
          {prestamo.recursosAdicionales &&
            prestamo.recursosAdicionales.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  📦 Recursos Adicionales Detectados
                </p>
                <div className="space-y-4">
                  {prestamo.recursosAdicionales.map((rec, index) => (
                    <div
                      key={rec._id}
                      className="bg-white p-4 rounded-lg border border-yellow-200"
                    >
                      {/* Título del recurso adicional */}
                      <p className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                        Recurso Adicional #{index + 1}
                      </p>

                      {/* Grid de información */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-gray-600">Nombre:</span>
                          <p className="font-semibold">{rec.nombre || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Tipo:</span>
                          <p className="font-semibold">
                            {rec.tipo?.toUpperCase() || "N/A"}
                          </p>
                        </div>

                        {/* Laboratorio y Aula (si existen) */}
                        {rec.laboratorio && (
                          <>
                            <div>
                              <span className="text-xs text-gray-600">
                                Laboratorio:
                              </span>
                              <p className="font-semibold">{rec.laboratorio}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">Aula:</span>
                              <p className="font-semibold">{rec.aula || "N/A"}</p>
                            </div>
                          </>
                        )}

                        {/* Contenido (si existe) */}
                        {rec.contenido && rec.contenido.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-xs text-gray-600">
                              Contenido:
                            </span>
                            <ul className="list-disc pl-5 mt-1">
                              {rec.contenido.map((item, i) => (
                                <li key={i} className="text-sm">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Observaciones */}
          {prestamo.observaciones && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                💬 Observaciones
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {prestamo.observaciones}
              </p>
            </div>
          )}

          {/* Botón Cerrar */}
          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePrestamo;