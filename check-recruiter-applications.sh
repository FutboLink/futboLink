#!/bin/bash

# Script para verificar si existen aplicaciones creadas por reclutadores
# Utiliza la URL de la base de datos proporcionada

echo "Verificando aplicaciones creadas por reclutadores..."

# Crear un archivo temporal para la consulta
cat > temp-check.js << 'EOL'
const { Client } = require('pg');

// Configuración de la conexión
const client = new Client({
  connectionString: 'postgresql://futbolink:h9mt6zRAUM2eF1rUuhr7wLgpvGSjknRX@dpg-cvi5vrl2ng1s73a1kda0-a.oregon-postgres.render.com/futbolinkdb',
  ssl: { rejectUnauthorized: false }
});

async function checkApplications() {
  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('Conexión establecida con la base de datos');

    // Verificar aplicaciones creadas por reclutadores
    console.log('\n1. Aplicaciones donde appliedByRecruiter = true:');
    const recruiterAppsQuery = `
      SELECT 
        a.id, 
        a.message, 
        a."appliedAt", 
        a."appliedByRecruiter", 
        a."recruiterId", 
        a."recruiterMessage",
        p.name as player_name, 
        p.lastname as player_lastname,
        r.name as recruiter_name, 
        r.lastname as recruiter_lastname,
        j.title as job_title
      FROM application a
      LEFT JOIN users p ON p.id = a."playerId"
      LEFT JOIN users r ON r.id = a."recruiterId"
      LEFT JOIN jobs j ON j.id = a."jobId"
      WHERE a."appliedByRecruiter" = true
      ORDER BY a."appliedAt" DESC
    `;
    
    const recruiterAppsResult = await client.query(recruiterAppsQuery);
    
    if (recruiterAppsResult.rows.length > 0) {
      console.log(`Se encontraron ${recruiterAppsResult.rows.length} aplicaciones creadas por reclutadores:`);
      recruiterAppsResult.rows.forEach(app => {
        console.log(`\n- ID: ${app.id}`);
        console.log(`  Jugador: ${app.player_name} ${app.player_lastname}`);
        console.log(`  Reclutador: ${app.recruiter_name} ${app.recruiter_lastname}`);
        console.log(`  Trabajo: ${app.job_title}`);
        console.log(`  Mensaje del reclutador: ${app.recruiterMessage || 'No especificado'}`);
        console.log(`  Fecha de aplicación: ${app.appliedAt}`);
      });
    } else {
      console.log('No se encontraron aplicaciones creadas por reclutadores.');
    }

    // Verificar aplicaciones con mensaje que indique que fueron creadas por reclutadores
    console.log('\n2. Aplicaciones con mensaje que indica que fueron creadas por reclutadores:');
    const messageQuery = `
      SELECT 
        a.id, 
        a.message, 
        a."appliedAt", 
        p.name as player_name, 
        p.lastname as player_lastname,
        j.title as job_title
      FROM application a
      LEFT JOIN users p ON p.id = a."playerId"
      LEFT JOIN jobs j ON j.id = a."jobId"
      WHERE a.message LIKE '%Aplicación enviada por mi representante%'
      AND (a."appliedByRecruiter" IS NULL OR a."appliedByRecruiter" = false)
      ORDER BY a."appliedAt" DESC
    `;
    
    const messageResult = await client.query(messageQuery);
    
    if (messageResult.rows.length > 0) {
      console.log(`Se encontraron ${messageResult.rows.length} aplicaciones con mensaje que indica que fueron creadas por reclutadores:`);
      messageResult.rows.forEach(app => {
        console.log(`\n- ID: ${app.id}`);
        console.log(`  Jugador: ${app.player_name} ${app.player_lastname}`);
        console.log(`  Trabajo: ${app.job_title}`);
        console.log(`  Mensaje: ${app.message.substring(0, 100)}${app.message.length > 100 ? '...' : ''}`);
        console.log(`  Fecha de aplicación: ${app.appliedAt}`);
      });
    } else {
      console.log('No se encontraron aplicaciones con mensaje que indique que fueron creadas por reclutadores.');
    }

    console.log('\nVerificación completada con éxito');
  } catch (error) {
    console.error('Error durante la verificación:', error);
  } finally {
    // Cerrar la conexión
    await client.end();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la verificación
checkApplications();
EOL

# Ejecutar el script de verificación
echo "Ejecutando verificación..."
node temp-check.js

# Limpiar archivos temporales
rm temp-check.js

echo "Proceso de verificación finalizado." 