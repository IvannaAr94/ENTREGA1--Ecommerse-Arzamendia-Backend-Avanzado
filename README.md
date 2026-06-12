# Entrega N° 1 - Ecommerce Moderno Backend Avanzado

API backend para gestionar **productos** y **carritos de compra** usando **Node.js + Express**.  
La información se guarda en archivos JSON: `products.json` y `carts.json`.

---

## ¿Qué incluye este proyecto?

- Servidor con Express en el puerto **8080**.
- Rutas para productos en `/api/products`.
- Rutas para carritos en `/api/carts`.
- Persistencia con archivos JSON.
- Código comentado para entender qué hace cada parte.
- Productos de ejemplo con estilo ecommerce moderno.
- IDs simples autogenerados: 1, 2, 3, 4...
- Validaciones básicas para evitar datos incompletos.

---

## Estructura del proyecto

```txt
ENTREGA1-ARZAMENDIA-Ecommerce-Backend-Avanzado-IDS-Simples/
│
├── data/
│   ├── products.json
│   └── carts.json
│
├── src/
│   ├── managers/
│   │   ├── ProductManager.js
│   │   └── CartManager.js
│   │
│   ├── middlewares/
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   ├── products.routes.js
│   │   └── carts.routes.js
│   │
│   ├── utils/
│   │   ├── fileSystem.js
│   │   └── validators.js
│   │
│   └── app.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## Comandos para usar en Windows desde la terminal de Visual Studio Code

### 1. Entrar a la carpeta del proyecto

```bash
cd ENTREGA1-ARZAMENDIA-Ecommerce-Backend-Avanzado-IDS-Simples
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar el servidor

```bash
npm run dev
```

También se puede usar:

```bash
npm start
```

### 4. Abrir en el navegador

```txt
http://localhost:8080
```

---

## Endpoints de productos

### Listar todos los productos

```http
GET http://localhost:8080/api/products
```

### Buscar producto por ID

```http
GET http://localhost:8080/api/products/1
```

### Crear producto

```http
POST http://localhost:8080/api/products
```

Body JSON para Insomnia:

```json
{
  "title": "Teclado Mecánico Lumina",
  "description": "Teclado mecánico compacto con retroiluminación y switches silenciosos.",
  "code": "TEC-LUM-004",
  "price": 73999,
  "status": true,
  "stock": 20,
  "category": "perifericos",
  "thumbnails": ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae"]
}
```

### Actualizar producto

```http
PUT http://localhost:8080/api/products/1
```

Body JSON de ejemplo:

```json
{
  "price": 79999,
  "stock": 10
}
```

### Eliminar producto

```http
DELETE http://localhost:8080/api/products/1
```

---

## Endpoints de carritos

### Crear carrito vacío

```http
POST http://localhost:8080/api/carts
```

### Ver productos de un carrito

```http
GET http://localhost:8080/api/carts/1
```

### Agregar producto a un carrito

```http
POST http://localhost:8080/api/carts/1/product/1
```

Importante: si el producto ya existe en el carrito, no se duplica. Solo aumenta `quantity` en 1.

---

## Subir a GitHub

acordarme***No subir la carpeta `node_modules`. Ya está ignorada en `.gitignore`.

```bash
git init
git add .
git commit -m "Entrega 1 ecommerce backend avanzado"
git branch -M main
git remote add origin https://github.com/IvannaAr94/ENTREGA1--Ecommerse-Arzamendia-Backend-Avanzado.git
git push -u origin main
```

Si el repositorio ya estaba conectado, usar solamente:

```bash
git add .
git commit -m "Completo entrega 1 ecommerce backend avanzado"
git push
```

---

## Links rápidos para Insomnia con IDs

URLs:

```txt
GET    http://localhost:8080/api/products
GET    http://localhost:8080/api/products/1
POST   http://localhost:8080/api/products
PUT    http://localhost:8080/api/products/2
DELETE http://localhost:8080/api/products/3
POST   http://localhost:8080/api/carts
GET    http://localhost:8080/api/carts/1
POST   http://localhost:8080/api/carts/1/product/1
```
