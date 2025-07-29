/**
 * Script para extraer emails y nombres de usuarios de la base de datos
 * 
 * Uso:
 * 1. Asegúrate de tener las variables de entorno configuradas (DATABASE_URL)
 * 2. Ejecuta: node scripts/extract-users-emails.js
 * 3. Los resultados se guardarán en users-emails.json
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la conexión
const connectionString = process.env.DATABASE_URL || 'postgres://usuario:contraseña@host:puerto/nombre_db';

async function extractUserEmails() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Necesario para conexiones a Render
    }
  });

  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    
    console.log('Ejecutando consulta...');
    const query = `
      SELECT id, email, name, lastname, role
      FROM "user"
      ORDER BY name, lastname
    `;
    
    const result = await client.query(query);
    
    console.log(`Se encontraron ${result.rows.length} usuarios`);
    
    // Guardar resultados en un archivo JSON
    const outputFile = path.join(__dirname, '../users-emails.json');
    fs.writeFileSync(outputFile, JSON.stringify(result.rows, null, 2));
    
    console.log(`Resultados guardados en ${outputFile}`);
    
    // También mostrar en consola
    console.log('\nLista de usuarios:');
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} ${user.lastname} (${user.email}) - ${user.role}`);
    });
    
  } catch (err) {
    console.error('Error al extraer datos:', err);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

extractUserEmails(); 