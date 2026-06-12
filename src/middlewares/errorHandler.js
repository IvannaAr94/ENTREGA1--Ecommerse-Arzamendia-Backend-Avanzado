// =====================================================
// MIDDLEWARE: errorHandler.js
// Captura errores inesperados para responder prolijoo
// y evitar que el servidor se rompa sin explicación.
// =====================================================

export function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada. Revisá la URL o el método HTTP usado.'
  });
}

export function errorHandler(error, req, res, next) {
  console.error('Error interno:', error.message);

  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor.',
    detail: error.message
  });
}
