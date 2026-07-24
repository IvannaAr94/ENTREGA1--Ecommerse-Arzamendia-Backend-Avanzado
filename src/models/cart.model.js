// =====================================================
// MODELO DE CARRITOS
// Define cómo se almacenan los carritos en MongoDB.
// =====================================================

import mongoose from 'mongoose';

// =====================================================
// SUBESQUEMA DE PRODUCTOS DEL CARRITO
// =====================================================

// Este esquema representa cada producto dentro del carrito.
const cartProductSchema = new mongoose.Schema(
    {
        // Guarda la referencia al producto original.
        // No se copia todo el producto dentro del carrito:
        // solamente se almacena su ObjectId.
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        // Indica cuántas unidades de ese producto
        // fueron agregadas al carrito.
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        }
    },
    {
        // Evita que MongoDB cree un _id adicional
        // para cada elemento del arreglo products.
        _id: false
    }
);

// =====================================================
// ESQUEMA PRINCIPAL DEL CARRITO
// =====================================================

const cartSchema = new mongoose.Schema(
    {
        // Arreglo con los productos agregados al carrito.
        products: {
            type: [cartProductSchema],
            default: []
        }
    },
    {
        // Agrega createdAt y updatedAt automáticamente.
        timestamps: true,

        // Evita que se agregue el campo __v.
        versionKey: false
    }
);

// Creamos el modelo Cart.
// MongoDB utilizará una colección llamada "carts".
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;