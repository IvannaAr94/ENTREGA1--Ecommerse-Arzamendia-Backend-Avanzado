// =====================================================
// ROUTER: views.routes.js
// Maneja las vistas renderizadas con Handlebars.
//
// Incluye:
// - Home
// - Productos en tiempo real
// - Lista de productos con paginación
// - Detalle de un producto
// - Vista de un carrito específico
// =====================================================

import { Router } from 'express';
import mongoose from 'mongoose';

import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';

// Importa el buscador general reutilizable.
import { buildProductSearchFilter } from '../utils/productSearch.js';

const router = Router();

// =====================================================
// FUNCIÓN AUXILIAR
// Valida que un ID tenga formato válido de MongoDB.
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// GET /  >  Vista inicial con todos los productos.
// =====================================================

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().lean();

    res.render('home', {
      title: 'IMAstyle - Inicio',
      products
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET /realtimeproducts
// Vista que utiliza WebSocket para crear y eliminar
// productos en tiempo real.
// =====================================================

router.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await Product.find().lean();

    res.render('realTimeProducts', {
      title: 'IMAstyle - Productos en tiempo real',
      products
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET /products  >  Muestra los productos con paginación.
//
// Query params:
// - limit: cantidad de productos por página.
// - page: página actual.
// - query: categoría o disponibilidad.
// - sort: asc o desc según el precio.
// =====================================================

router.get('/products', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const { query, sort } = req.query;

   // Construye una búsqueda general por nombre, descripción,
// categoría, código o disponibilidad.
const filter = buildProductSearchFilter(query);

    // El ordenamiento solamente se aplica si
    // sort contiene asc o desc.
    let sortOption;

    if (sort === 'asc') {
      sortOption = { price: 1 };
    } else if (sort === 'desc') {
      sortOption = { price: -1 };
    }

    const options = {
      limit,
      page,
      lean: true
    };

    if (sortOption) {
      options.sort = sortOption;
    }

    const result = await Product.paginate(filter, options);

    // Conservamos los parámetros actuales para construir
    // correctamente los enlaces anterior y siguiente.
    const queryParams = new URLSearchParams();

    queryParams.set('limit', limit);

    if (query) {
      queryParams.set('query', query);
    }

    if (sort) {
      queryParams.set('sort', sort);
    }

    const prevLink = result.hasPrevPage
      ? `/products?${queryParams.toString()}&page=${result.prevPage}`
      : null;

    const nextLink = result.hasNextPage
      ? `/products?${queryParams.toString()}&page=${result.nextPage}`
      : null;

    res.render('products', {
      title: 'IMAstyle - Productos',
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      prevLink,
      nextLink,
      selectedQuery: query || '',
      selectedSort: sort || '',
      selectedLimit: limit
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET /products/:pid
// Muestra el detalle completo de un producto.
// =====================================================

router.get('/products/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;

    if (!isValidObjectId(pid)) {
      return res.status(400).render('productDetail', {
        title: 'IMAstyle - Producto no válido',
        error: 'El ID del producto no es válido.'
      });
    }

    const product = await Product.findById(pid).lean();

    if (!product) {
      return res.status(404).render('productDetail', {
        title: 'IMAstyle - Producto no encontrado',
        error: 'El producto solicitado no existe.'
      });
    }

    res.render('productDetail', {
      title: `IMAstyle - ${product.title}`,
      product
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// GET /carts/:cid
// Muestra un carrito específico con populate.
// =====================================================

router.get('/carts/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).render('cart', {
        title: 'IMAstyle - Carrito no válido',
        error: 'El ID del carrito no es válido.'
      });
    }

    const cart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    if (!cart) {
      return res.status(404).render('cart', {
        title: 'IMAstyle - Carrito no encontrado',
        error: 'El carrito solicitado no existe.'
      });
    }

    res.render('cart', {
      title: 'IMAstyle - Carrito',
      cart,
      products: cart.products
    });
  } catch (error) {
    next(error);
  }
});

export default router;