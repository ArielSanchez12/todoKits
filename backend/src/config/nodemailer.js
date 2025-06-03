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

//Esto es para el registro




const sendMailToRegister = (userMail, token) => {

    let mailOptions = {
        from: 'admin@vet.com',
        to: userMail,
        subject: "KITSLABORATORIO-🐒🏇🏿",
        html: `<p>Hola, haz clic <a href="${process.env.URL_FRONTEND}confirm/${token}">aquí</a> para confirmar tu cuenta.</p>
        <hr>
        <footer>El equipo de la ESFOT te da la más cordial bienvenida.</footer>
        `
    }

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
        }
    })
}


const sendMailToRecoveryPassword = async(userMail,token)=>{
    let info = await transporter.sendMail({
    from: 'admin@vet.com',
    to: userMail,
    subject: "Correo para reestablecer tu contraseña",
    html: `
    <h1>KITSLABORATORIO-🐒🏇🏿/h1>
    <hr>
    <a href=${process.env.URL_FRONTEND}recuperarpassword/${token}>Clic para reestablecer tu contraseña</a>
    <hr>
    <footer>El equipo de la ESFOT te da la más cordial bienvenida.</footer>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}



export {
    sendMailToRegister,
    sendMailToRecoveryPassword
}