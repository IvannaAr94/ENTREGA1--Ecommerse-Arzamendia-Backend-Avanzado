// =====================================================
// UTILIDAD: fileSystem.js
// ¿Qué hace este archivo?
// Centraliza la lectura y escritura de archivos JSON.
// Así evitamos repetir código en ProductManager y CartManager.
// =====================================================

import fs from 'fs/promises';
import path from 'path';

// Crea el archivo JSON si todavía no existe.
export async function ensureJsonFile(filePath, defaultValue = []) {
  try {
    await fs.access(filePath);
  } catch (error) {
    const folder = path.dirname(filePath);
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

// Lee un archivo JSON y lo transforma en un array/objeto de JavaScript.
export async function readJsonFile(filePath, defaultValue = []) {
  await ensureJsonFile(filePath, defaultValue);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content || JSON.stringify(defaultValue));
}

// Guarda información dentro de un archivo JSON con formato prolijo.
export async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
