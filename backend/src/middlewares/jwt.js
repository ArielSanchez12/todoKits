import jwt from 'jsonwebtoken';
import admin from '../models/admin.js';

const crearTokenJWT = (id, rol) => {
    return jwt.sign({id,rol},process.env.JWT_SECRET,{expiresIn:"1d"})
}

const verificarTokenJWT = async (req,res,next) => {
    const {authorization} = req.headers
    if(!authorization) return res.status(401).json({msg:"Token no proporcionado o no válido"})
    
    try{
        const token = authorization.split(' ')[1]
        const{id,rol} = jwt.verify(token,process.env.JWT_SECRET)
        if(rol == "Administrador"){
            req.adminEmailBDD = await admin.findById(id).lean().select("-password")
            console.log(admin)
            next()
        }
    } catch(error) {
        res.status(401).json({msg:"Token invalido o experiado"})
    }
    
    
}



export{
    crearTokenJWT,
    verificarTokenJWT
}