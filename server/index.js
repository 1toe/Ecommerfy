const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const dotenv = require('dotenv');

dotenv.config();

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar middleware personalizado
const { verifyCustomToken } = require('./middleware/custom-auth');

// Rutas con autenticación personalizada
const productsRoutes = require('./routes/products');
app.use('/api/products', verifyCustomToken, productsRoutes);

// Ruta para verificar si un usuario es administrador
app.get('/api/admin/check', verifyCustomToken, (req, res) => {
  return res.json({ isAdmin: req.user?.isAdmin === true });
});

// Ruta para health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
