import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import storeAuth from "../context/storeAuth";
import ModalViewImage from "../components/profile/ModalViewImage" // ✅ NUEVO
import { MdQrCode, MdSearch } from "react-icons/md";
import { IoSend, IoCheckmarkDoneSharp, IoTimeOutline, IoEllipsisVertical, IoInformationCircleOutline, IoTrashOutline } from "react-icons/io5";
import { FiCheck } from "react-icons/fi"; // simple check para 'delivered' si quieres diferenciación

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
    const [replyTarget, setReplyTarget] = useState(null); // ✅ NUEVO
    const messagesContainerRef = useRef(null); // ✅ NUEVO
    const pendingRead = useRef(new Set()); // ✅ NUEVO
    const readFlushTimer = useRef(null); // ✅ NUEVO
    const [highlightedId, setHighlightedId] = useState(null); // ✅ NUEVO
    const highlightTimerRef = useRef(null); // ✅ NUEVO
    const [showContext, setShowContext] = useState(false);          // ✅ NUEVO
    const [contextMsg, setContextMsg] = useState(null);             // ✅ NUEVO
    const [contextPos, setContextPos] = useState({ x: 0, y: 0 });   // ✅ NUEVO
    const [multiSelectMode, setMultiSelectMode] = useState(false);  // ✅ NUEVO
    const [selectedIds, setSelectedIds] = useState(new Set());
    const canceledClientIdsRef = useRef(new Set()); // ✅ NUEVO: ids de envíos cancelados (clientId)


    // ✅ FALTABA: función para alternar selección
    const toggleSelect = (id) => {
        if (!id) return;
        setSelectedIds(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    // Derivados de la selección (para habilitar/inhabilitar acciones en header)
    const selectedList = responses.filter(m => m._id && selectedIds.has(m._id));
    const anySelected = selectedList.length > 0;
    const hasOthersSelected = selectedList.some(m => m.de !== user._id);
    const canDeleteBoth = anySelected && !hasOthersSelected; // solo si todos son tuyos

    // Eliminar múltiple "para ambos" (solo aplicará a los tuyos en backend; en UI ya lo deshabilitamos si hay ajenos)
    const deleteMany = async () => {
        if (!anySelected) return;
        if (!window.confirm("Eliminar mensajes seleccionados para ambos usuarios?")) return;
        try {
            await fetch(`${BACKEND_URL}/chat/messages/delete-many`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
        } catch { }
        setSelectedIds(new Set());
        setMultiSelectMode(false);
        setShowContext(false);
    };

    // Eliminar múltiple "para mí" (ocultar)
    const deleteManyForMe = async () => {
        if (!anySelected) return;
        try {
            await fetch(`${BACKEND_URL}/chat/messages/hide-many`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
        } catch { }
        setSelectedIds(new Set());
        setMultiSelectMode(false);
    };

    // Detectar tipo de usuario
    useEffect(() => {
        if (user.rolDocente) {
            setUserType("docente");
        } else if (user.rol === "Administrador") {
            setUserType("admin");
        }
    }, [user]);

    // ✅ Ayuda: generar id temporal para correlacionar con el evento de Pusher
    const genClientId = () => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };

    // ✅ Diagnóstico de Pusher (opcional: comentar en prod)
    useEffect(() => {
        // Muestra estados de conexión en consola
        if (window && !window.__PUSHER_LOG__) {
            window.__PUSHER_LOG__ = true;
            try {
                // Activar logs de pusher
                // Pusher.logToConsole = true; // descomenta si necesitas más detalle
            } catch { }
        }
    }, []);

    // Obtener contactos
    useEffect(() => {
        if (!token || !userType) return;
        const endpoint = userType === "docente" ? "/chat/admin" : "/chat/docentes";

        fetch(`${BACKEND_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const list = userType === "docente" ? (data ? [data] : []) : (Array.isArray(data) ? data : []);
                const normalized = list.map(c => {
                    if (userType === "docente") {
                        return {
                            ...c,
                            avatarCropped: c.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png",
                            avatarFull: c.avatarOriginal || c.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png",
                        }
                    } else {
                        return {
                            ...c,
                            avatarCropped: c.avatarDocente || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png",
                            avatarFull: c.avatarDocenteOriginal || c.avatarDocente || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png",
                        }
                    }
                })
                setContacts(normalized)
                setFilteredContacts(normalized)
            })
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

    // Cargar historial al seleccionar contacto (marcar delivered)
    useEffect(() => {
        if (!selectedContact) return;
        fetch(`${BACKEND_URL}/chat/chat-history/${selectedContact._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const withStatus = (Array.isArray(data) ? data : []).map(m => ({ ...m, estado: m.estado || 'delivered' }));
                setResponses(withStatus);
            });
    }, [selectedContact, token]);

    // Suscribirse a Pusher y reconcilia “pending” -> “delivered”
    useEffect(() => {
        if (!selectedContact) return;

        if (!pusherRef.current) {
            pusherRef.current = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
            channelRef.current = pusherRef.current.subscribe("chat");

            // Logs de estado de conexión (diagnóstico)
            pusherRef.current.connection.bind('state_change', states => {
                // console.log('Pusher state:', states.previous, '->', states.current);
            });
            pusherRef.current.connection.bind('error', err => {
                // console.warn('Pusher error:', err);
            });
        }
        const channel = channelRef.current;

        const handleNewMessage = (data) => {
            // ✅ Ignorar mensajes que el cliente canceló (reconciliación por clientId)
            if (data.clientId && canceledClientIdsRef.current.has(data.clientId)) return;

            const isBetween =
                (data.de === user._id && data.para === selectedContact?._id) ||
                (data.de === selectedContact?._id && data.para === user._id);
            if (!isBetween) return;

            if (data.de === user._id) {
                setResponses(prev => {
                    const idx = data.clientId
                        ? prev.findIndex(m => m.estado === 'pending' && m.clientId === data.clientId)
                        : prev.findIndex(m => m.estado === 'pending' && m.de === user._id && m.texto === data.texto && m.para === data.para);
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = { ...data, estado: 'delivered' };
                        return next;
                    }
                    return [...prev, { ...data, estado: 'delivered' }];
                });
            } else {
                setResponses(prev => [...prev, { ...data, estado: 'delivered' }]);
            }
        };

        channel.bind("nuevo-mensaje", handleNewMessage);
        return () => channel.unbind("nuevo-mensaje", handleNewMessage);
    }, [selectedContact, user]);

    // ✅ NUEVO estado y refs para bloquear envíos repetidos
    const sendingRef = useRef(false);
    const [allowSend, setAllowSend] = useState(true); // Se reactiva solo cuando el usuario escribe algo

    // Enviar mensaje (optimista) with reply
    const handleSend = async (e) => {
        e.preventDefault();
        const contenido = message.trim();
        if (!selectedContact) return;
        // Bloqueos:
        if (!contenido) return;
        if (!allowSend) return;
        if (sendingRef.current) return;

        // Bloquear más envíos hasta que el usuario vuelva a escribir
        sendingRef.current = true;
        setAllowSend(false);

        const clientId = genClientId();
        const nowIso = new Date().toISOString();

        const optimisticMsg = {
            _id: clientId,
            clientId,
            texto: contenido,
            de: user._id,
            deNombre: user.nombreDocente || user.nombreAdmin || user.nombre,
            para: selectedContact._id,
            paraNombre: selectedContact.nombreDocente || selectedContact.nombreAdmin || selectedContact.nombre,
            deTipo: userType,
            paraTipo: userType === "docente" ? "admin" : "docente",
            createdAt: nowIso,
            estado: 'pending',
            replyTo: replyTarget ? { _id: replyTarget._id, texto: replyTarget.texto } : null
        };
        setResponses(prev => [...prev, optimisticMsg]);

        // Vaciar input inmediatamente
        setMessage("");
        setReplyTarget(null);

        try {
            const payload = {
                texto: contenido,
                de: user._id,
                deNombre: optimisticMsg.deNombre,
                para: selectedContact._id,
                paraNombre: optimisticMsg.paraNombre,
                deTipo: userType,
                paraTipo: userType === "docente" ? "admin" : "docente",
                clientId,
                replyToId: optimisticMsg.replyTo?._id || null,
                replyToTexto: optimisticMsg.replyTo?.texto || null
            };

            const res = await fetch(`${BACKEND_URL}/chat/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                setResponses(prev => prev.map(m => (m.clientId === clientId ? { ...m, estado: 'error' } : m)));
            }
        } catch {
            setResponses(prev => prev.map(m => (m.clientId === clientId ? { ...m, estado: 'error' } : m)));
        } finally {
            // Mantiene el bloqueo hasta que el usuario escriba algo nuevo (allowSend se activa en onChange)
            sendingRef.current = false;
        }
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

    // ✅ Componente interno para cada burbuja (maneja long press / context menu)
    const MessageBubble = ({
        msg,
        user,
        highlightedId,
        jumpToMessage,
        openContextMenu,
        multiSelectMode,
        selectedIds,
        toggleSelect
    }) => {
        const timeoutRef = useRef(null);

        const isOwn = msg.de === user._id;
        // Seleccionable si hay selección múltiple y el mensaje tiene _id (excluye pendientes temporales)
        const selectable = multiSelectMode && !!msg._id;
        const isSelected = selectable && selectedIds.has(msg._id);

        const startPress = (e) => {
            if (selectable) return; // en selección múltiple no abrir menú
            e.preventDefault();
            timeoutRef.current = setTimeout(() => openContextMenu(e, msg), 450);
        };
        const clearPress = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
        const handleContext = (e) => {
            if (selectable) return;
            e.preventDefault();
            openContextMenu(e, msg);
        };
        const handleClick = (e) => {
            if (!selectable) return;
            e.preventDefault();
            toggleSelect(msg._id);
        };

        return (
            <div className="max-w-xs md:max-w-sm lg:max-w-md relative">
                {/* Indicador de selección */}
                {selectable && (
                    <div className="absolute -left-6 top-2">
                        <div className={`w-4 h-4 border rounded-sm ${isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-gray-400"}`} />
                    </div>
                )}
                <div
                    className={`px-4 py-3 rounded-2xl ${isOwn ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-300 text-gray-900 rounded-bl-none"}
                        ${highlightedId === msg._id ? "ring-2 ring-amber-300" : ""}
                        ${isSelected ? "ring-2 ring-blue-400" : ""}`}
                    style={{ wordBreak: "break-word" }}
                    onTouchStart={startPress}
                    onTouchEnd={clearPress}
                    onTouchMove={clearPress}
                    onContextMenu={handleContext}
                    onClick={handleClick}
                >
                    {msg.replyTo && !msg.softDeleted && (
                        <div
                            className={`mb-2 px-3 py-2 rounded ${isOwn ? "bg-blue-600/40" : "bg-white/60"} text-xs italic border-l-4 ${isOwn ? "border-blue-200" : "border-gray-400"} cursor-pointer hover:opacity-90`}
                            title="Ir al mensaje original"
                            onClick={(e) => {
                                e.stopPropagation();
                                jumpToMessage(msg.replyTo._id);
                            }}
                        >
                            {msg.replyTo.texto?.slice(0, 120) || "Mensaje"}
                            {msg.replyTo.texto && msg.replyTo.texto.length > 120 ? "…" : ""}
                        </div>
                    )}

                    <p className={`text-sm md:text-base ${msg.softDeleted ? "italic opacity-70" : ""}`}>
                        {msg.texto}
                        {msg.editedAt && !msg.softDeleted && <span className="ml-2 text-[10px] opacity-70">(editado)</span>}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                        <p className={`text-xs ${isOwn ? "text-blue-100" : "text-gray-600"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isOwn && (
                            <>
                                {msg.estado === 'pending' && <IoTimeOutline className="text-blue-100" title="Enviando..." />}
                                {msg.estado === 'delivered' && <IoCheckmarkDoneSharp className="text-blue-100" title="Entregado" />}
                                {msg.estado === 'read' && <IoCheckmarkDoneSharp className="text-green-300" title="Leído" />}
                                {msg.estado === 'error' && <span className="text-red-300 text-xs font-semibold">Error</span>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Marcar leídos al abrir conversación (simple)
    useEffect(() => {
        if (!selectedContact) return;
        const noRead = responses.filter(m => m.de === selectedContact._id && m.estado !== "read" && !m.softDeleted);
        if (!noRead.length) return;
        fetch(`${BACKEND_URL}/chat/read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ids: noRead.map(m => m._id) })
        });
    }, [responses, selectedContact]);

    // Marcar leídos por visibilidad (IntersectionObserver)
    useEffect(() => {
        if (!selectedContact) return;
        const container = messagesContainerRef.current;
        if (!container) return;

        const toObserve = Array.from(container.querySelectorAll(`[data-from="${selectedContact._id}"][data-estado="delivered"]`));
        if (!toObserve.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                    const id = entry.target.getAttribute("data-mid");
                    if (id) pendingRead.current.add(id);
                }
            });
            if (readFlushTimer.current) clearTimeout(readFlushTimer.current);
            readFlushTimer.current = setTimeout(async () => {
                const ids = Array.from(pendingRead.current);
                pendingRead.current.clear();
                if (ids.length) {
                    try {
                        await fetch(`${BACKEND_URL}/chat/read`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ ids })
                        });
                    } catch { }
                }
            }, 400);
        }, { root: container, threshold: [0.6] });

        toObserve.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [responses, selectedContact, token]);

    // Render estados (iconos)
    const EstadoIcon = ({ msg }) => {
        if (msg.de !== user._id) return null;
        if (msg.estado === "read") return <IoCheckmarkDoneSharp className="text-green-300" title="Leído" />;
        return <IoCheckmarkDoneSharp className="text-blue-100" title="Entregado" />;
    };

    // Acciones de menú
    const startReply = () => {
        if (!contextMsg) return;
        setReplyTarget({ _id: contextMsg._id, texto: contextMsg.texto });
        setShowContext(false);
    };

    const hideForMe = async () => {
        if (!contextMsg) return;
        await fetch(`${BACKEND_URL}/chat/message/${contextMsg._id}/hide`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        setShowContext(false);
    };

    // ✅ NUEVO: saltar al mensaje original y resaltarlo
    const jumpToMessage = (id) => {
        if (!id || !messagesContainerRef.current) return;
        const el = messagesContainerRef.current.querySelector(`[data-mid="${id}"]`);
        if (!el) {
            console.warn("Mensaje original no encontrado en el DOM (puede haber expirado por TTL).");
            return;
        }
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(id);
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 1600);
    };

    // ✅ Cancelar envío (solo mensajes 'pending' míos)
    const cancelSend = () => {
        if (!contextMsg || contextMsg.de !== user._id || contextMsg.estado !== 'pending') return;
        const key = contextMsg.clientId || contextMsg._id;
        canceledClientIdsRef.current.add(key);
        setResponses(prev => prev.filter(m => (m.clientId || m._id) !== key));
        setShowContext(false);
    };

    // ✅ Abrir menú contextual (ajustado para pending)
    const openContextMenu = (e, msg) => {
        e.preventDefault();
        const clickX = e?.clientX ?? e?.touches?.[0]?.clientX ?? window.innerWidth / 2;
        const clickY = e?.clientY ?? e?.touches?.[0]?.clientY ?? window.innerHeight / 2;
        const MENU_W = 220;
        const MENU_H = 260;
        let x = clickX, y = clickY;
        if (x + MENU_W > window.innerWidth - 8) x = window.innerWidth - MENU_W - 8;
        if (y + MENU_H > window.innerHeight - 8) y = window.innerHeight - MENU_H - 8;
        if (x < 8) x = 8;
        if (y < 8) y = 8;
        setContextPos({ x, y });
        setContextMsg(msg);
        setShowContext(true);
    };

    // ✅ Cerrar menú al click global
    useEffect(() => {
        const close = () => setShowContext(false);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    // ✅ Reglas de edición (≤10 min, propio, no transferencia)
    const canEdit = (msg) => {
        if (!msg || msg.de !== user._id) return false;
        if (msg.tipo === "transferencia" || msg.softDeleted) return false;
        const diffMin = (Date.now() - new Date(msg.createdAt).getTime()) / 60000;
        return diffMin <= 10;
    };

    // ✅ Editar (prompt simple para no tocar UI)
    const startEdit = async () => {
        if (!contextMsg) return;
        const nuevo = window.prompt("Editar mensaje:", contextMsg.texto || "");
        setShowContext(false);
        if (nuevo == null) return;
        const trimmed = nuevo.trim();
        if (!trimmed || trimmed === contextMsg.texto) return;
        try {
            await fetch(`${BACKEND_URL}/chat/message/${contextMsg._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nuevoTexto: trimmed })
            });
        } catch { }
    };

    // ✅ Copiar
    const copyMsg = async () => {
        if (!contextMsg) return;
        try { await navigator.clipboard.writeText(contextMsg.texto || ""); } catch { }
        setShowContext(false);
    };

    // ✅ Eliminar (para ambos) solo propios
    const deleteOne = async () => {
        if (!contextMsg) return;
        if (!window.confirm("Se eliminará para ambos. ¿Continuar?")) return;
        try {
            await fetch(`${BACKEND_URL}/chat/message/${contextMsg._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch { }
        setShowContext(false);
    };

    // ✅ Selección múltiple (infra mínima)
    const toggleMultiMode = () => {
        setMultiSelectMode(prev => !prev);
        setSelectedIds(new Set());
        setShowContext(false);
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

                {/* Lista de contactos - SCROLL SOLO AHI */}
                <div className="flex-1 overflow-y-auto">
                    {filteredContacts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p>{searchTerm ? "No se encontraron contactos" : "No hay contactos disponibles"}</p>
                        </div>
                    ) : (
                        filteredContacts.map(contact => {
                            const lastMsg = getLastMessageInfo(contact._id)
                            return (
                                <div
                                    key={contact._id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`p-3 md:p-4 border-b border-gray-200 cursor-pointer transition-colors ${selectedContact?._id === contact._id
                                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={contact.avatarCropped}
                                            alt="avatar"
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenImage(contact.avatarFull) // ✅ DIRECTO
                                            }}
                                            title="Click para ver imagen completa"
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
                            )
                        })
                    )}
                </div>
            </div>

            {/* AREA DE CHAT PRINCIPAL */}
            {selectedContact ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* HEADER DEL CHAT */}
                    <div className="bg-white border-b border-gray-300 px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 flex-shrink-0">
                        {/* ✅ Círculo: recortada */}
                        <img
                            src={selectedContact.avatarCropped}
                            alt="avatar"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleOpenImage(selectedContact.avatarFull)} // ✅ DIRECTO
                            title="Click para ver imagen completa"
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

                        {/* Acciones a la derecha del header */}
                        <div className="ml-auto flex items-center gap-2">
                            {multiSelectMode ? (
                                <>
                                    <span className="text-xs text-gray-600 mr-2">{selectedIds.size} seleccionados</span>
                                    <button
                                        type="button"
                                        disabled={!anySelected}
                                        onClick={deleteManyForMe}
                                        className={`px-3 py-1 rounded text-xs border ${anySelected ? "border-gray-300 hover:bg-gray-100" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}
                                        title="Ocultar para mí"
                                    >
                                        Eliminar para mí
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canDeleteBoth}
                                        onClick={deleteMany}
                                        className={`px-3 py-1 rounded text-xs border ${canDeleteBoth ? "border-red-300 text-red-600 hover:bg-red-50" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}
                                        title={hasOthersSelected ? "Solo puedes eliminar para ambos tus mensajes" : "Eliminar para ambos"}
                                    >
                                        Eliminar (ambos)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setMultiSelectMode(false); setSelectedIds(new Set()); }}
                                        className="px-3 py-1 rounded text-xs border border-gray-300 hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="hidden md:flex text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded flex-col">
                                        <div className="flex items-center gap-1">
                                            {/* <IoInformationCircleOutline className="shrink-0" /> */}
                                            <span>Los primeros mensajes pueden tardar en enviarse unos segundos debido a la activación del servicio</span>
                                        </div>
                                        <span>💡 A partir del cuarto mensaje se envían rápido, así que envía 3 mensajes cualesquiera para despertar el servicio!</span>
                                        <span>Ten paciencia... estamos usando un servicio gratis!</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMultiSelectMode(true)}
                                        className="p-2 hover:bg-gray-100 rounded"
                                        title="Seleccionar varios"
                                    >
                                        <IoEllipsisVertical size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* AREA DE MENSAJES */}
                    <div
                        className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 min-h-0"
                        ref={messagesContainerRef}
                        onContextMenu={(e) => { if (multiSelectMode) e.preventDefault(); }} // bloquear menú navegador en selección múltiple
                    >
                        {responses.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    {/* Centro: recortada */}
                                    <img
                                        src={selectedContact.avatarCropped}
                                        alt="avatar"
                                        className="w-20 h-20 rounded-full mx-auto mb-4 opacity-30 cursor-pointer"
                                        onClick={() => handleOpenImage(selectedContact.avatarFull)}
                                        title="Click para ver imagen completa"
                                    />
                                    <p className="text-gray-500 text-sm">Inicia la conversación</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {responses.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={`mb-4 flex ${msg.de === user._id ? "justify-end" : "justify-start"}`}
                                        data-mid={msg._id}
                                        data-from={msg.de}
                                        data-estado={msg.estado || "delivered"}
                                    >
                                        {msg.tipo === "transferencia" ? (
                                            // ✅ Añadir resaltado si es el objetivo
                                            <div className={`max-w-xs md:max-w-sm ${highlightedId === msg._id ? "ring-2 ring-amber-300 rounded-2xl" : ""}`}>
                                                {renderMensajeTransferencia(msg)}
                                            </div>
                                        ) : (
                                            <MessageBubble
                                                msg={msg}
                                                user={user}
                                                highlightedId={highlightedId}
                                                jumpToMessage={jumpToMessage}
                                                openContextMenu={openContextMenu}
                                                multiSelectMode={multiSelectMode}
                                                selectedIds={selectedIds}
                                                toggleSelect={toggleSelect}
                                            />
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

                    {/* AREA DE ENTRADA */}
                    <form onSubmit={handleSend} className="bg-white border-t border-gray-300 p-4 md:p-6 flex-shrink-0">
                        {/* Reply preview */}
                        {replyTarget && (
                            <div className="mb-2 flex items-start gap-2 bg-blue-50 border-l-4 border-blue-400 rounded px-3 py-2">
                                <div className="flex-1 text-xs text-gray-700">
                                    Respondiendo a: {replyTarget.texto.slice(0, 140)}{replyTarget.texto.length > 140 ? "…" : ""}
                                </div>
                                <button type="button" onClick={() => setReplyTarget(null)} className="text-xs text-blue-700 hover:underline">Cancelar</button>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={message}
                                onChange={e => {
                                    const val = e.target.value;
                                    setMessage(val);
                                    // Al escribir algo distinto de solo espacios vuelves a permitir un envío
                                    if (val.trim().length > 0) {
                                        allowSend === false && setAllowSend(true);
                                    }
                                }}
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

            {/* Modal imagen */}
            <ModalViewImage
                imageSrc={selectedImageUrl}
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                userName={selectedContact ? `${selectedContact.nombreDocente || selectedContact.nombre} ${selectedContact.apellidoDocente || selectedContact.apellido}` : ""}
            />

            {/* Context menu */}
            {showContext && contextMsg && (
                <div
                    style={{ top: contextPos.y, left: contextPos.x }}
                    className="fixed z-[9999] bg-white shadow-xl border border-gray-200 rounded-lg w-56 overflow-hidden text-sm"
                >
                    <ul className="flex flex-col">
                        {/* Si es PENDING: solo cancelar envío (si es mío) o cerrar */}
                        {contextMsg.estado === 'pending' ? (
                            <>
                                {contextMsg.de === user._id && (
                                    <li>
                                        <button
                                            onClick={cancelSend}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            Cancelar envío
                                        </button>
                                    </li>
                                )}
                                <li className="border-t border-gray-200">
                                    <button
                                        onClick={() => setShowContext(false)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Cerrar
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <button
                                        onClick={startReply}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <span className="text-blue-500">↩</span> Responder
                                    </button>
                                </li>
                                {canEdit(contextMsg) && (
                                    <li className="border-t border-gray-200">
                                        <button
                                            onClick={startEdit}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            Editar
                                        </button>
                                    </li>
                                )}
                                <li className="border-t border-gray-200">
                                    <button
                                        onClick={copyMsg}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        Copiar
                                    </button>
                                </li>

                                {/* Mis mensajes: eliminar para ambos + eliminar para mí */}
                                {contextMsg.de === user._id ? (
                                    <>
                                        <li className="border-t border-gray-200">
                                            <button
                                                onClick={deleteOne}
                                                className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                                            >
                                                Eliminar (para ambos)
                                            </button>
                                        </li>
                                        <li className="border-t border-gray-200">
                                            <button
                                                onClick={hideForMe}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                Eliminar para mí
                                            </button>
                                        </li>
                                        <li className="border-t border-gray-200">
                                            <button
                                                onClick={toggleMultiMode}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                {multiSelectMode ? "Cancelar múltiple" : "Seleccionar varios"}
                                            </button>
                                        </li>
                                        {multiSelectMode && selectedIds.size > 0 && (
                                            <li className="border-t border-gray-200">
                                                <button
                                                    onClick={deleteMany}
                                                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                                                >
                                                    Eliminar seleccionados ({selectedIds.size})
                                                </button>
                                            </li>
                                        )}
                                    </>
                                ) : (
                                    // Mensajes del otro: solo eliminar para mí
                                    <li className="border-t border-gray-200">
                                        <button
                                            onClick={hideForMe}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            Eliminar para mí
                                        </button>
                                    </li>
                                )}

                                <li className="border-t border-gray-200">
                                    <button
                                        onClick={() => setShowContext(false)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        ✕ Cerrar
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Chat;