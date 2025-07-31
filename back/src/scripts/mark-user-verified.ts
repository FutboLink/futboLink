import { DataSource } from 'typeorm';
import 'dotenv/config';

async function markUserAsVerified() {
  console.log('🔧 Marcando usuario específico como verificado...');
  
  try {
    const dataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    });
    
    await dataSource.initialize();
    console.log('🔗 Conexión establecida');
    
    // Marcar el usuario específico como verificado
    const userId = 'a23a362f-29b5-4743-adea-4f2994d5610b';
    
    // Primero verificar si la columna existe
    const columnCheck = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'isVerified'
    `);
    
    if (columnCheck.length === 0) {
      console.log('🔧 Creando columna isVerified...');
      await dataSource.query(`
        ALTER TABLE "users" 
        ADD COLUMN "isVerified" boolean NOT NULL DEFAULT false
      `);
      console.log('✅ Columna creada');
    }
    
    // Marcar como verificado
    await dataSource.query(`
      UPDATE users 
      SET "isVerified" = true 
      WHERE id = $1
    `, [userId]);
    
    console.log('✅ Usuario marcado como verificado');
    
    // Verificar el resultado
    const result = await dataSource.query(`
      SELECT id, name, lastname, "isVerified" 
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    console.log('👤 Usuario actualizado:', result[0]);
    
    await dataSource.destroy();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

markUserAsVerified();