// =====================================================
// MANAGER: CartManager.js
// ¿Qué hace esta clase?
// Se encarga de crear carritos, buscarlos por id y
// agregar productos aumentando quantity si ya existían.
// =====================================================

import { readJsonFile, writeJsonFile } from '../utils/fileSystem.js';

export default class CartManager {
  constructor(filePath) {
    // Guarda la ruta del archivo JSON donde viven los carritos.
    this.filePath = filePath;
  }

  // POST /api/carts
  // Crea un carrito nuevo vacío.
  async createCart() {
    const carts = await readJsonFile(this.filePath, []);

    const newCart = {
      id: `cart_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
    return carts.find((cart) => cart.id === cartId);
  }

  // POST /api/carts/:cid/product/:pid
  // Agrega un producto al carrito.
  // Si ya estaba en el carrito, aumenta quantity en 1.
  async addProductToCart(cartId, productId) {
    const carts = await readJsonFile(this.filePath, []);
    const cartIndex = carts.findIndex((cart) => cart.id === cartId);

    if (cartIndex === -1) return null;

    const productInCart = carts[cartIndex].products.find((item) => item.product === productId);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      carts[cartIndex].products.push({
        product: productId,
        quantity: 1
      });
    }

    await writeJsonFile(this.filePath, carts);
    return carts[cartIndex];
  }
}
