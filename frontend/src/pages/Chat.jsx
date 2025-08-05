import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Pusher from "pusher-js";
import storeAuth from "../context/storeAuth";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_ID;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://kitsbackend.vercel.app/api/chat";

const Chat = () => {
    const [responses, setResponses] = useState([]);
    const [chat, setChat] = useState(true);
    const [nameUser, setNameUser] = useState("");
    const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
    const [showTypingAnim, setShowTypingAnim] = useState(false);
    const [renderTypingAnim, setRenderTypingAnim] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const token = storeAuth((state) => state.token);

    // Referencia para el canal de Pusher
    const channelRef = useRef(null);

    useEffect(() => {
        if (!nameUser) return;

        const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER, authEndpoint: "/pusher/auth", auth: { headers: { Authorization: `Bearer ${token}` } } });
        const channel = pusher.subscribe("chat");
        channelRef.current = channel;

        channel.bind("nuevo-mensaje", (data) => {
            if (data.paraNombre === nameUser || data.deNombre === nameUser) {
                setResponses((prev) => [...prev, data]);
                setIsSomeoneTyping(false);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            }
        });

        // Suscribirse al evento de "escribiendo"
        channel.bind("client-escribiendo", (data) => {
            // Solo mostrar si el que escribe no soy yo y el mensaje es para mí
            if (data.deNombre !== nameUser && data.paraNombre === nameUser) {
                setIsSomeoneTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsSomeoneTyping(false), 2000);
            }
        });

        fetch(`${BACKEND_URL}/chat-history/${nameUser}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setResponses(data));

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [nameUser, token]);

    // Enviar mensaje al backend
    const handleMessageChat = async (data) => {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const userId = user.id || user._id;
        const userName = user.name || user.nombreDocente || user.nombreAdmin || "Desconocido";
        const destinatario = { id: "idAdmin", nombre: "NombreAdmin" }; // O el admin seleccionado

        if (!userId || !userName) {
            alert("Usuario no autenticado. Por favor, inicia sesión.");
            return;
        }

        const newMessage = {
            texto: data.message,
            de: userId,
            deNombre: userName,
            para: destinatario.id,
            paraNombre: destinatario.nombre,
            deTipo: "docente",
            paraTipo: "admin"
        };

        await fetch(`${BACKEND_URL}/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newMessage)
        })
        .then(res => res.json())
        .then(mensaje => {
            setResponses(prev => [...prev, mensaje]);
        });

        reset({ message: "" });
        if (inputRef.current) {
            inputRef.current.style.height = "40px";
            inputRef.current.focus();
        }
    };
    // Emitir evento de escribiendo
    const handleTyping = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const destinatario = { id: "idAdmin", nombre: "NombreAdmin" }; // selecciona el admin
        if (channelRef.current) {
            channelRef.current.trigger("client-escribiendo", {
                de: user.id,
                deNombre: user.name,
                para: destinatario.id,
                paraNombre: destinatario.nombre
            });
        }
    };

    const handleAutoResize = (e) => {
        const textarea = e.target;
        textarea.style.height = "40px";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
        handleTyping(); // Llama aquí para emitir el evento al escribir
    };

    useEffect(() => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 0);
    }, [responses, isSomeoneTyping]);

    useEffect(() => {
        if (isSomeoneTyping) {
            setRenderTypingAnim(true);
            setTimeout(() => setShowTypingAnim(true), 10);
        } else {
            setShowTypingAnim(false);
            const timeout = setTimeout(() => setRenderTypingAnim(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [isSomeoneTyping]);

    useEffect(() => {
        if (inputRef.current && inputRef.current.value === "") {
            inputRef.current.style.height = "40px";
        }
    }, [watch("message")]);

    const avatarUser = "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";
    const avatarBot = "https://cdn-icons-png.flaticon.com/512/9387/9387914.png";

    return (
        <div className="max-w-4xl mx-auto mt-4 bg-gray-100 text-black rounded-2xl shadow-xl p-6 border border-black">
            {
                chat ? (
                    <div>
                        <form onSubmit={handleSubmit((data) => {
                            setNameUser(data.name);
                            setChat(false);
                        })} className="flex flex-col sm:flex-row justify-center gap-4">
                            <input
                                type="text"
                                placeholder="Ingresa tu nombre de usuario"
                                className="flex-1 rounded-md border border-black/30 bg-white text-gray-800 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black"
                                {...register("name", { required: "El nombre de usuario es obligatorio!" })}
                            />
                            <button className="bg-blue-700 text-white py-2 px-6 rounded-md hover:bg-blue-600 hover:scale-105 transition duration-300">
                                Ingresar al chat
                            </button>
                        </form>
                        {errors.name && <p className="text-red-500 mt-2">{errors.name.message}</p>}
                    </div>
                ) : (
                    <div className="flex flex-col justify-between h-[70vh]">
                        <div className="flex flex-col space-y-4 p-4 overflow-y-auto bg-gray-50 rounded-md h-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 border border-black/20">
                            {
                                responses.map((response, index) => {
                                    const isUser = response.deNombre === nameUser;
                                    const bubbleColor = isUser
                                        ? "bg-blue-100 border border-blue-600 text-blue-900"
                                        : "bg-red-100 border border-red-600 text-red-900";
                                    const align = isUser ? "self-end flex-row-reverse" : "self-start";
                                    const avatar = isUser ? avatarUser : avatarBot;

                                    return (
                                        <div key={index} className={`flex items-start gap-3 ${align}`}>
                                            <img
                                                src={avatar}
                                                alt="avatar"
                                                className="w-10 h-10 rounded-full object-cover border border-black/30"
                                            />
                                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${bubbleColor}`}>
                                                <p className="font-semibold text-base mb-1">{isUser ? "Tú" : response.deNombre}</p>
                                                <p className="text-base break-words whitespace-pre-line">{response.texto}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                            {/* Animación de escribiendo */}
                            {renderTypingAnim && (
                                <div className={`flex items-center gap-2 ${showTypingAnim ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
                                    <span className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    <span className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                                    <span className="text-gray-500 ml-2">Escribiendo...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="border-t border-black pt-4 mt-4">
                            <form
                                onSubmit={handleSubmit(handleMessageChat)}
                                className="flex flex-col sm:flex-row items-center gap-3"
                            >
                                <textarea
                                    ref={inputRef}
                                    placeholder="Escribe tu mensaje..."
                                    className="flex-1 bg-white text-gray-800 rounded-md py-2 px-4 border border-black/30 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                    style={{ minHeight: "40px", maxHeight: "120px", overflowY: "auto" }}
                                    {...register("message", { required: "El mensaje es obligatorio!" })}
                                    onChange={handleAutoResize}
                                />
                                <button
                                    type="submit"
                                    className="bg-red-700 text-white py-2 px-6 rounded-lg hover:bg-red-600 hover:scale-105 transition duration-300"
                                >
                                    Enviar
                                </button>
                            </form>
                            {errors.message && <p className="text-red-500 mt-2">{errors.message.message}</p>}
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Chat;