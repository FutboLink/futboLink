/**
 * Script para probar la configuración del correo electrónico de FutboLink
 * 
 * Este script verifica la conexión al servidor SMTP y envía un correo de prueba
 * para confirmar que la configuración de correo electrónico funciona correctamente.
 * 
 * Uso: node test-email-config.js [dirección-de-correo-de-prueba]
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Obtener la dirección de correo de prueba desde los argumentos o usar una predeterminada
const testEmail = process.argv[2] || process.env.MAIL_USER;

if (!testEmail) {
  console.error(`${colors.red}Error: No se proporcionó una dirección de correo electrónico de prueba.${colors.reset}`);
  console.error(`Uso: node test-email-config.js [dirección-de-correo-de-prueba]`);
  process.exit(1);
}

console.log(`${colors.blue}=== Prueba de Configuración de Correo Electrónico FutboLink ===${colors.reset}\n`);

// Verificar variables de entorno
console.log(`${colors.cyan}Verificando variables de entorno...${colors.reset}`);
const requiredEnvVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASSWORD', 'MAIL_FROM'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`${colors.red}Error: Faltan las siguientes variables de entorno: ${missingVars.join(', ')}${colors.reset}`);
  console.error(`Asegúrate de que el archivo .env esté configurado correctamente.`);
  process.exit(1);
}

console.log(`${colors.green}✓ Todas las variables de entorno necesarias están configuradas${colors.reset}`);
console.log(`  MAIL_HOST: ${process.env.MAIL_HOST}`);
console.log(`  MAIL_PORT: ${process.env.MAIL_PORT}`);
console.log(`  MAIL_USER: ${process.env.MAIL_USER}`);
console.log(`  MAIL_PASSWORD: ${'*'.repeat(8)} (oculta por seguridad)`);
console.log(`  MAIL_FROM: ${process.env.MAIL_FROM}`);

// Crear el transporter
console.log(`\n${colors.cyan}Creando transporter de nodemailer...${colors.reset}`);
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: parseInt(process.env.MAIL_PORT, 10) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  debug: true, // Habilitar logs de depuración
});

// Verificar la conexión
console.log(`\n${colors.cyan}Verificando conexión al servidor SMTP...${colors.reset}`);
transporter.verify()
  .then(() => {
    console.log(`${colors.green}✓ Conexión al servidor SMTP exitosa${colors.reset}`);
    
    // Enviar correo de prueba
    console.log(`\n${colors.cyan}Enviando correo electrónico de prueba a ${testEmail}...${colors.reset}`);
    
    return transporter.sendMail({
      from: `"FutboLink Test" <${process.env.MAIL_FROM}>`,
      to: testEmail,
      subject: 'Prueba de Configuración de Correo - FutboLink',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center;">Prueba de Configuración de Correo</h2>
          <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
            <p>¡Felicitaciones! Si estás viendo este correo, significa que la configuración de correo electrónico de FutboLink funciona correctamente.</p>
            <p>Detalles de la prueba:</p>
            <ul>
              <li><strong>Fecha y hora:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Servidor SMTP:</strong> ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}</li>
              <li><strong>Remitente:</strong> ${process.env.MAIL_FROM}</li>
            </ul>
            <p>Ya puedes enviar notificaciones por correo electrónico desde tu aplicación FutboLink.</p>
          </div>
          <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
            <p>FutboLink - Conectando el mundo del fútbol</p>
            <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    });
  })
  .then(info => {
    console.log(`${colors.green}✓ Correo electrónico enviado correctamente${colors.reset}`);
    console.log(`  ID del mensaje: ${info.messageId}`);
    console.log(`  URL de vista previa: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`\n${colors.green}¡La configuración de correo electrónico funciona correctamente!${colors.reset}`);
    console.log(`Revisa la bandeja de entrada de ${testEmail} para confirmar la recepción.`);
  })
  .catch(error => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    
    if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      console.error(`\n${colors.yellow}Este error indica un problema con las credenciales de autenticación.${colors.reset}`);
      console.error(`Si estás usando Gmail, asegúrate de estar utilizando una "Contraseña de aplicación" y no tu contraseña regular.`);
      console.error(`\nPara generar una contraseña de aplicación:`);
      console.error(`1. Ve a https://myaccount.google.com/apppasswords`);
      console.error(`2. Selecciona "Otra (nombre personalizado)" e ingresa "FutboLink"`);
      console.error(`3. Copia la contraseña generada y actualiza tu archivo .env`);
      console.error(`\nRecuerda que necesitas tener la verificación en dos pasos activada en tu cuenta de Google.`);
    } else {
      console.error(`\n${colors.yellow}Consulta la documentación de solución de problemas en gmail-auth-fix.md${colors.reset}`);
    }
    
    process.exit(1);
  }); 