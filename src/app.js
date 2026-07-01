// =====================================================
// ARCHIVO PRINCIPAL: app.js
// Entrega 2 - Backend Avanzado
// Configura Express, Handlebars y Socket.io.
// =====================================================

import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';
import ProductManager from './managers/ProductManager.js';
import { validateProductFields } from './utils/validators.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;

const productsPath = path.resolve('data/products.json');
const productManager = new ProductManager(productsPath);

// Permite leer JSON y datos de formularios.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos para JS y CSS del frontend.
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars.
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Guardamos io dentro de app para poder usarlo en rutas HTTP.
app.set('socketio', io);

// Rutas de vistas.
app.use('/', viewsRouter);

// Rutas API.
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Conexión WebSocket.
io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado por WebSocket:', socket.id);

  // Enviamos la lista inicial al cliente que entra a /realtimeproducts.
  const products = await productManager.getProducts();
  socket.emit('productsList', products);

  // Crear producto desde el formulario de realTimeProducts.handlebars.
  socket.on('addProduct', async (productData) => {
    try {
      const productToCreate = {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        status: productData.status === true || productData.status === 'true',
        thumbnails: productData.thumbnails ? [productData.thumbnails] : []
      };

      const validation = validateProductFields(productToCreate);
      if (!validation.isValid) {
        socket.emit('productError', validation.message);
        return;
      }

      await productManager.addProduct(productToCreate);
      const updatedProducts = await productManager.getProducts();
      io.emit('productsList', updatedProducts);
    } catch (error) {
      socket.emit('productError', error.message);
    }
  });

  // Eliminar producto desde el botón de la vista en tiempo real.
  socket.on('deleteProduct', async (productId) => {
    try {
      const deleted = await productManager.deleteProduct(productId);

      if (!deleted) {
        socket.emit('productError', 'Producto no encontrado.');
        return;
      }

      const updatedProducts = await productManager.getProducts();
      io.emit('productsList', updatedProducts);
    } catch (error) {
      socket.emit('productError', error.message);
    }
  });
});

// Middleware para rutas inexistentes.
app.use(notFoundHandler);

// Middleware general de errores.
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Servidor Entrega 2 funcionando en http://localhost:${PORT}`);
  console.log(`Vista normal: http://localhost:${PORT}/`);
  console.log(`Vista realtime: http://localhost:${PORT}/realtimeproducts`);
});
