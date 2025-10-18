import jwt from 'jsonwebtoken';
import admin from '../models/admin.js';
import docente from '../models/docente.js';

const verificarTokenJWT = async (req, res, next) => {
    let token;

    // Agregar logs para depuración
    console.log("Headers recibidos:", req.headers);
    console.log("Authorization header:", req.headers.authorization);

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log("Token extraído:", token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token decodificado:", decoded);

            if (decoded.rol === "Admin" || decoded.rol === "Administrador") {
                req.adminEmailBDD = await admin.findById(decoded.id).select(
                    "-password -token -confirmEmail -createdAt -updatedAt -__v"
                );
                console.log("Admin encontrado:", req.adminEmailBDD ? "Sí" : "No");
                return next();
            } else if (decoded.rol === "Docente") {
                req.docenteBDD = await docente.findById(decoded.id).select(
                    "-passwordDocente -tokenDocente -confirmEmailDocente -createdAt -updatedAt -__v"
                );
                console.log("Docente encontrado:", req.docenteBDD ? "Sí" : "No");
                return next();
            }

            console.log("Rol desconocido:", decoded.rol);
            return res.status(404).json({ msg: "No autorizado, rol desconocido" });
        } catch (error) {
            console.log("Error al verificar token:", error);
            return res.status(401).json({ msg: "Token no válido" });
        }
    }

    if (!token) {
        console.log("Token no encontrado en headers");
        return res.status(401).json({ msg: "Token inexistente" });
    }

    next();
};

const crearTokenJWT = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
};

export { verificarTokenJWT, crearTokenJWT };