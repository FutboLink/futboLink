#!/usr/bin/env node

/**
 * Script para exportar emails de usuarios sin incluir el ID
 * 
 * Uso: node export-users-without-id.js "URL_DE_CONEXION"
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Obtener la URL de la base de datos desde los argumentos
const databaseUrl = process.argv[2];

if (!databaseUrl) {
  console.error('Error: Debes proporcionar la URL de la base de datos como argumento.');
  console.error('Ejemplo: node export-users-without-id.js "postgres://usuario:contraseña@host:puerto/nombre_db"');
  process.exit(1);
}

// Función principal
async function exportUserEmails(dbUrl) {
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
    
    // Ejecutar consulta para obtener usuarios sin ID
    const result = await client.query(`
      SELECT 
        email, 
        name, 
        lastname, 
        role
      FROM 
        users
      ORDER BY 
        name, lastname
    `);
    
    console.log(`Se encontraron ${result.rows.length} usuarios`);
    
    // Crear directorio para exportaciones si no existe
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Guardar resultados en un archivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(exportsDir, `users-without-id-${timestamp}.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify(result.rows, null, 2));
    console.log(`Se exportaron ${result.rows.length} usuarios al archivo: ${outputFile}`);
    
    // Crear archivo CSV
    const csvFile = path.join(exportsDir, `users-without-id-${timestamp}.csv`);
    const headers = ['email', 'name', 'lastname', 'role'];
    
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
    
    // Mostrar algunos usuarios en la consola
    console.log('\nEjemplos de usuarios exportados:');
    result.rows.slice(0, 10).forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} ${user.lastname} (${user.email}) - ${user.role}`);
    });
    
    if (result.rows.length > 10) {
      console.log(`... y ${result.rows.length - 10} más`);
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
exportUserEmails(databaseUrl).catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
}); 