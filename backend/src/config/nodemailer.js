import nodemailer from "nodemailer"


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

export default transporter;

// Esta es la plantilla
function getEmailTemplate({
    logo = "https://res.cloudinary.com/dpax93l6a/image/upload/v1760893675/ChatGPT_Image_19_oct_2025_12_07_46_p.m._tueqmu.png",
    title = "",
    message = "",
    buttonUrl = "#",
    buttonText = "CONFIRMAR CORREO ELECTRÓNICO",
    footer = "El equipo de la LabTRACK - ESFOT te da la más cordial bienvenida.<br>© 2025 LabTRACK - ESFOT Todos los derechos reservados."
}) {
    return `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;border:1px solid #eee;padding:32px;background:#fff;">
        <div style="text-align:center;">
            <img src="${logo}" alt="Logo" style="width:210px;margin-bottom:20px;background:#fff;" draggable="false" />
        </div>
        <div style="text-align:center;">
            <h2 style="color:#222;margin-bottom:16px;">${title}</h2>
        </div>
        <p style="font-size:16px;color:#333;">${message}</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="${buttonUrl}" style="background:#007bff;color:#fff;padding:14px 28px;text-decoration:none;font-weight:bold;border-radius:6px;display:inline-block;font-size:16px;">
                ${buttonText}
            </a>
        </div>
        <hr>
        <footer style="font-size:13px;color:#888;text-align:center;">${footer}</footer>
    </div>
    `;
}

//se envia el correo al registrarme desde la pagina de register, SI SIRVE
const sendMailToRegister = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    
    let html = getEmailTemplate({
        title: "CONFIRMAR CUENTA",
        message: `Hola ${userMail},<br> <br>Tu cuenta acaba de ser creada. Haz clic en el boton para confirmar tu correo electrónico e iniciar sesión.`,
        buttonUrl: `${process.env.URL_FRONTEND}confirm/${token}`,
        buttonText: "CONFIRMAR CUENTA",
    });
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@labtrackesfot.com',
        to: userMail,
        subject: "LabTRACK - ESOFT",
        html
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
}

// recuperar contraseña tanto para admin y docente desde olvidaste tu contraseña, SI SIRVE
const sendMailToRecoveryPassword = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let html = getEmailTemplate({
        title: "RESTABLECER CONTRASEÑA",
        message: `Hola ${userMail},<br> <br>Has solicitado recuperar la contraseña de tu cuenta. Haz clic en el botón a continuación para crear una nueva contraseña.`,
        buttonUrl: `${process.env.URL_FRONTEND}reset/${token}`,
        buttonText: "RESTABLECER CONTRASEÑA",
        footer: "Si no solicitaste este cambio, ignora este correo.<br>© 2025 LabTRACK - ESFOT Todos los derechos reservados."
    });
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@labtrackesfot.com',
        to: userMail,
        subject: "LabTRACK - ESFOT",
        html
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
}

// registrar docentes (desde el administrador en el sidebar CREAR) SI SIRVE
export const sendMailToDocente = async (userMail, password, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let html = getEmailTemplate({
        title: "BIENVENIDO A LabTRACK - ESFOT",
        message: `Hola ${userMail},<br><br>Has sido registrado en el sistema de LabTRACK - ESFOT como docente. Para confirmar tu cuenta, pulsa en el boton y usa tu contraseña temporal para iniciar sesión.
        <div style="background-color:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
            <p style="font-size:12px;color:#666;margin:0 0 10px 0;text-transform:uppercase;letter-spacing:1px;">Tu contraseña temporal es:</p>
            <p style="font-size:28px;font-weight:bold;color:#222;margin:0;letter-spacing:4px;font-family:'Courier New',monospace;">${password}</p>
            <p style="font-size:12px;color:#666;margin:0 0 10px 0;text-transform:uppercase;letter-spacing:1px;">Te recomendamos cambiarla luego de iniciar sesión</p>
        </div>`,
        buttonUrl: `${process.env.URL_FRONTEND}confirm-docente/${token}`,
        buttonText: "CONFIRMAR CUENTA",
        footer: "Equipo de LabTRACK - ESFOT<br>Si no solicitaste esta cuenta, ignora este correo<br>© 2025 LabTRACK - ESFOT Todos los derechos reservados."
    });
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@labtrackesfot.com',
        to: userMail,
        subject: "LabTRACK - ESFOT",
        html
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
};

