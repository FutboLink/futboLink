#!/usr/bin/env node

/**
 * Script para listar todas las tablas en la base de datos de Render
 * 
 * Uso: node list-tables.js "URL_DE_CONEXION"
 */

const { Client } = require('pg');

// Obtener la URL de la base de datos desde los argumentos
const databaseUrl = process.argv[2];

if (!databaseUrl) {
  console.error('Error: Debes proporcionar la URL de la base de datos como argumento.');
  console.error('Ejemplo: node list-tables.js "postgres://usuario:contraseña@host:puerto/nombre_db"');
  process.exit(1);
}

// Función principal
async function listTables(dbUrl) {
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
    
    // Consultar los esquemas disponibles
    console.log('\n--- ESQUEMAS ---');
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);
    
    schemasResult.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.schema_name}`);
    });
    
    // Consultar todas las tablas en todos los esquemas
    console.log('\n--- TABLAS ---');
    const tablesResult = await client.query(`
      SELECT 
        table_schema,
        table_name
      FROM 
        information_schema.tables
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type = 'BASE TABLE'
      ORDER BY 
        table_schema, table_name
    `);
    
    tablesResult.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.table_schema}.${row.table_name}`);
    });
    
    // Buscar tablas relacionadas con usuarios
    console.log('\n--- POSIBLES TABLAS DE USUARIOS ---');
    const userTablesResult = await client.query(`
      SELECT 
        table_schema,
        table_name
      FROM 
        information_schema.tables
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type = 'BASE TABLE'
        AND (
          table_name ILIKE '%user%' OR
          table_name ILIKE '%usuario%' OR
          table_name ILIKE '%account%' OR
          table_name ILIKE '%cuenta%'
        )
      ORDER BY 
        table_schema, table_name
    `);
    
    if (userTablesResult.rows.length > 0) {
      userTablesResult.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.table_schema}.${row.table_name}`);
      });
    } else {
      console.log('No se encontraron tablas relacionadas con usuarios');
    }
    
    // Para la primera tabla de usuarios encontrada, mostrar su estructura
    if (userTablesResult.rows.length > 0) {
      const firstUserTable = userTablesResult.rows[0];
      console.log(`\n--- ESTRUCTURA DE LA TABLA ${firstUserTable.table_schema}.${firstUserTable.table_name} ---`);
      
      const columnsResult = await client.query(`
        SELECT 
          column_name, 
          data_type,
          is_nullable
        FROM 
          information_schema.columns
        WHERE 
          table_schema = $1
          AND table_name = $2
        ORDER BY 
          ordinal_position
      `, [firstUserTable.table_schema, firstUserTable.table_name]);
      
      columnsResult.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Cerrar la conexión
    await client.end();
    console.log('\nConexión cerrada');
  }
}

// Ejecutar la función principal
listTables(databaseUrl).catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
}); 