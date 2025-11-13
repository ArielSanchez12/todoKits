import jwt from 'jsonwebtoken';
import admin from '../models/admin.js';
import docente from '../models/docente.js';

const verificarTokenJWT = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.rol === "Admin" || decoded.rol === "Administrador") {
                req.adminEmailBDD = await admin.findById(decoded.id).select(
                    "-password -token -confirmEmail -createdAt -updatedAt -__v"
                );
                return next();
            } else if (decoded.rol === "Docente") {
                req.docenteBDD = await docente.findById(decoded.id).select(
                    "-passwordDocente -tokenDocente -confirmEmailDocente -createdAt -updatedAt -__v"
                );
                return next();
            }
            return res.status(404).json({ msg: "No autorizado, rol desconocido" });
        } catch (error) {
            return res.status(401).json({ msg: "Token no válido" });
        }
    }

    if (!token) {
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