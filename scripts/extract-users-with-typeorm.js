/**
 * Script para extraer emails y nombres de usuarios usando la configuración de TypeORM
 * 
 * Uso:
 * 1. Ejecuta: node scripts/extract-users-with-typeorm.js
 * 2. Los resultados se guardarán en users-emails.json
 */

require('dotenv').config();
const { createConnection } = require('typeorm');
const fs = require('fs');
const path = require('path');

async function extractUserEmails() {
  let connection;

  try {
    console.log('Conectando a la base de datos usando TypeORM...');
    
    // Usar la configuración de TypeORM del proyecto
    connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [path.join(__dirname, '../back/src/modules/**/entities/*.entity.{ts,js}')],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Conexión establecida. Ejecutando consulta...');
    
    // Ejecutar consulta raw para obtener los datos
    const result = await connection.query(`
      SELECT id, email, name, lastname, role
      FROM "user"
      ORDER BY name, lastname
    `);
    
    console.log(`Se encontraron ${result.length} usuarios`);
    
    // Guardar resultados en un archivo JSON
    const outputFile = path.join(__dirname, '../users-emails.json');
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    
    console.log(`Resultados guardados en ${outputFile}`);
    
    // También mostrar en consola
    console.log('\nLista de usuarios:');
    result.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} ${user.lastname} (${user.email}) - ${user.role}`);
    });
    
  } catch (err) {
    console.error('Error al extraer datos:', err);
    console.error(err.stack);
  } finally {
    if (connection) {
      await connection.close();
      console.log('Conexión cerrada');
    }
  }
}

extractUserEmails(); 