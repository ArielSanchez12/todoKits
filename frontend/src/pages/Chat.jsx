import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import storeAuth from "../context/storeAuth";
import { MdQrCode } from "react-icons/md";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Chat = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [responses, setResponses] = useState([]);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const token = storeAuth((state) => state.token);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [userType, setUserType] = useState(""); // "docente" o "admin"
    const pusherRef = useRef(null);
    const channelRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Detectar tipo de usuario
    useEffect(() => {
        console.log("Usuario actual:", user);
        if (user.rolDocente) {
            console.log("Es docente");
            setUserType("docente");
        } else if (user.rol === "Administrador") { // Cambio importante aquí
            console.log("Es admin");
            setUserType("admin");
        }
    }, [user]);

    // Obtener contactos
    useEffect(() => {
        if (!token || !userType) return;
        const endpoint = userType === "docente" ? "/chat/admin" : "/chat/docentes";
        console.log("UserType:", userType); // Para ver qué tipo de usuario es
        console.log("Endpoint:", endpoint); // Para ver qué endpoint se está llamando

        fetch(`${BACKEND_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                console.log("Datos recibidos:", data); // Para ver los datos que llegan
                setContacts(userType === "docente" ? (data ? [data] : []) : data);
            });
    }, [token, userType]);

    // Cargar historial al seleccionar contacto
    useEffect(() => {
        console.log("Estado actual:", {
            userType,
            contacts,
            selectedContact
        });
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
            // No desconectes Pusher aquí, solo desuscribe el canal si quieres
        };
    }, [selectedContact, user]);

    // Simulación: activa cuando el otro usuario está escribiendo
    useEffect(() => {
        if (!selectedContact) return;
        // Aquí deberías escuchar el evento "typing" de Pusher y activar setIsTyping(true)
        // Simulación temporal:
        // setIsTyping(true);
        // setTimeout(() => setIsTyping(false), 2000);
    }, [selectedContact]);

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
        if (msgs.length === 0) return { texto: " ", esMio: false, estado: null, createdAt: null };
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
            // Dentro de la última semana
            return date.toLocaleDateString('es-ES', { weekday: 'short' }); // ej: "lun."
        } else {
            // Fecha completa
            return date.toLocaleDateString();
        }
    }

    //Renderizar mensaje de transferencia
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

                {/* Botón para ver el QR */}
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
            </div>
        );
    };

    contacts.forEach(contact => console.log(contact));
    return (
        <div className="flex h-[80vh]">
            {/* Sidebar de contactos */}
            <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
                <h2 className="text-lg text-center text-black font-bold mb-4">
                    {userType === "docente" ? "Administrador" : "Docentes"}
                </h2>
                {contacts.map(contact => {
                    const lastMsg = getLastMessageInfo(contact._id);
                    return (
                        <div
                            key={contact._id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-300 ${selectedContact?._id === contact._id ? "bg-gray-300" : ""}`}
                            onClick={() => setSelectedContact(contact)}
                        >
                            <img
                                src={
                                    userType === "docente"
                                        ? (
                                            contact.avatar ||
                                            contact.avatarDocente ||
                                            "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                                        )
                                        : (
                                            contact.avatarDocente ||
                                            contact.avatar ||
                                            "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                                        )
                                }
                                alt="avatar"
                                className="w-13 h-13 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold truncate">
                                        {contact.nombreDocente
                                            ? `${contact.nombreDocente} ${contact.apellidoDocente}`
                                            : `${contact.nombre} ${contact.apellido}`}
                                    </span>
                                    {/* Fecha tipo WhatsApp */}
                                    <span className="text-sm text-black ml-2">
                                        {formatLastMessageDate(lastMsg.createdAt)}
                                    </span>
                                </div>
                                <div className="text-base text-black flex items-center gap-1 truncate">
                                    {lastMsg.esMio && <span className="font-bold text-black">tu:</span>}
                                    <span className="truncate">{lastMsg.texto}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Chat principal */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                    {responses.map((msg, idx) => (
                        <div key={idx} className="mb-4">
                            {/* ✅ RENDERIZADO CONDICIONAL: Normal vs Transferencia */}
                            {msg.tipo === "transferencia" ? (
                                renderMensajeTransferencia(msg)
                            ) : (
                                <div
                                    className={`flex ${msg.de === user._id ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`relative max-w-[75%] px-3 py-2 rounded-xl shadow
                                            ${msg.de === user._id
                                                ? "bg-gray-900 text-white rounded-br-none"
                                                : "bg-gray-200 text-black rounded-bl-none"
                                            }`}
                                        style={{ wordBreak: "break-word" }}
                                    >
                                        <div className="flex items-end gap-2">
                                            <span className="text-base">{msg.texto}</span>
                                            <span className="text-sm text-white-500 opacity-80 pb-[2px]">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className={`absolute top-2 ${msg.de === user._id ? "right-[-11px]" : "left-[-11px]"}`}>
                                            <svg width="12" height="20" viewBox="0 0 12 25">
                                                <polygon
                                                    points={msg.de === user._id ? "0,0 12,10 0,20" : "12,0 0,10 12,20"}
                                                    fill={msg.de === user._id ? "#000000ff" : "#e5e7eb"}
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center mb-2">
                            <div className="bg-gray-300 rounded-full px-4 py-2 flex items-center gap-2">
                                <span className="text-sm text-gray-700">Escribiendo</span>
                                <span className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.2s]"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.4s]"></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {selectedContact && (
                    <form onSubmit={handleSend} className="flex p-4 border-t">
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="flex-1 border rounded px-2 py-1"
                            placeholder="Escribe tu mensaje..."
                        />
                        <button type="submit" className="ml-2 px-4 py-1 bg-black text-white rounded">Enviar</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Chat;