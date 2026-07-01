// =====================================================
// ROUTER: views.routes.js
// Maneja las vistas con Handlebars.
// =====================================================

import { Router } from 'express';
import path from 'path';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productsPath = path.resolve('data/products.json');
const productManager = new ProductManager(productsPath);

// GET /
// Vista home.handlebars con todos los productos cargados.
router.get('/', async (req, res, next) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', {
      title: 'Entrega 2 - Home',
      products
    });
  } catch (error) {
    next(error);
  }
});

// GET /realtimeproducts
// Vista que se actualiza automáticamente usando WebSockets.
router.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', {
      title: 'Productos en tiempo real',
      products
    });
  } catch (error) {
    next(error);
  }
});

export default router;
