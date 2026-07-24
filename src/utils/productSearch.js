// ==========================================================
// UTILIDAD: BÚSQUEDA GENERAL DE PRODUCTOS
// Construye filtros reutilizables para consultar MongoDB.
// ==========================================================

/**
 * Escapa caracteres especiales para evitar que el texto ingresado
 * por el usuario altere accidentalmente la expresión regular.
 *
 * @param {string} value Texto ingresado en el buscador.
 * @returns {string} Texto seguro para utilizar dentro de RegExp.
 */
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Convierte las vocales en grupos que reconocen variantes acentuadas.
 *
 * Ejemplo:
 * tecnologia también puede encontrar Tecnología.
 *
 * @param {string} value Texto previamente escapado.
 * @returns {string} Patrón compatible con vocales acentuadas.
 */
const makeAccentInsensitive = (value) => {
  return value
    .replace(/a/gi, '[aáàäâ]')
    .replace(/e/gi, '[eéèëê]')
    .replace(/i/gi, '[iíìïî]')
    .replace(/o/gi, '[oóòöô]')
    .replace(/u/gi, '[uúùüû]');
};

/**
 * Genera una variante singular sencilla.
 *
 * Ejemplos:
 * freidoras -> freidora
 * cafeteras -> cafetera
 * productos -> producto
 *
 * @param {string} word Palabra ingresada.
 * @returns {string} Palabra singular aproximada.
 */
const getSingularVariant = (word) => {
  const normalizedWord = word.toLowerCase();

  // Quita "es" en plurales comunes suficientemente largos.
  if (normalizedWord.endsWith('es') && normalizedWord.length > 5) {
    return normalizedWord.slice(0, -2);
  }

  // Quita la "s" final en plurales comunes.
  if (normalizedWord.endsWith('s') && normalizedWord.length > 4) {
    return normalizedWord.slice(0, -1);
  }

  return normalizedWord;
};

/**
 * Crea una expresión regular para una palabra de búsqueda.
 *
 * Incluye:
 * - la palabra original;
 * - una variante singular;
 * - reconocimiento de tildes;
 * - búsqueda sin distinguir mayúsculas y minúsculas.
 *
 * @param {string} word Palabra que se desea buscar.
 * @returns {RegExp} Expresión regular lista para MongoDB.
 */
const createSearchRegex = (word) => {
  const original = word.toLowerCase();
  const singular = getSingularVariant(original);

  const variants = [...new Set([original, singular])]
    .map((variant) => escapeRegex(variant))
    .map((variant) => makeAccentInsensitive(variant));

  return new RegExp(variants.join('|'), 'i');
};

/**
 * Construye el filtro general de productos.
 *
 * Busca cada palabra en:
 * - título;
 * - descripción;
 * - categoría;
 * - código.
 *
 * Cuando el usuario escribe varias palabras, todas deben estar
 * relacionadas con el producto, aunque aparezcan en campos distintos.
 *
 * @param {string} query Texto enviado desde el buscador.
 * @returns {object} Filtro listo para Product.find() o Product.paginate().
 */
export const buildProductSearchFilter = (query = '') => {
  const cleanQuery = query.trim();

  // Sin texto, devuelve todos los productos.
  if (!cleanQuery) {
    return {};
  }

  const normalizedQuery = cleanQuery.toLowerCase();

  // Permite buscar disponibilidad con términos en inglés y español.
  if (
    normalizedQuery === 'available' ||
    normalizedQuery === 'disponible' ||
    normalizedQuery === 'disponibles'
  ) {
    return {
      status: true
    };
  }

  // Permite buscar productos no disponibles.
  if (
    normalizedQuery === 'unavailable' ||
    normalizedQuery === 'no disponible' ||
    normalizedQuery === 'no disponibles'
  ) {
    return {
      status: false
    };
  }

  // Divide la búsqueda para admitir consultas como:
  // "cafetera eléctrica" o "cámara wifi".
  const searchTerms = cleanQuery
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  return {
    $and: searchTerms.map((term) => {
      const searchRegex = createSearchRegex(term);

      return {
        $or: [
          {
            title: searchRegex
          },
          {
            description: searchRegex
          },
          {
            category: searchRegex
          },
          {
            code: searchRegex
          }
        ]
      };
    })
  };
};