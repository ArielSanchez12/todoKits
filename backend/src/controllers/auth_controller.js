import admin from "../models/admin.js";
import docente from "../models/docente.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";
import { crearTokenJWT } from "../middlewares/jwt.js";

// ✅ NUEVO: Login unificado para admin y docente
const loginUniversal = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos vacíos
        if (!email || !password) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        console.log("🔍 Intentando login con email:", email);

        // ✅ PASO 1: Buscar como administrador
        let usuario = await admin.findOne({ email }).select("-status -__v -token -createdAt -updatedAt");
        let tipoUsuario = 'admin';
        let campoEmail = 'email';
        let campoPassword = 'password';

        console.log("👨‍💼 ¿Es admin?", !!usuario);

        // ✅ PASO 2: Si no es admin, buscar como docente
        if (!usuario) {
            usuario = await docente.findOne({ emailDocente: email });
            tipoUsuario = 'docente';
            campoEmail = 'emailDocente';
            campoPassword = 'passwordDocente';
            console.log("👨‍🏫 ¿Es docente?", !!usuario);
        }

        // ✅ PASO 3: Si no existe en ninguna colección
        if (!usuario) {
            return res.status(404).json({ msg: "Credenciales incorrectas o usuario no registrado" });
        }

        // ✅ PASO 4: Verificar confirmación de email (solo para admin)
        if (tipoUsuario === 'admin' && usuario.confirmEmail === false) {
            return res.status(401).json({ msg: "Lo sentimos, debes verificar tu cuenta antes de iniciar sesión" });
        }

        if (tipoUsuario === 'docente' && usuario.confirmEmailDocente === false) {
            return res.status(401).json({ msg: "Lo sentimos, debes verificar tu cuenta antes de iniciar sesión" });
        }

        // ✅ PASO 5: Verificar contraseña
        const verificarPassword = await usuario.matchPassword(password);
        if (!verificarPassword) {
            return res.status(401).json({ msg: "Credenciales incorrectas o usuario no registrado" });
        }

        // ✅ PASO 6: Generar token JWT
        const rol = tipoUsuario === 'admin' ? usuario.rol : usuario.rolDocente;
        const tokenJWT = crearTokenJWT(usuario._id, rol);

        console.log("✅ Login exitoso como:", tipoUsuario);

        // ✅ PASO 7: Preparar respuesta según tipo de usuario
        if (tipoUsuario === 'admin') {
            return res.status(200).json({
                token: tokenJWT,
                rol: usuario.rol,
                usuario: {
                    _id: usuario._id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    celular: usuario.celular,
                    email: usuario.email,
                    avatar: usuario.avatar || null,
                    rol: usuario.rol
                }
            });
        } else {
            // Respuesta para docente
            return res.status(200).json({
                token: tokenJWT,
                rol: usuario.rolDocente,
                usuario: {
                    _id: usuario._id,
                    nombreDocente: usuario.nombreDocente,
                    apellidoDocente: usuario.apellidoDocente,
                    celularDocente: usuario.celularDocente,
                    emailDocente: usuario.emailDocente,
                    avatarDocente: usuario.avatarDocente || null,
                    rolDocente: usuario.rolDocente,
                    admin: usuario.admin
                }
            });
        }
    } catch (error) {
        console.error("Error en loginUniversal:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Recuperación universal (busca en ambas colecciones)
const recuperarPasswordUniversal = async (req, res) => {
    try {
        const { email } = req.validated || req.body;

        console.log("Buscando email:", email);

        // Declarar variables FUERA del if
        let usuario;
        let tipoUsuario = "admin";
        let emailDestino = email;

        // Buscar primero en administradores
        usuario = await admin.findOne({ email });
        console.log("Admin encontrado:", !!usuario);

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ emailDocente: email });
            tipoUsuario = "docente";
            
            if (usuario) {
                emailDestino = usuario.emailDocente;
            }
            
            console.log("Docente encontrado:", !!usuario);
        }

        // Si no existe en ninguna colección
        if (!usuario) {
            return res.status(404).json({ msg: "Correo incorrecto o usuario no registrado" });
        }

        // Crear token
        const token = usuario.createToken();

        // Guardar token según el tipo de usuario
        if (tipoUsuario === "admin") {
            usuario.token = token;
        } else {
            usuario.tokenDocente = token;
        }

        await usuario.save();
        
        console.log(`Enviando email a ${emailDestino} (${tipoUsuario})`);

        // Enviar correo con la función adecuada según el tipo
        await sendMailToRecoveryPassword(emailDestino, token);

        res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
    } catch (error) {
        console.error("RecuperarPasswordUniversal error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Comprobar token universal
const comprobarTokenPasswordUniversal = async (req, res) => {
    try {
        const { token } = req.params;

        console.log("Verificando token:", token);

        // Buscar en administradores
        let usuario = await admin.findOne({ token });
        console.log("Admin con token encontrado:", !!usuario);

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ tokenDocente: token });
            console.log("Docente con token encontrado:", !!usuario);
        }

        if (!usuario) {
            return res.status(404).json({ msg: "Token inválido o expirado" });
        }

        res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nueva contraseña" });
    } catch (error) {
        console.error("ComprobarTokenPasswordUniversal error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Crear nueva contraseña universal
const crearNuevoPasswordUniversal = async (req, res) => {
    try {
        const { password } = req.validated || req.body;
        const { token } = req.params;

        console.log("Creando nueva contraseña con token:", token);

        if (!token) return res.status(400).json({ msg: "Token inválido" });

        // Buscar en administradores
        let usuario = await admin.findOne({ token });
        let tipoUsuario = "admin";

        console.log("Admin encontrado:", !!usuario);

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ tokenDocente: token });
            tipoUsuario = "docente";
            console.log("Docente encontrado:", !!usuario);
        }

        if (!usuario) {
            return res.status(404).json({ msg: "Token inválido o expirado" });
        }

        // Actualizar contraseña según el tipo de usuario
        if (tipoUsuario === "admin") {
            usuario.token = null;
            usuario.password = await usuario.encryptPassword(password);
        } else {
            usuario.tokenDocente = null;
            usuario.passwordDocente = await usuario.encryptPassword(password);
        }

        await usuario.save();

        console.log(`Contraseña actualizada para ${tipoUsuario}`);

        res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nueva contraseña" });
    } catch (error) {
        console.error("crearNuevoPasswordUniversal error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

const confirmarCambioEmailUniversal = async (req, res) => {
    try {
        const { token } = req.params;

        console.log("Verificando token de cambio de email:", token);

        if (!token) {
            return res.status(400).json({ msg: "Token inválido" });
        }

        // Buscar en administradores
        let usuario = await admin.findOne({ 
            token, 
            pendingEmail: { $exists: true, $ne: null } 
        });
        let tipoUsuario = "admin";

        console.log("Admin con token de cambio encontrado:", !!usuario);

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ 
                tokenDocente: token, 
                pendingEmailDocente: { $exists: true, $ne: null } 
            });
            tipoUsuario = "docente";
            console.log("Docente con token de cambio encontrado:", !!usuario);
        }

        if (!usuario) {
            return res.status(404).json({ msg: "Token inválido o expirado" });
        }

        // Aplicar cambio de email según el tipo de usuario
        if (tipoUsuario === "admin") {
            usuario.email = usuario.pendingEmail;
            usuario.pendingEmail = null;
            usuario.token = null;
        } else {
            usuario.emailDocente = usuario.pendingEmailDocente;
            usuario.pendingEmailDocente = null;
            usuario.tokenDocente = null;
        }

        await usuario.save();

        console.log(`Email actualizado para ${tipoUsuario}`);

        res.status(200).json({ msg: "Email confirmado y actualizado correctamente" });
    } catch (error) {
        console.error("ConfirmarCambioEmailUniversal error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export {
    loginUniversal,
    recuperarPasswordUniversal,
    comprobarTokenPasswordUniversal,
    crearNuevoPasswordUniversal,
    confirmarCambioEmailUniversal
};