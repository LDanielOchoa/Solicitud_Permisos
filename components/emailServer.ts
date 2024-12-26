import nodemailer from 'nodemailer';

// Configuración del transporte de nodemailer para Outlook
const transporter = nodemailer.createTransport({
    host: 'mail.sao6.com.co', // Host para Outlook
    port: 587, // Puerto para conexiones seguras
    secure: true, // Usar STARTTLS
    auth: {
        user: "daniel.ochoa@sao6.com.co", // Tu correo almacenado en variables de entorno
        pass: "daniel1035126774*"  // Tu contraseña almacenada en variables de entorno
    },
    tls: {
        rejectUnauthorized: false // Agrega esta línea si encuentras problemas de certificado
    }
});

interface ArchivoAdjunto {
    filename: string;
    path: string;
}

// Función para enviar correos con posibilidad de adjuntar archivos
export const enviarCorreo = async (to: string, subject: string, text: string, archivoAdjunto: ArchivoAdjunto | null = null): Promise<void> => {
    const mailOptions = {
        from: "daniel.ochoa@sao6.com.co", // Asegúrate de que esta variable esté en tu .env
        to,
        subject,
        text,
        attachments: archivoAdjunto ? [
            {
                filename: archivoAdjunto.filename, // Nombre del archivo a adjuntar
                path: archivoAdjunto.path // Ruta del archivo a adjuntar
            }
        ] : [] // Si no hay archivo, envía el correo sin adjuntos
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: ', info.response);
    } catch (error) {
        console.error('Error al enviar el correo: ', error);
        throw error; // Lanza el error para manejarlo en el llamador
    }
};
