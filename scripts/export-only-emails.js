#!/usr/bin/env node

/**
 * Script para exportar únicamente los emails de los usuarios
 * 
 * Uso: node export-only-emails.js "URL_DE_CONEXION"
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Obtener la URL de la base de datos desde los argumentos
const databaseUrl = process.argv[2];

if (!databaseUrl) {
  console.error('Error: Debes proporcionar la URL de la base de datos como argumento.');
  console.error('Ejemplo: node export-only-emails.js "postgres://usuario:contraseña@host:puerto/nombre_db"');
  process.exit(1);
}

// Función principal
async function exportOnlyEmails(dbUrl) {
  console.log('Conectando a la base de datos...');
  
  // Crear cliente de PostgreSQL
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false // Necesario para conexiones a Render
    }
  });
  
  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('Conexión establecida con la base de datos');
    
    // Ejecutar consulta para obtener solo los emails
    const result = await client.query(`
      SELECT 
        email
      FROM 
        users
      ORDER BY 
        email
    `);
    
    console.log(`Se encontraron ${result.rows.length} emails`);
    
    // Crear directorio para exportaciones si no existe
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Extraer solo los emails como un array
    const emailsArray = result.rows.map(row => row.email);
    
    // Guardar resultados en un archivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(exportsDir, `only-emails-${timestamp}.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify(emailsArray, null, 2));
    console.log(`Se exportaron ${emailsArray.length} emails al archivo: ${outputFile}`);
    
    // Crear archivo de texto con un email por línea
    const txtFile = path.join(exportsDir, `only-emails-${timestamp}.txt`);
    fs.writeFileSync(txtFile, emailsArray.join('\n'));
    console.log(`Se exportó el archivo de texto: ${txtFile}`);
    
    // Mostrar algunos emails en la consola
    console.log('\nEjemplos de emails exportados:');
    emailsArray.slice(0, 10).forEach((email, i) => {
      console.log(`${i + 1}. ${email}`);
    });
    
    if (emailsArray.length > 10) {
      console.log(`... y ${emailsArray.length - 10} más`);
    }
    
  } catch (err) {
    console.error('Error durante la exportación:', err);
  } finally {
    // Cerrar la conexión
    await client.end();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la función principal
exportOnlyEmails(databaseUrl).catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
}); 