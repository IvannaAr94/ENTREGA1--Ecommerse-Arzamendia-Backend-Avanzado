# 🛒 IMAtecno

## Trabajo Final - Backend I

Proyecto desarrollado para la entrega final de **Backend I - Coderhouse**.

IMAtecno es un ecommerce desarrollado con **Node.js**, **Express**, **MongoDB**, **Mongoose**, **Handlebars** y **Socket.IO**, que permite administrar productos y carritos mediante una API REST y vistas dinámicas.

---

## 🎯 Objetivo del proyecto

Desarrollar un ecommerce completo utilizando Node.js, Express, MongoDB y Handlebars, aplicando una arquitectura basada en rutas, modelos y vistas dinámicas. El proyecto implementa una API REST, persistencia con MongoDB mediante Mongoose, actualización en tiempo real con Socket.IO y una interfaz web que permite gestionar productos y carritos.

---

## 🚀 Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB
- Mongoose
- Handlebars
- Socket.IO
- Dotenv
- JavaScript (ES Modules)
- CSS3

---

## 📋 Requisitos

Antes de ejecutar el proyecto es necesario tener instalado:

- Node.js 20 o superior
- MongoDB
- npm

---

## ✨ Funcionalidades

### Productos

- CRUD completo de productos.
- Persistencia en MongoDB mediante Mongoose.
- Paginación.
- Filtros por categoría.
- Filtros por disponibilidad.
- Ordenamiento por precio.
- Búsqueda mediante Query Params.

### Carritos

- Crear carrito.
- Obtener carrito.
- Agregar productos.
- Eliminar productos.
- Actualizar cantidades.
- Reemplazar todos los productos del carrito.
- Vaciar carrito.
- Relación entre productos y carritos mediante ObjectId.
- Uso de `populate()` para obtener la información completa de los productos.

### Frontend

- Página principal.
- Catálogo de productos.
- Detalle del producto.
- Carrito de compras.
- Vista de productos en tiempo real.
- Diseño responsive.

### Tiempo Real

Implementación mediante Socket.IO para crear y eliminar productos sin necesidad de recargar la página.

---

## 📂 Estructura del proyecto

```text
src
│
├── config
│   └── db.js
│
├── middlewares
│
├── models
│   ├── product.model.js
│   └── cart.model.js
│
├── public
│   ├── css
│   ├── images
│   └── js
│
├── routes
│   ├── products.routes.js
│   ├── carts.routes.js
│   └── views.routes.js
│
├── utils
│   ├── productSearch.js
│   └── validators.js
│
├── views
│   ├── layouts
│   ├── cart.handlebars
│   ├── home.handlebars
│   ├── productDetail.handlebars
│   ├── products.handlebars
│   └── realTimeProducts.handlebars
│
└── app.js
```

---

## ⚙️ Instalación

Clonar el repositorio:

```bash
git clone https://github.com/IvannaAr94/TrabajoFinal-Arzamendia-Backend-I.git
```

Ingresar a la carpeta del proyecto:

```bash
cd TrabajoFinal-Arzamendia-Backend-I
```

Instalar las dependencias:

```bash
npm install
```

---

## 🍃 Variables de entorno

Crear un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
PORT=8080
MONGO_URL=mongodb://127.0.0.1:27017/imatecno_backend
```

> ⚠️ El archivo `.env` no se incluye en el repositorio por razones de seguridad. En su lugar, se proporciona un archivo `.env.example` como referencia.

---

## ▶️ Ejecutar el proyecto

Asegurarse de que MongoDB se encuentre en ejecución.

Luego iniciar el servidor:

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:8080
```

---

## 🌐 Vistas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Página principal |
| `/products` | Catálogo de productos |
| `/products/:pid` | Detalle del producto |
| `/carts/:cid` | Carrito |
| `/realtimeproducts` | Productos en tiempo real |

---

## 📡 Endpoints principales

### Productos

```http
GET    /api/products
GET    /api/products/:pid
POST   /api/products
PUT    /api/products/:pid
DELETE /api/products/:pid
```

### Carritos

```http
POST   /api/carts
GET    /api/carts/:cid
POST   /api/carts/:cid/products/:pid
PUT    /api/carts/:cid
PUT    /api/carts/:cid/products/:pid
DELETE /api/carts/:cid/products/:pid
DELETE /api/carts/:cid
```

---

## 🔎 Query Params

Ejemplos de uso:

```text
/api/products?page=2
/api/products?limit=5
/api/products?sort=asc
/api/products?sort=desc
/api/products?query=Tecnología
/api/products?query=available
```

---

## 👩‍💻 Autora

**Ivanna Arzamendia**

Trabajo Final - Backend I

Coderhouse - 2026
