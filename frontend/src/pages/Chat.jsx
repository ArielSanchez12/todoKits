import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { io } from 'socket.io-client'

const Chat = () => {
    const [responses, setResponses] = useState([])
    const [socket, setSocket] = useState(null)
    const [chat, setChat] = useState(true)
    const [nameUser, setNameUser] = useState("")
    const [isSomeoneTyping, setIsSomeoneTyping] = useState(false)
    const [showTypingAnim, setShowTypingAnim] = useState(false)
    const [renderTypingAnim, setRenderTypingAnim] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    const handleEnterChat = (data) => {
        setNameUser(data.name)
        setChat(false)
    }

    const handleMessageChat = (data) => {
        if (!socket) return console.error("No hay conexión con el servidor")
        const newMessage = {
            body: data.message,
            from: nameUser,
        }
        socket.emit("enviar-mensaje-front-back", newMessage)
        reset({ message: "" })
        // Reinicia el alto del textarea y enfoca
        if (inputRef.current) {
            inputRef.current.style.height = "40px"; // <-- Reinicia el alto
            inputRef.current.focus()
        }
    }

    // Emitir evento cuando el usuario está escribiendo
    const handleTyping = () => {
        if (socket && nameUser) {
            socket.emit("usuario-escribiendo", nameUser)
        }
    }

    const handleAutoResize = (e) => {
        const textarea = e.target;
        textarea.style.height = "40px"; // altura mínima
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"; // altura máxima 120px
        handleTyping();
    };

    useEffect(() => {
        const newSocket = io("http://localhost:3000")
        setSocket(newSocket)
        newSocket.on("enviar-mensaje-front-back", (payload) => {
            setResponses((prev) => [...prev, payload])
            // Apaga la animación de escribiendo cuando llega un mensaje
            setIsSomeoneTyping(false)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        })
        newSocket.on("usuario-escribiendo", (user) => {
            if (user !== nameUser) {
                setIsSomeoneTyping(true)
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = setTimeout(() => {
                    setIsSomeoneTyping(false)
                }, 3000)
            }
        })
        return () => {
            newSocket.off("enviar-mensaje-front-back")
            newSocket.off("usuario-escribiendo")
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
            }
        }, 0)
    }, [responses, isSomeoneTyping])

    useEffect(() => {
        if (isSomeoneTyping) {
            setRenderTypingAnim(true)
            // Espera un tick para activar la animación de entrada
            setTimeout(() => setShowTypingAnim(true), 10)
        } else {
            setShowTypingAnim(false)
            // Espera la transición antes de quitar el componente
            const timeout = setTimeout(() => setRenderTypingAnim(false), 500)
            return () => clearTimeout(timeout)
        }
    }, [isSomeoneTyping])

    useEffect(() => {
        // Reinicia el alto del textarea cuando el campo está vacío
        if (inputRef.current && inputRef.current.value === "") {
            inputRef.current.style.height = "40px";
        }
    }, [watch("message")]);

    const avatarUser = "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
    const avatarBot = "https://cdn-icons-png.flaticon.com/512/9387/9387914.png"

    return (
        <div className="max-w-4xl mx-auto mt-4 bg-gray-100 text-black rounded-2xl shadow-xl p-6 border border-black">
            {
                chat ? (
                    <div>
                        <form onSubmit={handleSubmit(handleEnterChat)} className="flex flex-col sm:flex-row justify-center gap-4">
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
                                    const isUser = response.from === nameUser
                                    const bubbleColor = isUser
                                        ? "bg-blue-100 border border-blue-600 text-blue-900"
                                        : "bg-red-100 border border-red-600 text-red-900"
                                    const align = isUser ? "self-end flex-row-reverse" : "self-start"
                                    const avatar = isUser ? avatarUser : avatarBot

                                    return (
                                        <div key={index} className={`flex items-start gap-3 ${align}`}>
                                            <img
                                                src={avatar}
                                                alt="avatar"
                                                className="w-10 h-10 rounded-full object-cover border border-black/30"
                                            />
                                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${bubbleColor}`}>
                                                <p className="font-semibold text-base mb-1">{response.from}</p>
                                                <p className="text-base break-words whitespace-pre-line">{response.body}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            {
                                renderTypingAnim && (
                                    <div
                                        className={`flex items-center gap-1 text-gray-600 mb-1
                                            transition-all duration-500 ease-in-out
                                            ${showTypingAnim ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-4"}
                                        `}
                                        style={{ minHeight: "32px" }}
                                    >
                                        <img src={avatarBot} alt="typing" className="w-4 h-4 inline-block" />
                                        <span className="flex items-center bg-white rounded-xl px-2 py-1 border border-gray-300 shadow">
                                            <span className="flex gap-0.5">
                                                <span className="animate-bounce inline-block text-lg" style={{ animationDelay: "0ms" }}>•</span>
                                                <span className="animate-bounce inline-block text-lg" style={{ animationDelay: "200ms" }}>•</span>
                                                <span className="animate-bounce inline-block text-lg" style={{ animationDelay: "400ms" }}>•</span>
                                            </span>
                                        </span>
                                    </div>
                                )
                            }
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="border-t border-black pt-4 mt-4">
                            <form
                                onSubmit={handleSubmit((data) => {
                                    handleMessageChat(data);
                                    // Espera a que el textarea se limpie y luego reinicia el alto
                                    setTimeout(() => {
                                        if (inputRef.current) {
                                            inputRef.current.style.height = "40px"; // <-- Reinicia el alto SIEMPRE después de enviar
                                            inputRef.current.focus();
                                        }
                                    }, 0);
                                })}
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
    )
}

export default Chat
