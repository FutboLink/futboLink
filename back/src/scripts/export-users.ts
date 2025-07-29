/**
 * Script para exportar usuarios de la base de datos
 * 
 * Este script utiliza la configuración de TypeORM del proyecto
 * para conectarse y extraer información de usuarios.
 * 
 * Ejecución: npx ts-node src/scripts/export-users.ts
 */

import { createConnection, getConnectionOptions } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../modules/user/entities/user.entity';

// Función principal
async function exportUsers() {
  console.log('Iniciando exportación de usuarios...');
  
  try {
    // Obtener opciones de conexión de TypeORM
    const connectionOptions = await getConnectionOptions();
    
    // Crear conexión con la base de datos
    const connection = await createConnection({
      ...connectionOptions,
      synchronize: false, // No sincronizar esquema
      logging: ['error'], // Solo registrar errores
    });
    
    console.log('Conexión establecida con la base de datos');
    
    // Obtener repositorio de usuarios
    const userRepository = connection.getRepository(User);
    
    // Consultar usuarios
    const users = await userRepository.find({
      select: [
        'id', 
        'email', 
        'name', 
        'lastname', 
        'role', 
        'isVerified',
        'subscriptionType',
        'phone',
        'imgUrl',
        'createdAt',
        'updatedAt'
      ],
      order: {
        name: 'ASC',
        lastname: 'ASC'
      }
    });
    
    console.log(`Se encontraron ${users.length} usuarios`);
    
    // Crear directorio para exportaciones si no existe
    const exportsDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Guardar resultados en un archivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(exportsDir, `users-export-${timestamp}.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify(users, null, 2));
    console.log(`Se exportaron ${users.length} usuarios al archivo: ${outputFile}`);
    
    // Crear archivo CSV
    const csvFile = path.join(exportsDir, `users-export-${timestamp}.csv`);
    const headers = ['id', 'email', 'name', 'lastname', 'role', 'isVerified', 'subscriptionType', 'phone', 'createdAt', 'updatedAt'];
    
    const csvContent = [
      headers.join(','),
      ...users.map(user => {
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
    users.slice(0, 5).forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} ${user.lastname} (${user.email}) - ${user.role}`);
    });
    
    if (users.length > 5) {
      console.log(`... y ${users.length - 5} más`);
    }
    
    // Cerrar la conexión
    await connection.close();
    console.log('Conexión cerrada');
    
  } catch (err) {
    console.error('Error durante la exportación:', err);
  }
}

// Ejecutar la función principal
exportUsers().catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
}); 