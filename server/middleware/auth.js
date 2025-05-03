const admin = require('firebase-admin');

// Middleware para verificar token
const verifyToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar rol de administrador
const isAdmin = async (req, res, next) => {
  try {
    if (req.user) {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(req.user.uid)
        .get();
      
      if (userDoc.exists && userDoc.data().isAdmin === true) {
        next();
      } else {
        res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
      }
    } else {
      res.status(401).json({ error: 'Usuario no autenticado' });
    }
  } catch (error) {
    console.error('Error al verificar permisos de administrador:', error);
    res.status(500).json({ error: 'Error interno al verificar permisos' });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
