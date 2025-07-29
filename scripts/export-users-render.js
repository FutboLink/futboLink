/**
 * Script para exportar usuarios desde la base de datos de Render
 * 
 * Este script utiliza la configuración de TypeORM del proyecto
 * y se conecta directamente a la base de datos de Render.
 */

// Importar módulos necesarios
require('dotenv').config({ path: './back/.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Crear directorio para exportaciones si no existe
const exportsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Función para obtener la URL de la base de datos
function getDatabaseUrl() {
  // Primero intentar obtener la URL de la base de datos desde las variables de entorno
  let dbUrl = process.env.DATABASE_URL;
  
  // Si no está disponible, intentar leer del archivo de configuración de TypeORM
  if (!dbUrl) {
    try {
      const typeormConfig = require('../back/src/modules/config/typeorm.config');
      if (typeof typeormConfig.getConnectionOptions === 'function') {
        const config = typeormConfig.getConnectionOptions();
        dbUrl = config.url || null;
      }
    } catch (err) {
      console.warn('No se pudo cargar la configuración de TypeORM:', err.message);
    }
  }
  
  // Si aún no tenemos la URL, solicitar al usuario
  if (!dbUrl) {
    console.log('No se encontró la URL de la base de datos en las variables de entorno.');
    console.log('Por favor, proporciona la URL de conexión de Render:');
    console.log('Ejemplo: postgres://usuario:contraseña@host:puerto/nombre_db');
    process.exit(1);
  }
  
  return dbUrl;
}

// Función principal
async function exportUsers() {
  console.log('Iniciando exportación de usuarios desde Render...');
  
  // Obtener la URL de la base de datos
  const databaseUrl = getDatabaseUrl();
  console.log('URL de la base de datos obtenida');
  
  // Configurar la conexión
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Necesario para conexiones a Render
    }
  });
  
  try {
    // Conectar a la base de datos
    const client = await pool.connect();
    console.log('Conexión establecida con la base de datos de Render');
    
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
    const outputFile = path.join(exportsDir, `users-render-${timestamp}.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify(result.rows, null, 2));
    console.log(`Se exportaron ${result.rows.length} usuarios al archivo: ${outputFile}`);
    
    // Crear archivo CSV
    const csvFile = path.join(exportsDir, `users-render-${timestamp}.csv`);
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