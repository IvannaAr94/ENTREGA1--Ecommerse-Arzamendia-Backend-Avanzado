// =====================================================
// ROUTER: products.routes.js
// Define todos los endpoints de productos:
// GET, GET por id, POST, PUT y DELETE.
// =====================================================

import { Router } from 'express';
import path from 'path';
import ProductManager from '../managers/ProductManager.js';
import { validateProductFields } from '../utils/validators.js';

const router = Router();
const productsPath = path.resolve('data/products.json');
const productManager = new ProductManager(productsPath);

// GET /api/products
// Lista todos los productos.
router.get('/', async (req, res, next) => {
  try {
    const products = await productManager.getProducts();
    res.json({ status: 'success', payload: products });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:pid
// Devuelve un producto por id.
router.get('/:pid', async (req, res, next) => {
  try {
    const product = await productManager.getProductById(req.params.pid);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado.' });
    }

    res.json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products
// Crea un producto nuevo. El id se genera automáticamente.
router.post('/', async (req, res, next) => {
  try {
    const validation = validateProductFields(req.body);

    if (!validation.isValid) {
      return res.status(400).json({ status: 'error', message: validation.message });
    }

    const newProduct = await productManager.addProduct(req.body);

    // Si se crea un producto por HTTP, avisamos también a la vista realtime.
    const io = req.app.get('socketio');
    const products = await productManager.getProducts();
    io.emit('productsList', products);

    res.status(201).json({ status: 'success', message: 'Producto creado correctamente.', payload: newProduct });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// PUT /api/products/:pid
// Actualiza un producto. No permite cambiar el id.
router.put('/:pid', async (req, res, next) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado.' });
    }

    res.json({ status: 'success', message: 'Producto actualizado correctamente.', payload: updatedProduct });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:pid
// Elimina un producto por id.
router.delete('/:pid', async (req, res, next) => {
  try {
    const deleted = await productManager.deleteProduct(req.params.pid);

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado.' });
    }

    // Si se elimina un producto por HTTP, avisamos también a la vista realtime.
    const io = req.app.get('socketio');
    const products = await productManager.getProducts();
    io.emit('productsList', products);

    res.json({ status: 'success', message: 'Producto eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
});

export default router;
