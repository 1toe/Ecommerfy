const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();
const { isAdmin } = require('../middleware/auth');

// GET todos los productos - accesible para todos los usuarios autenticados
router.get('/', async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET un producto por ID - accesible para todos los usuarios autenticados
router.get('/:id', async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const product = await productRef.get();
    
    if (!product.exists) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    res.json({
      success: true,
      product: {
        id: product.id,
        ...product.data()
      }
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear un nuevo producto - solo admin
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    
    // Validación de campos obligatorios
    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Los campos name, price y category son obligatorios' 
      });
    }
    
    const productData = {
      name,
      description: description || '',
      price: Number(price),
      image: image || '',
      category,
      stock: Number(stock) || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const productRef = await db.collection('products').add(productData);
    
    res.status(201).json({
      success: true,
      productId: productRef.id,
      product: {
        id: productRef.id,
        ...productData
      }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT actualizar un producto - solo admin
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    const productRef = db.collection('products').doc(req.params.id);
    
    // Verificar si el producto existe
    const product = await productRef.get();
    if (!product.exists) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    // Construir objeto con datos actualizados
    const updatedData = {};
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (price !== undefined) updatedData.price = Number(price);
    if (image !== undefined) updatedData.image = image;
    if (category !== undefined) updatedData.category = category;
    if (stock !== undefined) updatedData.stock = Number(stock);
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await productRef.update(updatedData);
    
    const updatedProduct = await productRef.get();
    
    res.json({
      success: true,
      product: {
        id: updatedProduct.id,
        ...updatedProduct.data()
      }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar un producto - solo admin
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    
    // Verificar si el producto existe
    const product = await productRef.get();
    if (!product.exists) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    // Verificar si el producto está en algún carrito
    const cartsSnapshot = await db.collection('carts')
      .where('productId', '==', req.params.id)
      .get();
    
    if (!cartsSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar el producto porque está en uno o más carritos de compra' 
      });
    }
    
    await productRef.delete();
    
    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET productos por categoría
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const productsSnapshot = await db.collection('products')
      .where('category', '==', category)
      .get();
    
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST buscar productos
router.post('/search', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    if (!searchTerm) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere un término de búsqueda' 
      });
    }
    
    // Obtener todos los productos (Firestore no tiene búsqueda de texto nativa)
    const productsSnapshot = await db.collection('products').get();
    
    const products = [];
    const searchTermLower = searchTerm.toLowerCase();
    
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      
      // Buscar en nombre y descripción
      if (product.name.toLowerCase().includes(searchTermLower) || 
          product.description.toLowerCase().includes(searchTermLower)) {
        products.push({
          id: doc.id,
          ...product
        });
      }
    });
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
