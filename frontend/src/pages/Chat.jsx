import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import storeAuth from "../context/storeAuth";
import ModalViewImage from "../components/profile/ModalViewImage" // ✅ NUEVO
import { MdQrCode, MdSearch } from "react-icons/md";
import { IoSend } from "react-icons/io5";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Chat = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);
    const [responses, setResponses] = useState([]);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false); // ✅ NUEVO
    const [selectedImageUrl, setSelectedImageUrl] = useState(""); // ✅ NUEVO
    const token = storeAuth((state) => state.token);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [userType, setUserType] = useState("");
    const pusherRef = useRef(null);
    const channelRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Detectar tipo de usuario
    useEffect(() => {
        if (user.rolDocente) {
            setUserType("docente");
        } else if (user.rol === "Administrador") {
            setUserType("admin");
        }
    }, [user]);

    // Obtener contactos
    useEffect(() => {
        if (!token || !userType) return;
        const endpoint = userType === "docente" ? "/chat/admin" : "/chat/docentes";

        fetch(`${BACKEND_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const contactList = userType === "docente" ? (data ? [data] : []) : data;
                setContacts(contactList);
                setFilteredContacts(contactList);
            });
    }, [token, userType]);

    // Filtrar contactos por nombre
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredContacts(contacts);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = contacts.filter(contact => {
                const fullName = `${contact.nombreDocente || contact.nombre} ${contact.apellidoDocente || contact.apellido}`.toLowerCase();
                return fullName.includes(term);
            });
            setFilteredContacts(filtered);
        }
    }, [searchTerm, contacts]);

    // Cargar historial al seleccionar contacto
    useEffect(() => {
        if (!selectedContact) return;
        fetch(`${BACKEND_URL}/chat/chat-history/${selectedContact._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setResponses(data));
    }, [selectedContact, token]);

    // Suscribirse a Pusher
    useEffect(() => {
        if (!selectedContact) return;
        if (!pusherRef.current) {
            pusherRef.current = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
            channelRef.current = pusherRef.current.subscribe("chat");
        }
        const channel = channelRef.current;

        const handleNewMessage = (data) => {
            if (
                (data.de === user._id && data.para === selectedContact?._id) ||
                (data.de === selectedContact?._id && data.para === user._id)
            ) {
                setResponses((prev) => [...prev, data]);
            }
        };

        channel.bind("nuevo-mensaje", handleNewMessage);

        return () => {
            channel.unbind("nuevo-mensaje", handleNewMessage);
        };
    }, [selectedContact, user]);

    // Enviar mensaje
    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedContact) return;
        const newMessage = {
            texto: message,
            de: user._id,
            deNombre: user.nombreDocente || user.nombreAdmin,
            para: selectedContact._id,
            paraNombre: selectedContact.nombreDocente || selectedContact.nombreAdmin,
            deTipo: userType,
            paraTipo: userType === "docente" ? "admin" : "docente"
        };
        await fetch(`${BACKEND_URL}/chat/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newMessage)
        });
        setMessage("");
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [responses, isTyping]);

    const getLastMessageInfo = (contactId) => {
        const msgs = responses.filter(
            msg =>
                (msg.de === contactId && msg.para === user._id) ||
                (msg.de === user._id && msg.para === contactId)
        );
        if (msgs.length === 0) return { texto: "", esMio: false, estado: null, createdAt: null };
        const last = msgs[msgs.length - 1];
        return {
            texto: last.texto,
            esMio: last.de === user._id,
            estado: last.estado,
            createdAt: last.createdAt
        };
    };

    function formatLastMessageDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday) {
            return "Ayer";
        } else if (now - date < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString('es-ES', { weekday: 'short' });
        } else {
            return date.toLocaleDateString();
        }
    }

    // ✅ Función para abrir modal de imagen
    const handleOpenImage = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setShowViewModal(true);
    };

    // Renderizar mensaje de transferencia
    const renderMensajeTransferencia = (msg) => {
        const { transferencia } = msg;
        return (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                    <MdQrCode className="text-purple-600" size={24} />
                    <span className="font-bold text-purple-700">📦 Transferencia de Recursos</span>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-3">
                    <p>
                        <span className="font-semibold">De:</span> {transferencia.docenteOrigen}
                    </p>
                    <p>
                        <span className="font-semibold">Recursos:</span>{" "}
                        {transferencia.recursos.join(", ")}
                    </p>
                </div>

                <a
                    href={transferencia.qrImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                >
                    <MdQrCode size={20} />
                    Ver código QR
                </a>

                <p className="text-xs text-gray-500 mt-3">
                    Código: {transferencia.codigo}
                </p>
                {/* ✅ HORA DEL MENSAJE */}
                <p className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
            {/* SIDEBAR - Contactos */}
            <div className="w-full md:w-80 bg-white border-r border-gray-300 flex flex-col h-full overflow-hidden">
                {/* Header del Sidebar */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        {userType === "docente" ? "💬 Chat" : "👥 Docentes"}
                    </h1>
                    {/* Barra de búsqueda funcional */}
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Lista de contactos - SCROLL SOLO AQUI */}
                <div className="flex-1 overflow-y-auto">
                    {filteredContacts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p>{searchTerm ? "No se encontraron contactos" : "No hay contactos disponibles"}</p>
                        </div>
                    ) : (
                        filteredContacts.map(contact => {
                            const lastMsg = getLastMessageInfo(contact._id);
                            return (
                                <div
                                    key={contact._id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`p-3 md:p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                                        selectedContact?._id === contact._id
                                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* ✅ Avatar clickeable */}
                                        <img
                                            src={
                                                userType === "docente"
                                                    ? (contact.avatar || contact.avatarDocente || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                                                    : (contact.avatarDocente || contact.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                                            }
                                            alt="avatar"
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const imageUrl = userType === "docente"
                                                    ? (contact.avatar || contact.avatarDocente || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                                                    : (contact.avatarDocente || contact.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png");
                                                handleOpenImage(imageUrl);
                                            }}
                                            title="Click para ver imagen"
                                        />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-800 truncate">
                                                    {contact.nombreDocente
                                                        ? `${contact.nombreDocente} ${contact.apellidoDocente}`
                                                        : `${contact.nombre} ${contact.apellido}`}
                                                </h3>
                                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                    {formatLastMessageDate(lastMsg.createdAt)}
                                                </span>
                                            </div>
                                            {lastMsg.texto && (
                                                <p className={`text-sm truncate ${lastMsg.esMio ? "font-semibold" : "text-gray-600"}`}>
                                                    {lastMsg.esMio && "Tú: "}
                                                    {lastMsg.texto}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* AREA DE CHAT PRINCIPAL */}
            {selectedContact ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* HEADER DEL CHAT */}
                    <div className="bg-white border-b border-gray-300 px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 flex-shrink-0">
                        {/* ✅ Avatar clickeable del header */}
                        <img
                            src={
                                userType === "docente"
                                    ? (selectedContact.avatar || selectedContact.avatarDocente || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                                    : (selectedContact.avatarDocente || selectedContact.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                            }
                            alt="avatar"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                                const imageUrl = userType === "docente"
                                    ? (selectedContact.avatar || selectedContact.avatarDocente || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                                    : (selectedContact.avatarDocente || selectedContact.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png");
                                handleOpenImage(imageUrl);
                            }}
                            title="Click para ver imagen"
                        />

                        {/* Nombre e info */}
                        <div>
                            <h2 className="font-bold text-gray-800 text-sm md:text-base">
                                {selectedContact.nombreDocente
                                    ? `${selectedContact.nombreDocente} ${selectedContact.apellidoDocente}`
                                    : `${selectedContact.nombre} ${selectedContact.apellido}`}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {selectedContact.emailDocente || selectedContact.email || "Sin email"}
                            </p>
                        </div>
                    </div>

                    {/* AREA DE MENSAJES - SCROLL SOLO AQUI */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 min-h-0">
                        {responses.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <img
                                        src={
                                            userType === "docente"
                                                ? (selectedContact.avatar || selectedContact.avatarDocente || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                                                : (selectedContact.avatarDocente || selectedContact.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png")
                                        }
                                        alt="avatar"
                                        className="w-20 h-20 rounded-full mx-auto mb-4 opacity-30"
                                    />
                                    <p className="text-gray-500 text-sm">Inicia la conversación</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {responses.map((msg, idx) => (
                                    <div key={idx} className={`mb-4 flex ${msg.de === user._id ? "justify-end" : "justify-start"}`}>
                                        {msg.tipo === "transferencia" ? (
                                            <div className="max-w-xs md:max-w-sm">
                                                {renderMensajeTransferencia(msg)}
                                            </div>
                                        ) : (
                                            <div className="max-w-xs md:max-w-sm lg:max-w-md">
                                                <div
                                                    className={`px-4 py-3 rounded-2xl ${
                                                        msg.de === user._id
                                                            ? "bg-blue-500 text-white rounded-br-none"
                                                            : "bg-gray-300 text-gray-900 rounded-bl-none"
                                                    }`}
                                                    style={{ wordBreak: "break-word" }}
                                                >
                                                    <p className="text-sm md:text-base">{msg.texto}</p>
                                                    <p className={`text-xs mt-1 ${msg.de === user._id ? "text-blue-100" : "text-gray-600"}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="mb-4 flex justify-start">
                                        <div className="bg-gray-300 rounded-2xl px-4 py-3 rounded-bl-none">
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:.2s]"></div>
                                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:.4s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* AREA DE ENTRADA DE MENSAJES - FIJA */}
                    <form onSubmit={handleSend} className="bg-white border-t border-gray-300 p-4 md:p-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-gray-100 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-500 disabled:text-gray-300 disabled:hover:bg-transparent flex-shrink-0"
                            >
                                <IoSend size={24} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 h-full">
                    <div className="text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Selecciona un chat</h2>
                        <p className="text-gray-500">Elige un contacto para comenzar a chatear</p>
                    </div>
                </div>
            )}

            {/* ✅ Modal de vista de imagen */}
            <ModalViewImage
                imageSrc={selectedImageUrl}
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                userName={selectedContact ? `${selectedContact.nombreDocente || selectedContact.nombre} ${selectedContact.apellidoDocente || selectedContact.apellido}` : ""}
            />
        </div>
    );
};

export default Chat;