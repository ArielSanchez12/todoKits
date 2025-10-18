import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToRegister = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let info = await transporter.sendMail({
        priority: 'high',
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
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
}


const sendMailToRecoveryPassword = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let info = await transporter.sendMail({
        priority: 'high',
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
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
}

export const sendMailToDocente = async (userMail, password, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@kits.com',
        to: userMail,
        subject: "KITS - Bienvenido al sistema",
        text: "Has sido registrado en el sistema KITS",
        html: `
            <p>Hola, has sido registrado en el sistema KITS.</p>
            <p>Tu contraseña temporal es: <strong>${password}</strong></p>
            <p>Para confirmar tu cuenta, haz clic en el siguiente enlace:</p>
            <a href="${process.env.URL_FRONTEND}confirm-docente/${token}">Confirmar cuenta</a>
            <p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
};

export const sendMailToChangeEmail = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@kits.com',
        to: userMail,
        subject: "KITS - Confirma tu nuevo correo electrónico",
        text: "Confirma tu nuevo correo para KITS",
        html: `<p>Hola, has solicitado cambiar tu correo electrónico</p>
            <p>Para confirmar este cambio, haz clic en el siguiente enlace:</p>
            <a href="${process.env.URL_FRONTEND}confirm-email/${token}">Confirmar cambio de correo</a>
            <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>`
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
};

export const sendMailToChangeEmailDocente = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@kits.com',
        to: userMail,
        subject: "KITS - Confirma tu nuevo correo electrónico",
        text: "Confirma tu nuevo correo para KITS",
        html: `<p>Hola, has solicitado cambiar tu correo electrónico</p>
            <p>Para confirmar este cambio, haz clic en el siguiente enlace:</p>
            <a href="${process.env.URL_FRONTEND}confirm-email-docente/${token}">Confirmar cambio de correo</a>
            <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>`
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
};

export const sendMailToRecoveryPasswordDocente = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@kits.com',
        to: userMail,
        subject: "KITS - Recupera tu contraseña",
        text: "Recupera tu contraseña para KITS",
        html: `<p>Has solicitado recuperar tu contraseña</p>
            <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
            <a href="${process.env.URL_FRONTEND}reset-docente/${token}">Recuperar contraseña</a>
            <p>Si no solicitaste recuperar tu contraseña, por favor ignora este mensaje.</p>`
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
};

export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
}