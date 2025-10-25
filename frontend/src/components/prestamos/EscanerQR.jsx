import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { IoClose } from "react-icons/io5";

const EscanerQR = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        // Ignorar errores de escaneo continuos
        if (!error.includes("NotFoundException")) {
          setError("Error al escanear QR");
        }
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error("Error al limpiar scanner:", err));
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Escanear QR de Transferencia
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Scanner */}
          <div id="qr-reader" className="w-full"></div>

          {/* Instrucciones */}
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              📷 Coloca el QR frente a la cámara
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscanerQR;