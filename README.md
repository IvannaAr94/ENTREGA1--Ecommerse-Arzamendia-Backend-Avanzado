# Entrega N° 2 - Ecommerce Backend Avanzado

Proyecto backend para gestionar productos y carritos usando **Node.js**, **Express**, **Handlebars** y **Socket.io**.

La información se guarda en archivos JSON dentro de la carpeta `data`.

---

## ¿Qué incluye esta entrega?

- Servidor con Express en el puerto **8080**.
- Motor de plantillas **Handlebars** configurado.
- Servidor de WebSockets con **Socket.io**.
- Vista `home.handlebars` en el endpoint `/`.
- Vista `realTimeProducts.handlebars` en el endpoint `/realtimeproducts`.
- Lista de productos actualizada automáticamente al crear o eliminar productos.
- Formulario en la vista realtime para crear productos usando WebSockets.
- Botón para eliminar productos usando WebSockets.
- Rutas API de productos y carritos de la Entrega 1 conservadas.
- Persistencia en `products.json` y `carts.json`.

---

## Estructura del proyecto

```txt
ENTREGA2-Arzamendia-Backend-Avanzado/
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
│   ├── public/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── realtimeproducts.js
│   │
│   ├── routes/
│   │   ├── products.routes.js
│   │   ├── carts.routes.js
│   │   └── views.routes.js
│   │
│   ├── utils/
│   │   ├── fileSystem.js
│   │   └── validators.js
│   │
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars
│   │   ├── home.handlebars
│   │   └── realTimeProducts.handlebars
│   │
│   └── app.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## Comandos para usar en Windows desde Visual Studio Code

### 1. Entrar a la carpeta del proyecto

```bash
cd ENTREGA2-Arzamendia-Backend-Avanzado
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

---

## Vistas solicitadas por la consigna

### Home

```txt
http://localhost:8080/
```

Muestra la lista de productos usando `home.handlebars`.

### Real Time Products

```txt
http://localhost:8080/realtimeproducts
```

Muestra la lista de productos usando `realTimeProducts.handlebars`.

En esta vista se puede:

- Crear un producto desde el formulario.
- Eliminar productos con el botón **Eliminar**.
- Ver la actualización automática de la lista sin recargar la página.

---

## Endpoints de productos

### Listar productos

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

### Eliminar producto

```http
DELETE http://localhost:8080/api/products/1
```

---

## Endpoints de carritos

### Crear carrito

```http
POST http://localhost:8080/api/carts
```

### Ver carrito

```http
GET http://localhost:8080/api/carts/1
```

### Agregar producto al carrito

```http
POST http://localhost:8080/api/carts/1/product/1
```

---

## Subir cambios al mismo repositorio de GitHub

Como se usa el mismo repositorio de la Entrega 1, no hace falta crear otro remoto. Desde la carpeta del proyecto:

```bash
git status
git add .
git commit -m "Entrega 2 handlebars y websockets"
git push origin main
```

Repositorio:

```txt
https://github.com/IvannaAr94/ENTREGA1--Ecommerse-Arzamendia-Backend-Avanzado
```

---

## Importante

No subir la carpeta `node_modules`. Ya está ignorada por `.gitignore`.
