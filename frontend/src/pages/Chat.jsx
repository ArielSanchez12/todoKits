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
    const token = storeAuth((state) => state.token);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [userType, setUserType] = useState(""); // "docente" o "admin"
    const channelRef = useRef(null);

    // Detectar tipo de usuario
    useEffect(() => {
        if (user.rolDocente) setUserType("docente");
        else if (user.rolAdmin) setUserType("admin");
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
                // Si es docente, data es un solo admin, lo ponemos en array
                setContacts(userType === "docente" ? (data ? [data] : []) : data);
            });
    }, [token, userType]);

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
        const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
        const channel = pusher.subscribe("chat");
        channelRef.current = channel;
        channel.bind("nuevo-mensaje", (data) => {
            if (
                (data.de === user._id && data.para === selectedContact._id) ||
                (data.de === selectedContact._id && data.para === user._id)
            ) {
                setResponses((prev) => [...prev, data]);
            }
        });
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
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
                        <img src={contact.avatarDocente || contact.avatarAdmin || "/images/default.png"} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div>
                            <div className="font-semibold">
                                {contact.nombreDocente || contact.nombre} {contact.apellidoDocente || contact.apellido}</div>
                            <div className="text-xs text-gray-600">
                                {contact.emailDocente || contact.email}</div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Chat principal */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                    {responses.map((msg, idx) => (
                        <div key={idx} className={`mb-2 flex ${msg.de === user._id ? "justify-end" : "justify-start"}`}>
                            <div className={`p-2 rounded-lg ${msg.de === user._id ? "bg-blue-200" : "bg-gray-300"}`}>
                                <div className="text-xs font-bold">{msg.deNombre}</div>
                                <div>{msg.texto}</div>
                            </div>
                        </div>
                    ))}
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