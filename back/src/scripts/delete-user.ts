/**
 * Script para eliminar un usuario de la base de datos
 * 
 * Este script utiliza la configuración de TypeORM del proyecto
 * para conectarse y eliminar un usuario por ID o email.
 * 
 * Ejecución:
 *   Por ID: npx ts-node src/scripts/delete-user.ts <userId>
 *   Por email: npx ts-node src/scripts/delete-user.ts --email <email>
 * 
 * Ejemplos:
 *   npx ts-node src/scripts/delete-user.ts e58a5d5b-ffec-4f57-b6a5-2a5f12345678
 *   npx ts-node src/scripts/delete-user.ts --email usuario@example.com
 */

import { createConnection, getConnectionOptions } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';
import * as readline from 'readline';

// Función para leer entrada del usuario
function askQuestion(query: string): Promise<string> {
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

// Función principal
async function deleteUser() {
  // Obtener argumentos de la línea de comandos
  const args = process.argv.slice(2);
  
  let userId: string | null = null;
  let userEmail: string | null = null;

  // Parsear argumentos
  if (args.length === 0) {
    console.error('Error: Debes proporcionar un ID de usuario o un email.');
    console.error('Uso: npx ts-node src/scripts/delete-user.ts <userId>');
    console.error('   o: npx ts-node src/scripts/delete-user.ts --email <email>');
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
    
    // Buscar el usuario
    let user: User | null = null;
    
    if (userEmail) {
      user = await userRepository.findOne({ where: { email: userEmail } });
      if (!user) {
        console.error(`Error: No se encontró un usuario con el email: ${userEmail}`);
        await connection.close();
        process.exit(1);
      }
      userId = user.id;
      console.log(`Usuario encontrado: ${user.name} ${user.lastname || ''} (${user.email}) - ID: ${user.id}`);
    } else if (userId) {
      user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.error(`Error: No se encontró un usuario con el ID: ${userId}`);
        await connection.close();
        process.exit(1);
      }
      console.log(`Usuario encontrado: ${user.name} ${user.lastname || ''} (${user.email}) - ID: ${user.id}`);
    }

    if (!user) {
      console.error('Error: No se pudo encontrar el usuario');
      await connection.close();
      process.exit(1);
    }

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
      await connection.close();
      process.exit(0);
    }

    // Eliminar el usuario
    console.log('\nEliminando usuario...');
    const result = await userRepository.delete(userId!);
    
    if (result.affected === 0) {
      console.error('Error: No se pudo eliminar el usuario. Puede que ya haya sido eliminado.');
      await connection.close();
      process.exit(1);
    }

    console.log(`✓ Usuario eliminado exitosamente (ID: ${userId})`);
    
    // Cerrar la conexión
    await connection.close();
    console.log('Conexión cerrada');
    
  } catch (err) {
    console.error('Error durante la eliminación:', err);
    process.exit(1);
  }
}

// Ejecutar la función principal
deleteUser().catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
});
