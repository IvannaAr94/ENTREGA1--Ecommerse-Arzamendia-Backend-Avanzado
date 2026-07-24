// ==========================================================
// CONFIGURACIÓN DE LA CONEXIÓN A MONGODB
// Establece la conexión entre la aplicación y MongoDB.
// ==========================================================

// Importamos Mongoose para conectarnos a MongoDB.
import mongoose from "mongoose";

// Función que establece la conexión con la base de datos.
const connectDB = async () => {
    try {

        // Intentamos conectarnos utilizando la URL almacenada en el archivo .env
        await mongoose.connect(process.env.MONGO_URL);

        console.log("✅ Conectado correctamente a MongoDB");

    } catch (error) {

        console.error("❌ Error al conectar con MongoDB");
        console.error(error.message);

        // Si no se puede conectar, detenemos la aplicación.
        process.exit(1);
    }
};

// Exportamos la función para utilizarla desde app.js
export default connectDB;