// =====================================================
// ARCHIVO PRINCIPAL: app.js
// Levanta el servidor Express, configura JSON,
// conecta las rutas y escucha en el puerto 8080.
// =====================================================

import express from 'express';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = 8080;

// Permite que Express pueda leer JSON enviado desde Insomnia/Postman.
app.use(express.json());

// Ruta inicial simple para comprobar que el servidor funciona.
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Ecommerce Moderna funcionando correctamente ',
    endpoints: {
      products: '/api/products',
      carts: '/api/carts'
    }
  });
});

// Rutas principales
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Middleware para rutas inexistentes.
app.use(notFoundHandler);

// Middleware general de errores.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor Ecommerce Moderno escuchando en http://localhost:${PORT}`);
});
