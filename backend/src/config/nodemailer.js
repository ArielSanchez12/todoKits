import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToRegister = async(userMail,token)=>{
    let info = await transporter.sendMail({
    from: 'admin@kits.com',
    to: userMail,
    subject: "Registro de cuenta en KITSLABORATORIO",
    html: `
    <h1>KITSLABORATORIO-🐒🏇🏿</h1>
    <hr>
    <p>Hola, haz clic <a href="${process.env.URL_FRONTEND}confirm/${token}">aquí</a> para confirmar tu cuenta.</p>
    <hr>
    <footer>El equipo de la ESFOT te da la más cordial bienvenida.</footer>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}


const sendMailToRecoveryPassword = async(userMail,token)=>{
    let info = await transporter.sendMail({
    from: 'admin@kits.com',
    to: userMail,
    subject: "Correo para reestablecer tu contraseña",
    html: `
    <h1>KITSLABORATORIO-🐒🏇🏿</h1>
    <hr>
    <a href=${process.env.URL_FRONTEND}reset/${token}>Clic para reestablecer tu contraseña</a>
    <hr>
    <footer>El equipo de la ESFOT te da la más cordial bienvenida.</footer>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}

const sendMailToDocente = async(userMail,password)=>{
    let info = await transporter.sendMail({
    from: 'admin@kits.com',
    to: userMail,
    subject: "Correo de bienvenida - Docente de la ESFOT",
    html: `
    <h1>KITSLABORATORIO-🐒🏇🏿</h1>
    <hr>
    <p>Contraseña de acceso: ${password}</p>
    <a href=${process.env.URL_FRONTEND}login>Clic para iniciar sesión</a>
    <hr>
    <footer>El equipo de la ESFOT te da la más cordial bienvenida.</footer>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}

export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
    sendMailToPaciente
}