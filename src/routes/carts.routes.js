// =====================================================
// ROUTER: carts.routes.js
// ¿Qué hace este archivo?
// Define todos los endpoints de carritos:
// crear carrito, ver carrito y agregar producto al carrito.
// =====================================================

import { Router } from 'express';
import path from 'path';
import CartManager from '../managers/CartManager.js';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const cartsPath = path.resolve('data/carts.json');
const productsPath = path.resolve('data/products.json');
const cartManager = new CartManager(cartsPath);
const productManager = new ProductManager(productsPath);

// POST /api/carts
// Crea un carrito nuevo vacío.
router.post('/', async (req, res, next) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ status: 'success', message: 'Carrito creado correctamente.', payload: newCart });
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/:cid
// Muestra los productos que pertenecen al carrito indicado.
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
    }

    res.json({ status: 'success', payload: cart.products });
  } catch (error) {
    next(error);
  }
});

// POST /api/carts/:cid/product/:pid
// Agrega un producto al carrito. Si ya existe, aumenta quantity en 1.
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const productExists = await productManager.getProductById(req.params.pid);

    if (!productExists) {
      return res.status(404).json({ status: 'error', message: 'No se puede agregar: el producto no existe.' });
    }

    const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);

    if (!updatedCart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
    }

    res.json({ status: 'success', message: 'Producto agregado al carrito.', payload: updatedCart });
  } catch (error) {
    next(error);
  }
});

export default router;
