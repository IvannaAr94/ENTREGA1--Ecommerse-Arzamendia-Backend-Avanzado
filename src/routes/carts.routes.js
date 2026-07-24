// =====================================================
// ROUTER: carts.routes.js
// Gestiona los carritos utilizando MongoDB.
//
// Incluye:
// - Crear un carrito.
// - Consultar un carrito con populate.
// - Agregar productos.
// - Eliminar un producto.
// - Actualizar todos los productos.
// - Modificar únicamente una cantidad.
// - Vaciar completamente el carrito.
// =====================================================

import { Router } from 'express';
import mongoose from 'mongoose';

import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

const router = Router();

// =====================================================
// FUNCIÓN AUXILIAR: VALIDAR OBJECTID
// =====================================================

/**
 * Comprueba que un ID tenga el formato válido
 * utilizado por MongoDB.
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// POST /api/carts
// Crea un carrito nuevo y vacío.
// =====================================================

router.post('/', async (req, res, next) => {
  try {
    // MongoDB genera automáticamente el _id del carrito.
    const newCart = await Cart.create({
      products: []
    });

    res.status(201).json({
      status: 'success',
      message: 'Carrito creado correctamente.',
      payload: newCart
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET /api/carts/:cid
// Obtiene un carrito con sus productos completos.
// =====================================================

router.get('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del carrito no es válido.'
      });
    }

    /**
     * populate reemplaza el ObjectId guardado en: products.product
     *por todos los datos del producto relacionado.
     */
    const cart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado.'
      });
    }

    res.json({
      status: 'success',
      payload: cart
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// POST /api/carts/:cid/products/:pid
// Agrega un producto al carrito.
//
// Si el producto ya existe, aumenta quantity en 1.
// =====================================================

router.post('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del carrito no es válido.'
      });
    }

    if (!isValidObjectId(pid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del producto no es válido.'
      });
    }

    // Comprobamos que el producto exista en MongoDB.
    const productExists = await Product.findById(pid);

    if (!productExists) {
      return res.status(404).json({
        status: 'error',
        message: 'No se puede agregar: el producto no existe.'
      });
    }

    // Buscamos el carrito.
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado.'
      });
    }

    /**
     * Buscamos si el producto ya está dentro del carrito.
     *
     * Como product es un ObjectId, usamos equals() para compararlo correctamente.
     */
    const existingProduct = cart.products.find((item) =>
      item.product.equals(pid)
    );

    if (existingProduct) {
      // Si ya existe, aumentamos la cantidad.
      existingProduct.quantity += 1;
    } else {
      // Si todavía no existe, lo agregamos con cantidad 1.
      cart.products.push({
        product: pid,
        quantity: 1
      });
    }

    await cart.save();

    // Devolvemos el carrito con los productos completos.
    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    res.json({
      status: 'success',
      message: 'Producto agregado al carrito.',
      payload: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// COMPATIBILIDAD CON LA RUTA ANTERIOR
// POST /api/carts/:cid/product/:pid
//
// Conservamos temporalmente la ruta con "product"
// en singular para no romper pruebas anteriores.
// =====================================================

router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del carrito o del producto no es válido.'
      });
    }

    const productExists = await Product.findById(pid);

    if (!productExists) {
      return res.status(404).json({
        status: 'error',
        message: 'No se puede agregar: el producto no existe.'
      });
    }

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado.'
      });
    }

    const existingProduct = cart.products.find((item) =>
      item.product.equals(pid)
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({
        product: pid,
        quantity: 1
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    res.json({
      status: 'success',
      message: 'Producto agregado al carrito.',
      payload: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// DELETE /api/carts/:cid/products/:pid
// Elimina un producto específico del carrito.
// =====================================================

router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del carrito no es válido.'
      });
    }

    if (!isValidObjectId(pid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del producto no es válido.'
      });
    }

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado.'
      });
    }

    const originalLength = cart.products.length;

    // Conservamos solamente los productos diferentes al pid recibido.
    cart.products = cart.products.filter(
      (item) => !item.product.equals(pid)
    );

    if (cart.products.length === originalLength) {
      return res.status(404).json({
        status: 'error',
        message: 'El producto no pertenece a este carrito.'
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    res.json({
      status: 'success',
      message: 'Producto eliminado del carrito.',
      payload: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// PUT /api/carts/:cid
// Reemplaza todos los productos del carrito.
//
// Puede recibir:
//
// [
//   {
//     "product": "OBJECT_ID",
//     "quantity": 2
//   }
// ]
//
// También acepta:
// {
//   "products": [
//     {
//       "product": "OBJECT_ID",
//       "quantity": 2
//     }
//   ]
// }
// =====================================================

router.put('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del carrito no es válido.'
      });
    }

    // Permitimos las dos formas de body explicadas arriba.
    const products = Array.isArray(req.body)
      ? req.body
      : req.body.products;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe enviar un arreglo de productos.'
      });
    }

    // Validamos cada elemento antes de actualizar el carrito.
    for (const item of products) {
      if (!item.product || !isValidObjectId(item.product)) {
        return res.status(400).json({
          status: 'error',
          message: 'Todos los productos deben tener un ObjectId válido.'
        });
      }

      if (
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Cada quantity debe ser un número entero mayor que 0.'
        });
      }

      const productExists = await Product.exists({
        _id: item.product
      });

      if (!productExists) {
        return res.status(404).json({
          status: 'error',
          message: `El producto ${item.product} no existe.`
        });
      }
    }

    // Normalizamos las cantidades antes de guardar.
    const normalizedProducts = products.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity)
    }));

    const updatedCart = await Cart.findByIdAndUpdate(
      cid,
      {
        products: normalizedProducts
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('products.product');

    if (!updatedCart) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado.'
      });
    }

    res.json({
      status: 'success',
      message: 'Productos del carrito actualizados correctamente.',
      payload: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// PUT /api/carts/:cid/products/:pid
// Modifica solamente la cantidad de un producto.
// =====================================================

router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const quantity = Number(req.body.quantity);

    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del carrito no es válido.'
      });
    }

    if (!isValidObjectId(pid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del producto no es válido.'
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'quantity debe ser un número entero mayor que 0.'
      });
    }

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado.'
      });
    }

    const cartProduct = cart.products.find((item) =>
      item.product.equals(pid)
    );

    if (!cartProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'El producto no pertenece a este carrito.'
      });
    }

    // Solamente modificamos la cantidad.
    cartProduct.quantity = quantity;

    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    res.json({
      status: 'success',
      message: 'Cantidad actualizada correctamente.',
      payload: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// DELETE /api/carts/:cid
// Vacía completamente el carrito.
//
// No elimina el documento del carrito.
// Solamente deja products como un arreglo vacío.
// =====================================================

router.delete('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del carrito no es válido.'
      });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cid,
      {
        products: []
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedCart) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado.'
      });
    }

    res.json({
      status: 'success',
      message: 'Carrito vaciado correctamente.',
      payload: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

export default router;