import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { io } from 'socket.io-client'

const Chat = () => {
    const [responses, setResponses] = useState([])
    const [socket, setSocket] = useState(null)
    const [chat, setChat] = useState(true)
    const [nameUser, setNameUser] = useState("")
    const { register, handleSubmit, formState: { errors }, reset } = useForm()

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
        setResponses((prev) => [...prev, newMessage])
        reset({ message: "" })
    }

    useEffect(() => {
        const newSocket = io("http://localhost:3000")
        setSocket(newSocket)
        newSocket.on("enviar-mensaje-front-back", (payload) => {
            setResponses((prev) => [...prev, payload])
        })
        return () => newSocket.disconnect()
    }, [])

    const avatarUser = "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
    const avatarBot = "https://cdn-icons-png.flaticon.com/512/3594/3594507.png"

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
                                                <p className="text-base">{response.body}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div className="border-t border-black pt-4 mt-4">
                            <form onSubmit={handleSubmit(handleMessageChat)} className="flex flex-col sm:flex-row items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Escribe tu mensaje..."
                                    className="flex-1 bg-white text-gray-800 rounded-md py-2 px-4 border border-black/30 focus:outline-none focus:ring-2 focus:ring-black"
                                    {...register("message", { required: "El mensaje es obligatorio!" })}
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
