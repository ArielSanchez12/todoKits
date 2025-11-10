import { sendMailToRegister, sendMailToRecoveryPassword, sendMailToChangeEmail, sendMailToDocente, sendMailToChangeEmailDocente } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/jwt.js"
import admin from "../models/admin.js"
import mongoose from "mongoose"
import docente from "../models/docente.js"
import { v2 as cloudinary } from 'cloudinary'



const registro = async (req, res) => {
    try {
        // ahora usamos req.validated (viene del middleware)
        const { nombre, apellido, celular, email, password } = req.validated || req.body;

        // comprobacion de email existente
        const adminExistente = await admin.findOne({ email });
        const docenteExistente = await docente.findOne({ emailDocente: email });
        if (adminExistente || docenteExistente) {
            return res.status(400).json({ msg: "El correo ya está registrado en el sistema" });
        }

        const nuevoAdmin = new admin({ nombre, apellido, celular, email });
        nuevoAdmin.password = await nuevoAdmin.encryptPassword(password);
        const token = nuevoAdmin.createToken();

        await nuevoAdmin.save();
        await sendMailToRegister(email, token);
        res.status(200).json({ msg: "Revisa tu correo electrónico" });
    } catch (error) {
        console.error("registro error:", error);
        if (error?.name === "ValidationError") return res.status(400).json({ msg: error.message });
        res.status(500).json({ msg: "Error en el servidor" });
    }
}

const confirmarMail = async (req, res) => {
    if (!(req.params.token)) return res.status(400).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    const adminEmailBDD = await admin.findOne({ token: req.params.token })
    if (!adminEmailBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" })
    adminEmailBDD.token = null
    adminEmailBDD.confirmEmail = true
    await adminEmailBDD.save()
    res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" });
}

//Etapa 1
// const recuperarPassword = async (req, res) => {
//     try {
//         // Datos ya validados por Zod (req.validated)
//         const { email } = req.validated || req.body;

//         const adminEmailBDD = await admin.findOne({ email });
//         if (!adminEmailBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" });

//         const token = adminEmailBDD.createToken();
//         adminEmailBDD.token = token;
//         await adminEmailBDD.save();

//         // Enviar el correo con el token
//         await sendMailToRecoveryPassword(email, token);

//         res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
//     } catch (error) {
//         console.error("recuperarPassword error:", error);
//         res.status(500).json({ msg: "Error en el servidor" });
//     }
// }

// //Etapa 2
// const comprobarTokenPassword = async (req, res) => {
//     const { token } = req.params
//     const adminEmailBDD = await admin.findOne({ token })
//     if (adminEmailBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })

//     await adminEmailBDD.save()

//     res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" })
// }

// //Etapa 3
// const crearNuevoPassword = async (req, res) => {
//     try {
//         // Datos ya validados por Zod (incluye validación de coincidencia)
//         const { password, confirmpassword } = req.validated || req.body;
//         const { token } = req.params;

//         if (!token) return res.status(400).json({ msg: "Token inválido" });

//         const adminEmailBDD = await admin.findOne({ token });
//         if (!adminEmailBDD) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
//         if (adminEmailBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, token inválido o expirado" });

//         adminEmailBDD.token = null;
//         adminEmailBDD.password = await adminEmailBDD.encryptPassword(password);
//         await adminEmailBDD.save();

//         res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
//     } catch (error) {
//         console.error("crearNuevoPassword error:", error);
//         res.status(500).json({ msg: "Error en el servidor" });
//     }
// }

// const login = async (req, res) => {
//     //Obtencion de datos
//     const { email, password } = req.body

//     //Validacion de datos
//     if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Todos los campos son obligatorios" })

//     //Comprobacion de email/password
//     const adminEmailBDD = await admin.findOne({ email }).select("-status -__v -token -createdAt -updatedAt")
//     if (adminEmailBDD?.confirmEmail === false) return res.status(401).json({ msg: "Lo sentimos, debes verificar tu cuenta antes de iniciar sesión" })
//     if (!adminEmailBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" })

//     const verificarPassword = await adminEmailBDD.matchPassword(password)
//     if (!verificarPassword) return res.status(401).json({ msg: "Lo sentimos, el password es incorrecto" })

//     //Desestructurar solo los campos permitidos (sin 'direccion')
//     const { nombre, apellido, celular, _id, rol, email: emailAd } = adminEmailBDD;
//     const tokenJWT = crearTokenJWT(adminEmailBDD._id, adminEmailBDD.rol)

//     //Aca mandamos el objeto que desestructuramos arriba
//     res.status(200).json({
//         token: tokenJWT,
//         rol,
//         usuario: {
//             _id,
//             nombre,
//             apellido,
//             celular,
//             emailAd,
//             rol,
//             avatar: adminEmailBDD.avatar || null
//         }
//     });
// }

const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.adminEmailBDD //Quita todo lo que esta antes de ... y lo demas lo guarda en datosPerfil para almacenarlos en la respuesta req.admin
    res.status(200).json(datosPerfil)
}

