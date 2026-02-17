#!/usr/bin/env node

/**
 * Script para eliminar un usuario de la base de datos
 * 
 * Este script se conecta directamente a la base de datos usando pg
 * y elimina un usuario por ID o email.
 * 
 * Uso:
 *   Por ID: node scripts/delete-user.js <userId>
 *   Por email: node scripts/delete-user.js --email <email>
 *   Con URL de BD: node scripts/delete-user.js <userId> "postgres://..."
 * 
 * Ejemplos:
 *   node scripts/delete-user.js e58a5d5b-ffec-4f57-b6a5-2a5f12345678
 *   node scripts/delete-user.js --email usuario@example.com
 *   node scripts/delete-user.js e58a5d5b-ffec-4f57-b6a5-2a5f12345678 "postgres://..."
 */

// Importar módulos necesarios
require('dotenv').config({ path: './back/.env' });
const { Pool } = require('pg');
const readline = require('readline');

// Función para leer entrada del usuario
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Función para obtener la URL de la base de datos
function getDatabaseUrl() {
  // Primero intentar obtener desde los argumentos
  const args = process.argv.slice(2);
  const dbUrlArg = args.find(arg => arg.startsWith('postgres://'));
  
  if (dbUrlArg) {
    return dbUrlArg;
  }

  // Luego intentar desde las variables de entorno
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
    console.log('Por favor, proporciona la URL de conexión:');
    console.log('Ejemplo: postgres://usuario:contraseña@host:puerto/nombre_db');
    process.exit(1);
  }
  
  return dbUrl;
}

// Función principal
async function deleteUser() {
  // Obtener argumentos de la línea de comandos
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('postgres://'));
  
  let userId = null;
  let userEmail = null;

  // Parsear argumentos
  if (args.length === 0) {
    console.error('Error: Debes proporcionar un ID de usuario o un email.');
    console.error('Uso: node scripts/delete-user.js <userId>');
    console.error('   o: node scripts/delete-user.js --email <email>');
    process.exit(1);
  }

  if (args[0] === '--email' || args[0] === '-e') {
    if (args.length < 2) {
      console.error('Error: Debes proporcionar un email después de --email');
      process.exit(1);
    }
    userEmail = args[1];
  } else {
    userId = args[0];
  }

  console.log('Iniciando eliminación de usuario...');
  
  // Obtener la URL de la base de datos
  const databaseUrl = getDatabaseUrl();
  
  // Configurar la conexión
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('render.com') || databaseUrl.includes('amazonaws.com') ? {
      rejectUnauthorized: false // Necesario para conexiones a Render/AWS
    } : false
  });
  
  try {
    // Conectar a la base de datos
    const client = await pool.connect();
    console.log('Conexión establecida con la base de datos');
    
    // Buscar el usuario
    let user = null;
    let query;
    let queryParams;

    if (userEmail) {
      query = 'SELECT id, email, name, lastname, role, "createdAt" FROM "user" WHERE email = $1';
      queryParams = [userEmail];
    } else {
      query = 'SELECT id, email, name, lastname, role, "createdAt" FROM "user" WHERE id = $1';
      queryParams = [userId];
    }

    const result = await client.query(query, queryParams);
    
    if (result.rows.length === 0) {
      const identifier = userEmail || userId;
      console.error(`Error: No se encontró un usuario con ${userEmail ? 'el email' : 'el ID'}: ${identifier}`);
      client.release();
      await pool.end();
      process.exit(1);
    }

    user = result.rows[0];
    userId = user.id;
    
    console.log(`Usuario encontrado: ${user.name} ${user.lastname || ''} (${user.email}) - ID: ${user.id}`);

    // Mostrar información del usuario antes de eliminar
    console.log('\nInformación del usuario a eliminar:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Nombre: ${user.name} ${user.lastname || ''}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Rol: ${user.role}`);
    console.log(`  Fecha de creación: ${user.createdAt || 'N/A'}`);

    // Pedir confirmación
    const confirmation = await askQuestion('\n¿Estás seguro de que deseas eliminar este usuario? (escribe "SI" para confirmar): ');
    
    if (confirmation.toUpperCase() !== 'SI') {
      console.log('Operación cancelada. El usuario no fue eliminado.');
      client.release();
      await pool.end();
      process.exit(0);
    }

    // Eliminar el usuario
    console.log('\nEliminando usuario...');
    const deleteResult = await client.query('DELETE FROM "user" WHERE id = $1', [userId]);
    
    if (deleteResult.rowCount === 0) {
      console.error('Error: No se pudo eliminar el usuario. Puede que ya haya sido eliminado.');
      client.release();
      await pool.end();
      process.exit(1);
    }

    console.log(`✓ Usuario eliminado exitosamente (ID: ${userId})`);
    
    // Liberar el cliente
    client.release();
    
  } catch (err) {
    console.error('Error durante la eliminación:', err);
    process.exit(1);
  } finally {
    // Cerrar el pool de conexiones
    await pool.end();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la función principal
deleteUser().catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
});
