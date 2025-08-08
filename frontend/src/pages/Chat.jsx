import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import storeAuth from "../context/storeAuth";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Chat = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [responses, setResponses] = useState([]);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const token = storeAuth((state) => state.token);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [userType, setUserType] = useState(""); // "docente" o "admin"
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
        const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
        const channel = pusher.subscribe("chat");
        channelRef.current = channel;
        channel.bind("nuevo-mensaje", (data) => {
        // Si el mensaje es del chat abierto, lo agrego al chat
        if (
            (data.de === user._id && data.para === selectedContact._id) ||
            (data.de === selectedContact._id && data.para === user._id)
        ) {
            setResponses((prev) => [...prev, data]);
        } else if (
            data.para === user._id &&
            (!selectedContact || data.de !== selectedContact._id)
        ) {
            setUnreadCounts(prev => ({
                ...prev,
                [data.de]: (prev[data.de] || 0) + 1
            }));
        }
    });
    return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
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

    contacts.forEach(contact => console.log(contact));
    return (
        <div className="flex h-[80vh]">
            {/* Sidebar de contactos */}
            <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
                <h2 className="font-bold mb-4">
                    {userType === "docente" ? "Administrador" : "Docentes"}
                </h2>
                {contacts.map(contact => (
                    <div
                        key={contact._id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-300 ${selectedContact?._id === contact._id ? "bg-gray-300" : ""}`}
                        onClick={() => setSelectedContact(contact)}
                    >
                        <img
  src={
    contact.avatarDocente ||
    contact.avatarDocenteIA ||
    contact.avatar ||
    contact.avatarIA ||
    "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
  }
  alt="avatar"
  className="w-10 h-10 rounded-full"
/>
                        <div>
                            <div className="font-semibold">
                                {userType === "docente"
                                    ? `${contact.nombre} ${contact.apellido}`
                                    : `${contact.nombreDocente} ${contact.apellidoDocente}`}
                            </div>
                            <div className="text-xs text-gray-600">
                                {userType === "docente"
                                    ? contact.email
                                    : contact.emailDocente}
                            </div>
                        </div>
                        {unreadCounts[contact._id] > 0 && (
    <span className="ml-auto flex items-center justify-center w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold">
        {unreadCounts[contact._id]}
    </span>
)}
                    </div>
                ))}
            </div>
            {/* Chat principal */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                    {responses.map((msg, idx) => (
                        <div key={idx} className={`mb-2 flex ${msg.de === user._id ? "justify-end" : "justify-start"}`}>
                            <div className={`relative max-w-xs px-4 py-2 rounded-2xl shadow
                                ${msg.de === user._id
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                                }`}>
                                <div className="text-xs font-bold mb-1">{msg.deNombre}</div>
                                <div>{msg.texto}</div>
                                {/* Flechita tipo burbuja */}
                                <span className={`absolute top-2 ${msg.de === user._id ? "right-[-10px]" : "left-[-10px]"}`}>
                                    <svg width="12" height="20" viewBox="0 0 12 20">
                                        <polygon
                                            points={msg.de === user._id ? "0,0 12,10 0,20" : "12,0 0,10 12,20"}
                                            fill={msg.de === user._id ? "#3b82f6" : "#e5e7eb"}
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center mb-2">
                            <div className="bg-gray-300 rounded-full px-4 py-2 flex items-center gap-2">
                                <span className="text-xs text-gray-700">Escribiendo</span>
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
                        <button type="submit" className="ml-2 px-4 py-1 bg-blue-600 text-white rounded">Enviar</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Chat;