// =====================================================
// MODELO DE PRODUCTOS
// Define la estructura de los productos en MongoDB.
// =====================================================

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // Importamos el plugin de paginación

// Creamos el esquema que describe qué campos tendrá
// cada producto guardado en la base de datos.
const productSchema = new mongoose.Schema(
    {
        // Nombre del producto.
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Descripción detallada del producto.
        description: {
            type: String,
            required: true,
            trim: true
        },

        // Código único del producto.
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // Precio del producto.
        price: {
            type: Number,
            required: true,
            min: 0
        },

        // Indica si el producto está disponible.
        status: {
            type: Boolean,
            default: true
        },

        // Cantidad disponible en stock.
        stock: {
            type: Number,
            required: true,
            min: 0
        },

        // Categoría del producto.
        category: {
            type: String,
            required: true,
            trim: true
        },

        // Lista opcional de imágenes.
        thumbnails: {
            type: [String],
            default: []
        }
    },
    {
        // Agrega automáticamente createdAt y updatedAt.
        timestamps: true,

        // Evita que Mongoose agregue el campo __v.
        versionKey: false
    }
);

// =====================================================
// PLUGIN DE PAGINACIÓN
// Agrega el método Product.paginate() al modelo.
// =====================================================

productSchema.plugin(mongoosePaginate);

// Creamos el modelo Product.
// MongoDB guardará estos documentos en una colección
// llamada "products".
const Product = mongoose.model('Product', productSchema);

export default Product;