//Confirmación de nuevo email (token enviado al nuevo correo)
const confirmarNuevoEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) return res.status(400).json({ msg: "Token inválido" });

        const adminEmailBDD = await admin.findOne({ token, pendingEmail: { $exists: true } });
        if (!adminEmailBDD) return res.status(404).json({ msg: "Token inválido o expirado" });

        // aplicar cambio de email
        adminEmailBDD.email = adminEmailBDD.pendingEmail;
        adminEmailBDD.pendingEmail = null;
        adminEmailBDD.token = null;
        // opcional: marcar confirmEmail true si deseas
        adminEmailBDD.confirmEmail = true;
        await adminEmailBDD.save();

        return res.status(200).json({ msg: "Correo confirmado y actualizado correctamente" });
    } catch (error) {
        console.error("confirmarNuevoEmail error:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.validated || req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
        }

        const adminEmailBDD = await admin.findById(id);
        if (!adminEmailBDD) {
            return res.status(404).json({ msg: `Lo sentimos, no existe el usuario ${id}` });
        }

        // Si cambian email, iniciar flujo de verificación
        if (data.email && data.email !== adminEmailBDD.email) {
            const adminExistente = await admin.findOne({ email: data.email });
            const docenteExistente = await docente.findOne({ emailDocente: data.email });

            if (adminExistente || docenteExistente) {
                return res.status(400).json({ msg: "El correo ya está registrado en el sistema" });
            }

            const token = adminEmailBDD.createToken();
            adminEmailBDD.pendingEmail = data.email;
            adminEmailBDD.token = token;

            if (data.nombre) adminEmailBDD.nombre = data.nombre;
            if (data.apellido) adminEmailBDD.apellido = data.apellido;
            if (data.celular) adminEmailBDD.celular = data.celular;

            await adminEmailBDD.save();
            await sendMailToChangeEmail(data.email, token);
            return res.status(200).json({ msg: "Se envió un correo electrónico de confirmación al nuevo correo. El cambio se aplicará cuando lo confirmes." });
        }

        // Actualizar campos básicos
        if (data.nombre) adminEmailBDD.nombre = data.nombre;
        if (data.apellido) adminEmailBDD.apellido = data.apellido;
        if (data.celular) adminEmailBDD.celular = data.celular;

        // ✅ ELIMINAR AVATARES
        if (data.removeAvatar === true || data.removeAvatar === 'true') {
            console.log("🗑️ ELIMINANDO AVATARES - ENTRANDO AL IF");

            // Eliminar de Cloudinary si existen
            if (adminEmailBDD.avatar) {
                try {
                    const publicId = adminEmailBDD.avatar.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`Admins/${publicId}`);
                } catch (err) {
                    console.warn("No se pudo eliminar avatar de Cloudinary:", err);
                }
            }
            if (adminEmailBDD.avatarOriginal) {
                try {
                    const publicId = adminEmailBDD.avatarOriginal.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`Admins/originals/${publicId}`);
                } catch (err) {
                    console.warn("No se pudo eliminar avatarOriginal de Cloudinary:", err);
                }
            }

            adminEmailBDD.avatar = null;
            adminEmailBDD.avatarOriginal = null;
            await adminEmailBDD.save();

            console.log("✅ Avatares eliminados");
            return res.status(200).json({
                msg: "Foto de perfil eliminada correctamente",
                admin: {
                    _id: adminEmailBDD._id,
                    nombre: adminEmailBDD.nombre,
                    apellido: adminEmailBDD.apellido,
                    email: adminEmailBDD.email,
                    celular: adminEmailBDD.celular,
                    avatar: null,
                    avatarOriginal: null
                }
            });
        }

        // ✅ SUBIR IMAGEN RECORTADA + ORIGINAL
        if (req.files?.avatar || req.files?.avatarOriginal) {
            console.log("📤 SUBIENDO IMÁGENES - ENTRANDO AL IF");

            try {
                // ✅ Subir imagen RECORTADA (para el círculo)
                if (req.files?.avatar) {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'Admins' },
                        async (error, result) => {
                            if (error) {
                                console.error("❌ Error al subir avatar recortado:", error);
                                return res.status(500).json({ msg: 'Error al subir imagen recortada', error });
                            }
                            adminEmailBDD.avatar = result.secure_url;
                            console.log("✅ Avatar recortado subido:", result.secure_url);

                            // ✅ Subir imagen ORIGINAL (para el modal)
                            if (req.files?.avatarOriginal) {
                                const uploadStreamOriginal = cloudinary.uploader.upload_stream(
                                    { folder: 'Admins/originals' },
                                    async (errorOriginal, resultOriginal) => {
                                        if (errorOriginal) {
                                            console.error("❌ Error al subir avatar original:", errorOriginal);
                                            return res.status(500).json({ msg: 'Error al subir imagen original', errorOriginal });
                                        }
                                        adminEmailBDD.avatarOriginal = resultOriginal.secure_url;
                                        console.log("✅ Avatar original subido:", resultOriginal.secure_url);

                                        await adminEmailBDD.save();
                                        return res.status(200).json({
                                            msg: "Fotos de perfil actualizadas correctamente",
                                            admin: {
                                                _id: adminEmailBDD._id,
                                                nombre: adminEmailBDD.nombre,
                                                apellido: adminEmailBDD.apellido,
                                                email: adminEmailBDD.email,
                                                celular: adminEmailBDD.celular,
                                                avatar: adminEmailBDD.avatar,
                                                avatarOriginal: adminEmailBDD.avatarOriginal
                                            }
                                        });
                                    }
                                );
                                uploadStreamOriginal.end(req.files.avatarOriginal.data);
                            } else {
                                await adminEmailBDD.save();
                                return res.status(200).json({
                                    msg: "Foto de perfil actualizada correctamente",
                                    admin: {
                                        _id: adminEmailBDD._id,
                                        nombre: adminEmailBDD.nombre,
                                        apellido: adminEmailBDD.apellido,
                                        email: adminEmailBDD.email,
                                        celular: adminEmailBDD.celular,
                                        avatar: adminEmailBDD.avatar,
                                        avatarOriginal: adminEmailBDD.avatarOriginal
                                    }
                                });
                            }
                        }
                    );
                    uploadStream.end(req.files.avatar.data);
                    return;
                }
            } catch (err) {
                console.error("❌ Error al procesar imágenes:", err);
                return res.status(500).json({ msg: 'Error al procesar imágenes', err });
            }
        }

        console.log("📝 ACTUALIZANDO SOLO OTROS CAMPOS");
        await adminEmailBDD.save();
        return res.status(200).json({
            msg: "Perfil actualizado correctamente",
            admin: {
                _id: adminEmailBDD._id,
                nombre: adminEmailBDD.nombre,
                apellido: adminEmailBDD.apellido,
                email: adminEmailBDD.email,
                celular: adminEmailBDD.celular,
                avatar: adminEmailBDD.avatar,
                avatarOriginal: adminEmailBDD.avatarOriginal
            }
        });
    } catch (error) {
        console.error("actualizarPerfil error:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};

const actualizarPassword = async (req, res) => {
    try {
        // Datos validados por Zod (incluye confirmpassword y que password sea diferente)
        const { passwordactual, passwordnuevo, confirmpassword } = req.validated || {};

        // Verificar token JWT y obtener admin
        const adminEmailBDD = await admin.findById(req.adminEmailBDD._id);
        if (!adminEmailBDD) return res.status(404).json({ msg: "Administrador no encontrado" });

        // Verificar contraseña actual
        const verificarPassword = await adminEmailBDD.matchPassword(passwordactual);
        if (!verificarPassword) return res.status(400).json({ msg: "La contraseña actual es incorrecta" });

        // Aquí Zod ya verificó que passwordnuevo !== passwordactual
        adminEmailBDD.password = await adminEmailBDD.encryptPassword(passwordnuevo);
        await adminEmailBDD.save();
        return res.status(200).json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("actualizarPassword error:", error);
        return res.status(500).json({ msg: "Error del servidor" });
    }
};

const registrarDocente = async (req, res) => {
    try {
        // Datos ya validados por Zod
        const datos = req.validated || req.body;
        const { emailDocente } = datos;

        const docenteExistente = await docente.findOne({ emailDocente });
        const adminExistente = await admin.findOne({ email: emailDocente });
        if (docenteExistente || adminExistente) {
            return res.status(400).json({ msg: "El correo ya está registrado en el sistema" });
        }

        const password = Math.random().toString(36).toUpperCase().slice(2, 5);

        const nuevoDocente = new docente({
            ...datos, // Usar los datos validados con las transformaciones
            passwordDocente: await docente.prototype.encryptPassword("KITS" + password),
            admin: req.adminEmailBDD._id
        });

        // Generar token para confirmación de email
        const token = nuevoDocente.createToken();

        // Procesamiento de imagen si existe
        if (req.files?.imagen) {
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'Docentes' },
                    (error, result) => {
                        if (error) return reject(error);
                        nuevoDocente.avatarDocente = result.secure_url;
                        resolve();
                    }
                );
                uploadStream.end(req.files.imagen.data);
            });
        }

        await nuevoDocente.save();
        await sendMailToDocente(emailDocente, "KITS" + password, token);
        res.status(201).json({ msg: "Registro exitoso del docente" });
    } catch (error) {
        console.error("Error al registrar docente:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

const listarDocentes = async (req, res) => {
    try {
        if (req.docenteBDD?.rolDocente === "Docente") {
            // Si es un docente consultando su propio perfil
            const docentes = await docente
                .find({
                    _id: req.docenteBDD._id,
                    confirmEmailDocente: true  // Los docentes podran consultar su perfil solo si confirmaron su email
                })
                .select("-passwordDocente -createdAt -updatedAt -__v")
                .populate('admin', '_id nombre apellido');
            res.status(200).json(docentes);
        } else {
            // Si es un admin listando todos sus docentes
            const docentes = await docente
                .find({
                    statusDocente: true,
                    confirmEmailDocente: true,  // Los docentes podran ser listados en la pantalla del admin solo si confirmaron su email
                    admin: req.adminEmailBDD._id
                })
                .select("-passwordDocente -createdAt -updatedAt -__v")
                .populate('admin', '_id nombre apellido');
            res.status(200).json(docentes);
        }
    } catch (error) {
        console.error("Error al listar docentes:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

const eliminarDocente = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
        }

        const docenteEliminado = await docente.findByIdAndDelete(id);
        if (!docenteEliminado) {
            return res.status(404).json({ msg: "Docente no encontrado" });
        }

        res.status(200).json({ msg: "Docente eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar docente:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

const actualizarDocente = async (req, res) => {
    try {
        const { id } = req.params;
        // Datos ya validados por Zod
        const datosDocente = req.validated || req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
        }

        // Busca el docente actual
        const docenteActual = await docente.findById(id);
        if (!docenteActual) {
            return res.status(404).json({ msg: "Docente no encontrado" });
        }

        // Detecta si el correo fue cambiado
        const nuevoCorreo = datosDocente.emailDocente;
        const correoAnterior = docenteActual.emailDocente;

        // Si el correo fue cambiado
        if (nuevoCorreo && nuevoCorreo !== correoAnterior) {
            // Verificar si el nuevo correo ya está en uso
            const docenteExistente = await docente.findOne({ emailDocente: nuevoCorreo });
            const adminExistente = await admin.findOne({ email: nuevoCorreo });

            if (docenteExistente || adminExistente) {
                return res.status(400).json({ msg: "El email ya está en uso en el sistema" });
            }

            // Generar token para confirmar cambio de email
            const token = docenteActual.createToken();

            // Guardar el email pendiente de confirmación
            docenteActual.pendingEmailDocente = nuevoCorreo;
            docenteActual.token = token;
            await docenteActual.save();

            // Enviar email de confirmación
            await sendMailToChangeEmailDocente(nuevoCorreo, token);

            // Quitar el email de los datos a actualizar para evitar que se cambie directamente
            delete datosDocente.emailDocente;

            // Actualizar otros campos
            if (datosDocente.nombreDocente) docenteActual.nombreDocente = datosDocente.nombreDocente;
            if (datosDocente.apellidoDocente) docenteActual.apellidoDocente = datosDocente.apellidoDocente;
            if (datosDocente.celularDocente) docenteActual.celularDocente = datosDocente.celularDocente;
        }

        // Procesa imagen si es necesario
        if (req.files?.imagen) {
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'Docentes' },
                    (error, result) => {
                        if (error) return reject(error);
                        datosDocente.avatarDocente = result.secure_url;
                        resolve();
                    }
                );
                uploadStream.end(req.files.imagen.data);
            });
        }

        // Actualiza el docente
        const docenteActualizado = await docente.findByIdAndUpdate(id, datosDocente, { new: true });

        res.status(200).json({
            msg: nuevoCorreo && nuevoCorreo !== correoAnterior ?
                "Se ha enviado un correo de confirmación para actualizar tu email" :
                "Actualización exitosa del docente"
        });
    } catch (error) {
        console.error("Error al actualizar docente:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

const detalleDocente = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
        }

        const docentes = await docente.findById(id)
            .select("-passwordDocente -createdAt -updatedAt -__v")
            .populate('admin', '_id nombre apellido');

        if (!docentes) {
            return res.status(404).json({ msg: "Docente no encontrado" });
        }

        res.status(200).json({
            docentes
        });
    } catch (error) {
        console.error("Error al obtener detalle de docente:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export {
    registro,
    confirmarMail,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    confirmarNuevoEmail,
    registrarDocente,
    listarDocentes,
    eliminarDocente,
    actualizarDocente,
    detalleDocente
}