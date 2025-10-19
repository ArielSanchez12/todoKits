const ModalRecurso = ({
  contenido,
  onAdd,
  onChange,
  onRemove,
  onClose,
  tipoRecurso,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fadeScale">
        <p className="text-gray-800 font-bold text-lg text-center mb-6">
          Contenido del {tipoRecurso === "kit" ? "Kit" : "Proyector"}
        </p>

        <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
          {contenido?.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={`Elemento ${index + 1}`}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {contenido.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + Agregar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Listo
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default ModalRecurso;