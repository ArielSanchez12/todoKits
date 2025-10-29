import { useState, useRef } from "react";
import { MdVisibility, MdCancel, MdAssignmentTurnedIn, MdRefresh } from "react-icons/md";
import DetallePrestamo from "./DetallePrestamo";
import storePrestamos from "../../context/storePrestamos";

const TablaHistorialDocente = ({ prestamos, onRefresh }) => {
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [modalCancelar, setModalCancelar] = useState(null);
  const [modalFinalizar, setModalFinalizar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [observacionesDevolucion, setObservacionesDevolucion] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredMotivo, setHoveredMotivo] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, direction: 'right' });
  const tooltipRef = useRef(null);
  const cellRef = useRef(null);

  const { cancelarPrestamoAdmin, finalizarPrestamoAdmin } = storePrestamos();

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      activo: "bg-green-100 text-green-800",
      finalizado: "bg-blue-100 text-blue-800",
      rechazado: "bg-red-100 text-red-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVerDetalle = (prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setMostrarDetalle(true);
  };

  const handleCancelar = async () => {
    if (!motivoCancelacion.trim()) {
      alert("Debe especificar el motivo de cancelación");
      return;
    }

    setLoading(true);
    try {
      await cancelarPrestamoAdmin(modalCancelar._id, motivoCancelacion);
      setModalCancelar(null);
      setMotivoCancelacion("");
      onRefresh();
    } catch (error) {
      console.error("Error al cancelar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      await finalizarPrestamoAdmin(modalFinalizar._id, observacionesDevolucion);
      setModalFinalizar(null);
      setObservacionesDevolucion("");
      onRefresh();
    } catch (error) {
      console.error("Error al finalizar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar préstamos
  const prestamosFiltrados = filtro === "todos"
    ? prestamos
    : prestamos?.filter((p) => p.estado === filtro);

  // Contar por estado
  const contadores = {
    activo: prestamos?.filter((p) => p.estado === "activo").length || 0,
    pendiente: prestamos?.filter((p) => p.estado === "pendiente").length || 0,
    finalizado: prestamos?.filter((p) => p.estado === "finalizado").length || 0,
    rechazado: prestamos?.filter((p) => p.estado === "rechazado").length || 0,
    todos: prestamos?.length || 0,
  };

  // Tooltip responsive para motivo
  const handleMouseEnter = (prestamoId) => {
    setHoveredMotivo(prestamoId);

    setTimeout(() => {
      if (tooltipRef.current && cellRef.current) {
        const cellRect = cellRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let direction = 'right';
        let top = cellRect.top;
        let left = cellRect.right + 10;

        if (left + tooltipRect.width > windowWidth - 20) {
          direction = 'left';
          left = cellRect.left - tooltipRect.width - 10;
        }

        if (top + tooltipRect.height > windowHeight - 20) {
          top = windowHeight - tooltipRect.height - 20;
        }

        if (left < 20) {
          direction = 'bottom';
          left = cellRect.left;
          top = cellRect.bottom + 10;

          if (top + tooltipRect.height > windowHeight - 20) {
            direction = 'top';
            top = cellRect.top - tooltipRect.height - 10;
          }
        }

        setTooltipPosition({ top, left, direction });
      }
    }, 10);
  };

  return (
    <>
      {/* ✅ FILTROS ARRIBA DEL HEADER */}
      <div className="flex flex-wrap gap-2 mb-4">
        {{
          key: "todos",
          label: "Todos"
        },
        {
          key: "activo",
          label: "Activos"
        },
        {
          key: "pendiente",
          label: "Pendientes"
        },
        {
          key: "finalizado",
          label: "Finalizados"
        },
        {
          key: "rechazado",
          label: "Rechazados"
        },
      ].map((tipo) => (
        <button
          key={tipo.key}
          onClick={() => setFiltro(tipo.key)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${filtro === tipo.key
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
        >
          {tipo.label}
          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filtro === tipo.key
                ? "bg-white text-blue-600"
                : "bg-gray-200 text-gray-700"
              }`}
          >
            {contadores[tipo.key]}
          </span>
        </button>
        ))}
      </div>

      {/* ✅ HEADER PEGADO A LA TABLA (sin mb-4) */}
      <div className="flex justify-between items-center bg-black text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">📚 Historial del Docente</h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <MdRefresh size={20} />
          Actualizar
        </button>
      </div>

      {/* ✅ TABLA PEGADA AL HEADER */}
      <div className="overflow-x-auto shadow-lg">
        <table className="w-full table-auto bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">N°</th>
              <th className="p-2">Recurso</th>
              <th className="p-2">Motivo</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Fecha Préstamo</th>
              <th className="p-2">Hora Confirmación</th>
              <th className="p-2">Hora Devolución</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamosFiltrados && prestamosFiltrados.length > 0 ? (
              prestamosFiltrados.map((prestamo, index) => (
                <tr key={prestamo._id} className="hover:bg-gray-300 text-center">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-semibold">
                    {prestamo.recurso?.nombre || "N/A"}
                    <br />
                    <span className="text-xs text-gray-600">
                      {prestamo.recurso?.tipo?.toUpperCase() || ""}
                    </span>
                  </td>
                  <td
                    className="p-2 relative"
                    ref={prestamo._id === hoveredMotivo ? cellRef : null}
                    onMouseEnter={() => {
                      if (prestamo.motivo?.descripcion && prestamo.motivo.descripcion.length > 30) {
                        handleMouseEnter(prestamo._id);
                      }
                    }}
                    onMouseLeave={() => setHoveredMotivo(null)}
                  >
                    <span className="font-medium">{prestamo.motivo?.tipo}</span>
                    {prestamo.motivo?.descripcion && (
                      <span className="block text-xs text-gray-600 mt-1 cursor-pointer">
                        {prestamo.motivo.descripcion.substring(0, 30)}
                        {prestamo.motivo.descripcion.length > 30 && "..."}