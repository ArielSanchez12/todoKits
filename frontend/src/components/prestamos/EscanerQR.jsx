import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode"; //encontre esta api que es para español, porque antes usabas Html5QrcodeScanner que es en ingles y no tiene tantas opciones de personalizacion
import { IoClose, IoCamera, IoImage } from "react-icons/io5";

const EscanerQR = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Función para traducir el label de la cámara
  const translateCameraLabel = (label) => {
    // Normalizar a minúsculas para comparar
    const lowerLabel = label.toLowerCase();

    // Detectar si es trasera
    const isBack = lowerLabel.includes("back") ||
      lowerLabel.includes("rear") ||
      lowerLabel.includes("trasera");

    // Detectar si es frontal
    const isFront = lowerLabel.includes("front") ||
      lowerLabel.includes("frontal");

    // Extraer número de cámara si existe
    const cameraNumber = label.match(/\d+/)?.[0];

    // Construir traducción correcta
    if (isBack) {
      return cameraNumber ? `Cámara ${cameraNumber} (trasera)` : "Cámara trasera";
    }

    if (isFront) {
      return cameraNumber ? `Cámara ${cameraNumber} (frontal)` : "Cámara frontal";
    }

    // Si tiene número pero no especifica tipo
    if (cameraNumber) {
      return `Cámara ${cameraNumber}`;
    }

    // Fallback: traducir "camera" a "Cámara"
    return label.replace(/camera/gi, "Cámara");
  };

  useEffect(() => {
    // Obtener cámaras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Seleccionar cámara trasera por defecto (si existe)
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("trasera") ||
            d.label.toLowerCase().includes("rear")
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        } else {
          setError("No se encontraron cámaras disponibles");
        }
      })
      .catch((err) => {
        console.error("Error al obtener cámaras:", err);
        setError("No se pudieron detectar las cámaras");
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError("Por favor selecciona una cámara");
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          stopScanning();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignorar errores continuos de no encontrar QR
          if (!errorMessage.includes("NotFoundException")) {
            console.error("Error al escanear:", errorMessage);
          }
        }
      );

      setScanning(true);
      setError("");
    } catch (err) {
      console.error("Error al iniciar escáner:", err);
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error al detener escáner:", err);
      }
    }
    setScanning(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      console.error("Error al escanear imagen:", err);
      setError("No se pudo leer el QR de la imagen. Intenta con otra foto.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
          <h2 className="text-xl font-bold text-white">
            Escanear QR de Transferencia
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Scanner Container */}
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden bg-gray-100"></div>

          {/* Selector de Cámara */}
          {cameras.length > 1 && !scanning && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Selecciona una cámara:
              </label>
              <select
                value={selectedCamera || ""}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {translateCameraLabel(camera.label) || `Cámara ${camera.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="grid grid-cols-2 gap-3">
            {!scanning ? (
              <>
                {/* Botón Iniciar Cámara */}
                <button
                  onClick={startScanning}
                  disabled={!selectedCamera}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  <IoCamera size={20} />
                  Iniciar Cámara
                </button>

                {/* Botón Subir Imagen */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <IoImage size={20} />
                  Subir Imagen
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            ) : (
              <button
                onClick={stopScanning}
                className="col-span-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Detener Escaneo
              </button>
            )}
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">
              ⛶ Instrucciones:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Coloca el código QR frente a la cámara</li>
              <li>Mantén el dispositivo estable</li>
              <li>O sube una imagen del código QR</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscanerQR;