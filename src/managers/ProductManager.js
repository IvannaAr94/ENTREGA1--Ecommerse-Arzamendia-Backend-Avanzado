// =====================================================
// MANAGER: ProductManager.js
// Se encarga de leer, crear, actualizar y eliminar
// productos dentro del archivo data/products.json.
// =====================================================

import { readJsonFile, writeJsonFile } from '../utils/fileSystem.js';

export default class ProductManager {
  constructor(filePath) {
    // Guarda la ruta del archivo JSON donde viven los productos.
    this.filePath = filePath;
  }

  // GENERADOR DE ID SIMPLE
  // Busca el id numérico más alto y suma 1.
  // Ejemplo: si existen 1, 2 y 3, el próximo será 4.
  generateNextId(products) {
    if (products.length === 0) return 1;

    const numericIds = products.map((product) => Number(product.id)).filter((id) => !Number.isNaN(id));
    return Math.max(...numericIds, 0) + 1;
  }

  // GET /api/products
  // Devuelve todos los productos guardados.
  async getProducts() {
    return await readJsonFile(this.filePath, []);
  }

  // GET /api/products/:pid
  // Busca un producto específico por su ID.
  async getProductById(productId) {
    const products = await this.getProducts();
    return products.find((product) => String(product.id) === String(productId));
  }

  // POST /api/products
  // Agrega un producto nuevo y genera el id automáticamente.
  async addProduct(productData) {
    const products = await this.getProducts();

    const codeAlreadyExists = products.some((product) => product.code === productData.code);
    if (codeAlreadyExists) {
      throw new Error('Ya existe un producto con ese código. El code debe ser único.');
    }

    const newProduct = {
      id: this.generateNextId(products),
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: productData.price,
      status: productData.status,
      stock: productData.stock,
      category: productData.category,
      thumbnails: productData.thumbnails || []
    };

    products.push(newProduct);
    await writeJsonFile(this.filePath, products);
    return newProduct;
  }

  // PUT /api/products/:pid
  // Actualiza un producto existente, pero NO permite modificar el ID.
  async updateProduct(productId, updates) {
    const products = await this.getProducts();
    const productIndex = products.findIndex((product) => String(product.id) === String(productId));

    if (productIndex === -1) return null;

    delete updates.id;

    products[productIndex] = {
      ...products[productIndex],
      ...updates
    };

    await writeJsonFile(this.filePath, products);
    return products[productIndex];
  }

  // DELETE /api/products/:pid
  // Elimina un producto según el ID recibido por parámetro.
  async deleteProduct(productId) {
    const products = await this.getProducts();
    const filteredProducts = products.filter((product) => String(product.id) !== String(productId));

    if (products.length === filteredProducts.length) return false;

    await writeJsonFile(this.filePath, filteredProducts);
    return true;
  }
}
