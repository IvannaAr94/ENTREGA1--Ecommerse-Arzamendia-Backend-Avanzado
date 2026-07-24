// =====================================================
// ROUTER: products.routes.js
// Gestiona los endpoints de productos utilizando MongoDB.
//
// Incluye:
// - Listado con paginación.
// - Filtros por categoría o disponibilidad.
// - Ordenamiento por precio.
// - Búsqueda por ID.
// - Creación.
// - Actualización.
// - Eliminación.
// =====================================================

import { Router } from 'express';
import mongoose from 'mongoose';

import Product from '../models/product.model.js';
import { validateProductFields } from '../utils/validators.js';

// Importa el buscador general reutilizable.
import { buildProductSearchFilter } from '../utils/productSearch.js';

const router = Router();

// =====================================================
// FUNCIÓN AUXILIAR PARA CREAR LINKS DE PAGINACIÓN
// =====================================================

/**
 * Construye un enlace para una página determinada.
 *
 * Conserva los parámetros actuales de la consulta:
 * limit, query y sort.
 */
const buildPageLink = (req, targetPage) => {
  const params = new URLSearchParams();

  params.set('page', targetPage);
  params.set('limit', req.query.limit || 10);

  if (req.query.query) {
    params.set('query', req.query.query);
  }

  if (req.query.sort) {
    params.set('sort', req.query.sort);
  }

  return `${req.protocol}://${req.get('host')}${req.baseUrl}?${params.toString()}`;
};

// =====================================================
// GET /api/products
// Lista productos con paginación, filtros y ordenamiento.
// =====================================================

router.get('/', async (req, res, next) => {
  try {
    // Convertimos limit y page a números.
    // Si no fueron enviados, usamos los valores predeterminados.
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Parámetros opcionales.
    const { query, sort } = req.query;

    // Validamos que limit y page sean números positivos.
    if (limit < 1 || page < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Los parámetros limit y page deben ser mayores que 0.'
      });
    }

    
    // =================================================
    // FILTRO DE BÚSQUEDA
    // =================================================

  // Construye una búsqueda general por nombre, descripción,
// categoría, código o disponibilidad.
    const filter = buildProductSearchFilter(query);
    

    // =================================================
    // ORDENAMIENTO POR PRECIO
    // =================================================

    const sortOptions = {};

    if (sort === 'asc') {
      sortOptions.price = 1;
    } else if (sort === 'desc') {
      sortOptions.price = -1;
    } else if (sort && sort !== 'asc' && sort !== 'desc') {
      return res.status(400).json({
        status: 'error',
        message: 'El parámetro sort debe ser asc o desc.'
      });
    }

    // =================================================
    // CONSULTAS A MONGODB
    // =================================================

    // Cantidad total de productos que coinciden con el filtro.
    const totalProducts = await Product.countDocuments(filter);

    // Cantidad total de páginas.
    const totalPages = Math.ceil(totalProducts / limit);

    // Productos de la página solicitada.
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Indicadores de paginación.
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    // Links directos a las páginas anterior y siguiente.
    const prevLink = hasPrevPage
      ? buildPageLink(req, prevPage)
      : null;

    const nextLink = hasNextPage
      ? buildPageLink(req, nextPage)
      : null;

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET /api/products/:pid
// Devuelve un producto por su ID de MongoDB.
// =====================================================

router.get('/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;

    // Verificamos que tenga el formato de un ObjectId válido.
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del producto no es válido.'
      });
    }

    const product = await Product.findById(pid).lean();

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado.'
      });
    }

    res.json({
      status: 'success',
      payload: product
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// POST /api/products
// Crea un producto nuevo en MongoDB.
// =====================================================

router.post('/', async (req, res, next) => {
  try {
    // Validamos los campos utilizando la función
    // que ya existía en el proyecto.
    const validation = validateProductFields(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: validation.message
      });
    }

    // Convertimos los campos numéricos y booleanos.
    const productData = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      status:
        req.body.status === undefined
          ? true
          : req.body.status === true ||
          req.body.status === 'true',
      thumbnails: Array.isArray(req.body.thumbnails)
        ? req.body.thumbnails
        : req.body.thumbnails
          ? [req.body.thumbnails]
          : []
    };

    // Creamos el producto en MongoDB.
    const newProduct = await Product.create(productData);

    // Actualizamos la vista en tiempo real.
    const io = req.app.get('socketio');
    const products = await Product.find().lean();

    io.emit('productsList', products);

    res.status(201).json({
      status: 'success',
      message: 'Producto creado correctamente.',
      payload: newProduct
    });
  } catch (error) {
    // MongoDB devuelve el código 11000 cuando se repite
    // un campo definido como único, en este caso code.
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe un producto con ese código.'
      });
    }

    next(error);
  }
});

// =====================================================
// PUT /api/products/:pid
// Actualiza un producto existente.
// =====================================================

router.put('/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del producto no es válido.'
      });
    }

    // Evitamos que el usuario intente modificar el _id.
    const { _id, ...fieldsToUpdate } = req.body;

    if (fieldsToUpdate.price !== undefined) {
      fieldsToUpdate.price = Number(fieldsToUpdate.price);
    }

    if (fieldsToUpdate.stock !== undefined) {
      fieldsToUpdate.stock = Number(fieldsToUpdate.stock);
    }

    if (fieldsToUpdate.status !== undefined) {
      fieldsToUpdate.status =
        fieldsToUpdate.status === true ||
        fieldsToUpdate.status === 'true';
    }

    if (
      fieldsToUpdate.thumbnails !== undefined &&
      !Array.isArray(fieldsToUpdate.thumbnails)
    ) {
      fieldsToUpdate.thumbnails = fieldsToUpdate.thumbnails
        ? [fieldsToUpdate.thumbnails]
        : [];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      pid,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado.'
      });
    }

    // Actualizamos la lista en tiempo real.
    const io = req.app.get('socketio');
    const products = await Product.find().lean();

    io.emit('productsList', products);

    res.json({
      status: 'success',
      message: 'Producto actualizado correctamente.',
      payload: updatedProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe un producto con ese código.'
      });
    }

    next(error);
  }
});

// =====================================================
// DELETE /api/products/:pid
// Elimina un producto por su ID.
// =====================================================

router.delete('/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del producto no es válido.'
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(pid);

    if (!deletedProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado.'
      });
    }

    // Actualizamos la lista en tiempo real.
    const io = req.app.get('socketio');
    const products = await Product.find().lean();

    io.emit('productsList', products);

    res.json({
      status: 'success',
      message: 'Producto eliminado correctamente.',
      payload: deletedProduct
    });
  } catch (error) {
    next(error);
  }
});

export default router;