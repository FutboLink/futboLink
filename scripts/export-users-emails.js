#!/usr/bin/env node

/**
 * Script para exportar emails de usuarios de la base de datos de Render
 * 
 * Uso: node export-users-emails.js "URL_DE_CONEXION"
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Obtener la URL de la base de datos desde los argumentos
const databaseUrl = process.argv[2];

if (!databaseUrl) {
  console.error('Error: Debes proporcionar la URL de la base de datos como argumento.');
  console.error('Ejemplo: node export-users-emails.js "postgres://usuario:contraseña@host:puerto/nombre_db"');
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
    
    // Ejecutar consulta para obtener usuarios
    const result = await client.query(`
      SELECT 
        id, 
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
    const outputFile = path.join(exportsDir, `users-emails-${timestamp}.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify(result.rows, null, 2));
    console.log(`Se exportaron ${result.rows.length} usuarios al archivo: ${outputFile}`);
    
    // Crear archivo CSV
    const csvFile = path.join(exportsDir, `users-emails-${timestamp}.csv`);
    const headers = ['id', 'email', 'name', 'lastname', 'role'];
    
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
    
    // Mostrar usuarios en la consola
    console.log('\nLista de usuarios:');
    result.rows.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} ${user.lastname} (${user.email}) - ${user.role}`);
    });
    
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