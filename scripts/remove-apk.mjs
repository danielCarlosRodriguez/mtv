import { unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apkPath = join(__dirname, '..', 'dist', 'mtv2026.apk');

if (existsSync(apkPath)) {
  try {
    unlinkSync(apkPath);
    console.log('✅ APK eliminado antes de sync con Capacitor');
  } catch (error) {
    console.warn('⚠️  No se pudo eliminar el APK:', error.message);
    process.exit(1);
  }
} else {
  console.log('ℹ️  APK no encontrado en dist/, continuando...');
}
