// =====================================================
// MANAGER: CartManager.js
// Se encarga de crear carritos, buscarlos por ID y
// agregar productos aumentando quantity si ya existían.
// =====================================================0

import { readJsonFile, writeJsonFile } from '../utils/fileSystem.js';

export default class CartManager {
  constructor(filePath) {
    // Guarda la ruta del archivo JSON donde viven los carritos.
    this.filePath = filePath;
  }


  // GENERADOR DE ID SIMPLEe
  // Busca el id numérico más alto y suma 1.
  // Ejemplo: si existen 1, 2 y 3, el próximo carrito será 4.
  generateNextId(carts) {
    if (carts.length === 0) return 1;

    const numericIds = carts.map((cart) => Number(cart.id)).filter((id) => !Number.isNaN(id));
    return Math.max(...numericIds, 0) + 1;
  }

  // POST /api/carts
  // Crea un carrito nuevo vacío.
  async createCart() {
    const carts = await readJsonFile(this.filePath, []);

    const newCart = {
      id: this.generateNextId(carts),
      products: []
    };

    carts.push(newCart);
    await writeJsonFile(this.filePath, carts);
    return newCart;
  }

  // GET /api/carts/:cid
  // Devuelve el carrito completo según su id.
  async getCartById(cartId) {
    const carts = await readJsonFile(this.filePath, []);
    return carts.find((cart) => String(cart.id) === String(cartId));
  }

  // POST /api/carts/:cid/product/:pid
  // Agrega un producto al carrito.
  // Si ya estaba en el carrito, aumenta quantity en 1.
  async addProductToCart(cartId, productId) {
    const carts = await readJsonFile(this.filePath, []);
    const cartIndex = carts.findIndex((cart) => String(cart.id) === String(cartId));

    if (cartIndex === -1) return null;

    const productInCart = carts[cartIndex].products.find((item) => String(item.product) === String(productId));

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      carts[cartIndex].products.push({
        product: Number(productId),
        quantity: 1
      });
    }

    await writeJsonFile(this.filePath, carts);
    return carts[cartIndex];
  }
}
