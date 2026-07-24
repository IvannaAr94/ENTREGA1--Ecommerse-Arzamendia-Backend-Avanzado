// =====================================================
// ARCHIVO PRINCIPAL: app.js
// Entrega Final - Backend I
//
// Configura:
// - Variables de entorno.
// - Conexión con MongoDB.
// - Express.
// - Handlebars.
// - Socket.io.
// - Rutas y middlewares.
// =====================================================

// Carga las variables configuradas en el archivo .env.
// Debe importarse antes de utilizar process.env.
import 'dotenv/config';

import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Conexión con MongoDB.
import connectDB from './config/db.js';

// Modelo de productos.
import Product from './models/product.model.js';

// Routers de la aplicación.
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';

// Middlewares de errores.
import {
  notFoundHandler,
  errorHandler
} from './middlewares/errorHandler.js';

// =====================================================
// CONFIGURACIÓN DE RUTAS INTERNAS
// =====================================================

// En módulos ES no existen directamente __filename y __dirname.
// Estas líneas permiten obtener la ubicación real de app.js.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// CREACIÓN DEL SERVIDOR
// =====================================================

const app = express();

// Creamos un servidor HTTP para compartirlo entre Express y Socket.io.
const httpServer = createServer(app);

// Inicializamos Socket.io sobre el servidor HTTP.
const io = new Server(httpServer);

// Toma el puerto desde .env.
// Si PORT no existe, utiliza 8080 como valor predeterminado.
const PORT = process.env.PORT || 8080;

// =====================================================
// MIDDLEWARES GENERALES
// =====================================================

// Permite recibir información en formato JSON.
app.use(express.json());

// Permite recibir información enviada desde formularios HTML.
app.use(express.urlencoded({ extended: true }));

// Publica los archivos CSS y JavaScript del frontend.
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// CONFIGURACIÓN DE HANDLEBARS
// =====================================================

// Registramos Handlebars como motor de plantillas.
app.engine('handlebars', engine());

// Definimos Handlebars como motor de vistas.
app.set('view engine', 'handlebars');

// Indicamos dónde se encuentran las vistas.
app.set('views', path.join(__dirname, 'views'));

// =====================================================
// SOCKET.IO DISPONIBLE EN LAS RUTAS
// =====================================================

// Guardamos la instancia de Socket.io dentro de Express.
// Así puede recuperarse desde una ruta usando:
// req.app.get('socketio')
app.set('socketio', io);

// =====================================================
// RUTAS
// =====================================================

// Rutas para renderizar vistas con Handlebars.
app.use('/', viewsRouter);

// Endpoints de productos.
app.use('/api/products', productsRouter);

// Endpoints de carritos.
app.use('/api/carts', cartsRouter);

// =====================================================
// CONEXIÓN WEBSOCKET
// Permite crear y eliminar productos en tiempo real
// utilizando MongoDB como sistema de persistencia.
// =====================================================

io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado por WebSocket:', socket.id);

  try {
    // Obtenemos la lista inicial directamente desde MongoDB.
    // lean() convierte los documentos de Mongoose en objetos simples.
    const products = await Product.find().lean();

    // Enviamos los productos al cliente recién conectado.
    socket.emit('productsList', products);
  } catch (error) {
    socket.emit(
      'productError',
      'No se pudo obtener la lista inicial de productos.'
    );
  }

  // ===================================================
  // CREAR PRODUCTO EN TIEMPO REAL
  // ===================================================

  socket.on('addProduct', async (productData) => {
    try {
      // Preparamos los datos recibidos desde el formulario.
      const productToCreate = {
        ...productData,

        // Los formularios envían texto, por eso convertimos
        // price y stock al tipo Number.
        price: Number(productData.price),
        stock: Number(productData.stock),

        // Convertimos status a booleano.
        status:
          productData.status === undefined
            ? true
            : productData.status === true ||
            productData.status === 'true',

        // Si se envía una URL, se guarda dentro de un arreglo.
        thumbnails: productData.thumbnails
          ? [productData.thumbnails]
          : []
      };

      // Guardamos el producto directamente en MongoDB.
      await Product.create(productToCreate);

      // Consultamos nuevamente la lista actualizada.
      const updatedProducts = await Product.find().lean();

      // Enviamos la lista nueva a todos los clientes conectados.
      io.emit('productsList', updatedProducts);
    } catch (error) {
      // Código 11000: ya existe un producto con el mismo code.
      if (error.code === 11000) {
        socket.emit(
          'productError',
          'Ya existe un producto con ese código.'
        );
        return;
      }

      socket.emit('productError', error.message);
    }
  });

  // ===================================================
  // ELIMINAR PRODUCTO EN TIEMPO REAL
  // ===================================================

  socket.on('deleteProduct', async (productId) => {
    try {
      // Eliminamos el producto por su ObjectId de MongoDB.
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
        socket.emit('productError', 'Producto no encontrado.');
        return;
      }

      // Consultamos nuevamente la lista actualizada.
      const updatedProducts = await Product.find().lean();

      // Actualizamos la lista para todos los clientes conectados.
      io.emit('productsList', updatedProducts);
    } catch (error) {
      socket.emit(
        'productError',
        'El ID del producto no es válido o no pudo eliminarse.'
      );
    }
  });
});

// =====================================================
// MIDDLEWARES DE ERRORES
// =====================================================

// Se ejecuta cuando ninguna ruta coincide con la petición.
app.use(notFoundHandler);

// Maneja los errores generales de la aplicación.
app.use(errorHandler);

// =====================================================
// INICIO DE LA APLICACIÓN
// =====================================================

/**
 * Primero conecta MongoDB y después inicia el servidor.
 *
 * De esta manera evitamos aceptar peticiones antes de que
 * la base de datos esté disponible.
 */
const startServer = async () => {
  // Conectamos con MongoDB utilizando la URL del archivo .env.
  await connectDB();

  // Iniciamos el servidor HTTP.
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Servidor funcionando en http://localhost:${PORT}`
    );

    console.log(
      `🏠 Vista principal: http://localhost:${PORT}/`
    );

    console.log(
      `⚡ Vista en tiempo real: http://localhost:${PORT}/realtimeproducts`
    );
  });
};

// Ejecutamos la función que inicia toda la aplicación.
startServer();