// =====================================================
// UTILIDAD: validators.js
// Valida que los datos recibidos por body estén completos
// antes de guardar productos o carritos.
// =====================================================

export function validateProductFields(product) {
  const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
  const missingFields = requiredFields.filter((field) => product[field] === undefined || product[field] === '');

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Faltan campos obligatorios: ${missingFields.join(', ')}`
    };
  }

  if (typeof product.price !== 'number' || product.price <= 0) {
    return { isValid: false, message: 'El campo price debe ser un número mayor a 0.' };
  }

  if (typeof product.stock !== 'number' || product.stock < 0) {
    return { isValid: false, message: 'El campo stock debe ser un número igual o mayor a 0.' };
  }

  if (typeof product.status !== 'boolean') {
    return { isValid: false, message: 'El campo status debe ser booleano: true o false.' };
  }

  return { isValid: true };
}
