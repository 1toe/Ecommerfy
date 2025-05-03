// Middleware para verificar token personalizado
const verifyCustomToken = async (req, res, next) => {
  try {
    const customToken = req.headers.authorization?.split('Bearer ')[1];
    if (!customToken) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    // Verificar si el token coincide con el valor esperado (clave API o número de proyecto)
    if (customToken === 'AlzaSyBMiZZmHLiSJyTQP_hvCClp2dlaixCgVyw' || 
        customToken === '512446977355') {
      // Puedes establecer un usuario predeterminado o admin
      req.user = { 
        uid: 'app-334-admin',
        isAdmin: true,
        name: 'Usuario API POSTMAN',
        projectId: 'app-334',
        projectNumber: '512446977355'
      };
      next();
    } else {
      return res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    console.error('Error al verificar token personalizado:', error);
    return res.status(401).json({ error: 'Error en procesamiento de token' });
  }
};

module.exports = { verifyCustomToken };
