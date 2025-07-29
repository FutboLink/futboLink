/**
 * Script para exportar usuarios de la base de datos
 * 
 * Este script utiliza la configuración de base de datos existente en el proyecto
 * para conectarse y extraer la información de los usuarios.
 */

// Importar módulos necesarios
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Crear directorio para scripts si no existe
const scriptsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para conexiones a Render
  }
});

// Función principal
async function exportUsers() {
  console.log('Iniciando exportación de usuarios...');
  
  try {
    // Conectar a la base de datos
    const client = await pool.connect();
    console.log('Conexión establecida con la base de datos');
    
    // Ejecutar consulta para obtener usuarios
    const result = await client.query(`
      SELECT 
        id, 
        email, 
        name, 
        lastname, 
        role, 
        "isVerified",
        "subscriptionType",
        phone,
        "imgUrl"
      FROM 
        "user"
      ORDER BY 
        name, lastname
    `);
    
    // Liberar el cliente
    client.release();
    
    // Guardar resultados en un archivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(scriptsDir, `users-export-${timestamp}.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify(result.rows, null, 2));
    console.log(`Se exportaron ${result.rows.length} usuarios al archivo: ${outputFile}`);
    
    // Crear archivo CSV
    const csvFile = path.join(scriptsDir, `users-export-${timestamp}.csv`);
    const headers = ['id', 'email', 'name', 'lastname', 'role', 'isVerified', 'subscriptionType', 'phone'];
    
    const csvContent = [
      headers.join(','),
      ...result.rows.map(user => {
        return headers.map(header => {
          // Escapar comas y comillas en los valores
          const value = user[header] === null ? '' : String(user[header]);
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',');
      })
    ].join('\n');
    
    fs.writeFileSync(csvFile, csvContent);
    console.log(`Se exportó el archivo CSV: ${csvFile}`);
    
    // Mostrar algunos ejemplos en la consola
    console.log('\nEjemplos de usuarios exportados:');
    result.rows.slice(0, 5).forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} ${user.lastname} (${user.email}) - ${user.role}`);
    });
    
    if (result.rows.length > 5) {
      console.log(`... y ${result.rows.length - 5} más`);
    }
    
  } catch (err) {
    console.error('Error durante la exportación:', err);
  } finally {
    // Cerrar el pool de conexiones
    await pool.end();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la función principal
exportUsers().catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
}); 