// cambio de correo para el administrador desde el formProfile, SI SIRVE (TANTO PARA ADMIN Y DOCENTE EN TODOS LOS FORMS Y FORMAS DE CAMBIAR EL EMAIL PORQUE USAN LA LOGICA UNIVERSAL DE AUTH)
export const sendMailToChangeEmail = async (userMail, token) => {
    console.log("Enviando email a:", userMail);
    const startTime = Date.now();
    let html = getEmailTemplate({
        title: "CONFIRMAR CAMBIO DE CORREO ELECTRÓNICO",
        message: `Hola ${userMail},<br> <br>Has solicitado cambiar tu correo electrónico en LabTRACK - ESFOT. Haz clic en el botón para confirmar este cambio.`,
        buttonUrl: `${process.env.URL_FRONTEND}confirm-email/${token}`,
        buttonText: "CONFIRMAR CAMBIO",
        footer: "Si no solicitaste este cambio, ignora este correo.<br>© 2025 LabTRACK - ESFOT Todos los derechos reservados."
    });
    let info = await transporter.sendMail({
        priority: 'high',
        from: 'admin@labtrackesfot.com',
        to: userMail,
        subject: "LabTRACK - ESFOT",
        html
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
};

// cambio de correo para el docente (tanto desde el administrador como desde su propio perfil)
// export const sendMailToChangeEmailDocente = async (userMail, token) => {
//     console.log("Enviando email a:", userMail);
//     const startTime = Date.now();
//     let html = getEmailTemplate({
//         title: "Confirma tu nuevo correo electrónico",
//         message: `Hola ${userMail},<br> <br>Has solicitado cambiar tu correo electrónico en LabTRACK - ESFOT. Haz clic en el botón para confirmar este cambioXXXX.`,
//         buttonUrl: `${process.env.URL_FRONTEND}confirm-email-change/${token}`,
//         buttonText: "CONFIRMAR CAMBIO DE CORREO",
//         footer: "Si no solicitaste este cambio, ignora este correo.<br>© 2025 LabTRACK - ESFOT Todos los derechos reservados."
//     });
//     let info = await transporter.sendMail({
//         priority: 'high',
//         from: 'admin@labtrackesfot.com',
//         to: userMail,
//         subject: "Confirma tu nuevo correo en LabTRACK - ESFOT",
//         html
//     });
//     console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
//     console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
// };

// recuperar contraseña (docente olvidaste tu contraseña)
// export const sendMailToRecoveryPasswordDocente = async (userMail, token) => {
//     console.log("Enviando email a:", userMail);
//     const startTime = Date.now();
//     let html = getEmailTemplate({
//         title: "Recupera tu Contraseña",
//         message: `Hola ${userMail},<br> <br>Has solicitado recuperar tu contraseña en LabTRACK - ESFOT. Haz clic en el botón a continuación para crear una nueva contraseñaXCCC111.`,
//         buttonUrl: `${process.env.URL_FRONTEND}reset/${token}`,
//         buttonText: "RESTABLECER CONTRASEÑA",
//         footer: "Si no solicitaste recuperar tu contraseña, ignora este correo.<br>© 2025 LabTRACK - ESFOT Todos los derechos reservados."
//     });
//     let info = await transporter.sendMail({
//         priority: 'high',
//         from: 'admin@labtrackesfot.com',
//         to: userMail,
//         subject: "Recupera tu contraseña en LabTRACK - ESFOT",
//         html
//     });
//     console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
//     console.log(`Email enviado en ${Date.now() - startTime}ms, ID:`, info.messageId);
// };

export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
}