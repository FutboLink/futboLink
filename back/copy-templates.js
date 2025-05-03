const { copySync } = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'templates');
const distDir = path.join(__dirname, 'dist', 'templates');

try {
  copySync(srcDir, distDir);
  console.log('✔ Templates copiadas exitosamente.');
} catch (err) {
  console.error('❌ Error al copiar templates:', err);
  process.exit(1);
}
