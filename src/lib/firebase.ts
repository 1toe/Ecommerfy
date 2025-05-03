import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  push,
  child,
  onValue
} from "firebase/database";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sendOrderConfirmationEmailMock as sendOrderConfirmationEmail } from '@/services/email-service';

const firebaseConfig = {
  apiKey: "AIzaSyBMIZZmHLlSJyTQP_hvCCfp2dIaIxCgVyw",
  authDomain: "app-334.firebaseapp.com",
  projectId: "app-334",
  storageBucket: "app-334.firebasestorage.app",
  messagingSenderId: "512446977355",
  appId: "1:512446977355:web:4769f6cf58c46b8b2c44ce",
  databaseURL: "https://app-334-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const functions = getFunctions(app);

// Autenticación
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Productos Firestore
export const getProducts = async () => {
  try {
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, products };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getProductById = async (id: string) => {
  try {
    const productDoc = doc(db, "products", id);
    const productSnapshot = await getDoc(productDoc);

    if (productSnapshot.exists()) {
      const product = { id: productSnapshot.id, ...productSnapshot.data() };
      return { success: true, product };
    } else {
      return { success: false, error: "Producto no encontrado" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getProductsByCategory = async (category: string) => {
  try {
    const db = getDatabase();
    const snapshot = await get(ref(db, `products/${category}`));
    if (snapshot.exists()) {
      const products = [];
      snapshot.forEach((productSnapshot) => {
        const productData = productSnapshot.val();
        products.push({
          id: productSnapshot.key,
          category,
          ...productData
        });
      });
      return { success: true, products };
    }
    return { success: true, products: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const searchProducts = async (searchTerm: string) => {
  try {
    const { success, products } = await getProducts();

    if (success && products) {
      const filteredProducts = products.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { success: true, products: filteredProducts };
    }
    return { success: false, error: "Error al buscar productos" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Productos Realtime Database con estructura por categorías
export const getRealTimeProducts = async () => {
  try {
    const db = getDatabase();
    const snapshot = await get(ref(db, 'products'));
    if (snapshot.exists()) {
      const products = [];
      // Primero iterar por categorías
      snapshot.forEach((categorySnapshot) => {
        const category = categorySnapshot.key;
        // Luego iterar por productos dentro de cada categoría
        categorySnapshot.forEach((productSnapshot) => {
          const productData = productSnapshot.val();
          products.push({
            id: productSnapshot.key,
            category, // Añadir la categoría si no está incluida en el producto
            ...productData
          });
        });
      });
      return { success: true, products };
    }
    return { success: true, products: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getRealTimeProductById = async (id: string) => {
  try {
    const db = getDatabase();
    // Primero necesitamos buscar en todas las categorías
    const categoriesSnapshot = await get(ref(db, 'products'));
    if (categoriesSnapshot.exists()) {
      let foundProduct = null;

      // Buscar en cada categoría
      categoriesSnapshot.forEach((categorySnapshot) => {
        const category = categorySnapshot.key;
        const productSnapshot = categorySnapshot.child(id);

        if (productSnapshot.exists()) {
          foundProduct = {
            id,
            category,
            ...productSnapshot.val()
          };
          return true; // Detiene la iteración
        }
      });

      if (foundProduct) {
        return { success: true, product: foundProduct };
      }
    }
    return { success: false, error: "Producto no encontrado" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createRealTimeProduct = async (category: string, productData: any) => {
  try {
    const db = getDatabase();
    const productId = productData.id || Date.now().toString();
    const productRef = ref(db, `products/${category}/${productId}`);

    // Eliminar la propiedad id si existe (para no duplicarla)
    const { id, ...dataToSave } = productData;

    await set(productRef, dataToSave);
    return {
      success: true,
      productId,
      product: {
        ...dataToSave,
        id: productId,
        category
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateRealTimeProduct = async (category: string, id: string, updates: any) => {
  try {
    const db = getDatabase();
    const productRef = ref(db, `products/${category}/${id}`);
    await update(productRef, updates);

    // Obtener el producto actualizado
    const snapshot = await get(productRef);
    if (snapshot.exists()) {
      return {
        success: true,
        product: {
          id,
          category,
          ...snapshot.val()
        }
      };
    } else {
      return { success: false, error: "Producto no encontrado después de la actualización" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteRealTimeProduct = async (category: string, id: string) => {
  try {
    const db = getDatabase();
    await remove(ref(db, `products/${category}/${id}`));
    return { success: true, message: "Producto eliminado correctamente" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAllCategories = async () => {
  try {
    const db = getDatabase();
    const snapshot = await get(ref(db, 'products'));
    if (snapshot.exists()) {
      const categories = [];
      snapshot.forEach((categorySnapshot) => {
        categories.push(categorySnapshot.key);
      });
      return { success: true, categories };
    }
    return { success: true, categories: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const searchRealTimeProducts = async (searchTerm: string) => {
  try {
    const db = getDatabase();
    const snapshot = await get(ref(db, 'products'));
    if (snapshot.exists()) {
      const products = [];
      const searchTermLower = searchTerm.toLowerCase();

      // Buscar en todas las categorías
      snapshot.forEach((categorySnapshot) => {
        const category = categorySnapshot.key;

        // Buscar en todos los productos de la categoría
        categorySnapshot.forEach((productSnapshot) => {
          const productData = productSnapshot.val();
          const name = productData.name || '';
          const description = productData.description || '';

          if (
            name.toLowerCase().includes(searchTermLower) ||
            description.toLowerCase().includes(searchTermLower)
          ) {
            products.push({
              id: productSnapshot.key,
              category,
              ...productData
            });
          }
        });
      });

      return { success: true, products };
    }
    return { success: true, products: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getNextProductId = async () => {
  try {
    const snapshot = await get(ref(rtdb, 'lastId'));
    let lastId = 1;
    if (snapshot.exists()) {
      lastId = snapshot.val().value || 1;
    }
    return { success: true, nextId: lastId + 1 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLastProductId = async (newId: number) => {
  try {
    await set(ref(rtdb, 'lastId'), { value: newId });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Carrito con Realtime Database
export const addToCart = async (userId: string, productId: string, quantity: number) => {
  try {
    // Primero obtenemos el producto para saber a qué categoría pertenece
    const productResult = await getRealTimeProductById(productId);
    if (!productResult.success || !productResult.product) {
      return { success: false, error: "Producto no encontrado" };
    }

    // Verificar stock disponible
    const product = productResult.product;
    if (product.stock < quantity) {
      return {
        success: false,
        error: `Solo hay ${product.stock} unidades disponibles de este producto`
      };
    }

    // Verificar si el producto ya está en el carrito
    const cartRef = ref(rtdb, `carts/${userId}`);
    const cartSnapshot = await get(cartRef);

    if (cartSnapshot.exists()) {
      // Buscar si el producto ya está en el carrito
      let existingItem = null;
      let existingKey = null;

      cartSnapshot.forEach((childSnapshot) => {
        const item = childSnapshot.val();
        if (item.productId === productId) {
          existingItem = item;
          existingKey = childSnapshot.key;
          return true; // Break the loop
        }
      });

      if (existingItem && existingKey) {
        // Actualizar cantidad
        const newQuantity = existingItem.quantity + quantity;
        // Verificar que la nueva cantidad no exceda el stock
        if (newQuantity > product.stock) {
          return {
            success: false,
            error: `No puedes añadir más unidades. Stock disponible: ${product.stock}`
          };
        }

        await update(ref(rtdb, `carts/${userId}/${existingKey}`), {
          quantity: newQuantity
        });
      } else {
        // Añadir nuevo item
        await push(ref(rtdb, `carts/${userId}`), {
          productId,
          category: product.category,
          quantity,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Primer producto en el carrito
      await push(ref(rtdb, `carts/${userId}`), {
        productId,
        category: product.category,
        quantity,
        createdAt: new Date().toISOString()
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCart = async (userId: string) => {
  try {
    const cartRef = ref(rtdb, `carts/${userId}`);
    const cartSnapshot = await get(cartRef);

    if (!cartSnapshot.exists()) {
      return { success: true, cartItems: [] };
    }

    // Obtener detalles de los productos
    const cartItems = [];

    const promises = [];
    cartSnapshot.forEach((childSnapshot) => {
      const cartItemId = childSnapshot.key;
      const cartItemData = childSnapshot.val();

      const promise = getRealTimeProductById(cartItemData.productId)
        .then(result => {
          if (result.success && result.product) {
            cartItems.push({
              id: cartItemId,
              product: result.product,
              quantity: cartItemData.quantity
            });
          }
        });

      promises.push(promise);
    });

    await Promise.all(promises);

    return { success: true, cartItems };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
  try {
    await remove(ref(rtdb, `carts/${userId}/${cartItemId}`));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateCartItemQuantity = async (userId: string, cartItemId: string, quantity: number) => {
  try {
    if (quantity <= 0) {
      return await removeFromCart(userId, cartItemId);
    }

    // Primero obtenemos el ítem para verificar el producto
    const cartItemRef = ref(rtdb, `carts/${userId}/${cartItemId}`);
    const cartItemSnapshot = await get(cartItemRef);

    if (!cartItemSnapshot.exists()) {
      return { success: false, error: "Ítem no encontrado en el carrito" };
    }

    const cartItemData = cartItemSnapshot.val();

    // Verificar stock del producto
    const productResult = await getRealTimeProductById(cartItemData.productId);

    if (!productResult.success || !productResult.product) {
      return { success: false, error: "Producto no encontrado" };
    }

    const product = productResult.product;

    // Verificar que la cantidad no exceda el stock
    if (quantity > product.stock) {
      return {
        success: false,
        error: `No hay suficiente stock. Disponible: ${product.stock}`
      };
    }

    await update(cartItemRef, { quantity });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Proceso de compra con Realtime Database
export const processCheckout = async (userId: string, userEmail: string) => {
  try {
    // 1. Obtener carrito de compras
    const { success, cartItems, error } = await getCart(userId);

    if (!success || !cartItems || cartItems.length === 0) {
      return {
        success: false,
        error: error || "El carrito está vacío o no se pudo obtener"
      };
    }

    // 2. Verificar stock para cada producto
    const outOfStockItems = [];
    const validItems = [];

    for (const item of cartItems) {
      const product = item.product;

      // Verificamos de nuevo el stock actual (puede haber cambiado desde que se cargó el carrito)
      const freshProductResult = await getRealTimeProductById(product.id);

      if (!freshProductResult.success) {
        outOfStockItems.push({
          productId: product.id,
          name: product.name,
          requestedQuantity: item.quantity,
          availableStock: 0,
          cartItemId: item.id,
          error: "Producto ya no disponible"
        });
        continue;
      }

      const freshProduct = freshProductResult.product;

      if (freshProduct.stock >= item.quantity) {
        validItems.push({
          ...item,
          product: freshProduct // Usamos el producto con datos actualizados
        });
      } else {
        outOfStockItems.push({
          productId: product.id,
          name: product.name,
          requestedQuantity: item.quantity,
          availableStock: freshProduct.stock,
          cartItemId: item.id
        });
      }
    }

    // 3. Si hay productos sin stock, informar al usuario y mantenerlos en el carrito
    if (outOfStockItems.length > 0) {
      return {
        success: false,
        error: "Algunos productos no tienen suficiente stock",
        outOfStockItems,
        remainingItems: validItems.length
      };
    }

    // 4. Procesar la compra (actualizar stock)
    const orderItems = [];
    let total = 0;

    for (const item of validItems) {
      const product = item.product;
      const category = product.category;

      // Actualizar stock en Realtime Database
      await update(ref(rtdb, `products/${category}/${product.id}`), {
        stock: product.stock - item.quantity
      });

      // Preparar datos para la orden
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: item.quantity,
        subtotal: product.price * item.quantity
      });

      total += product.price * item.quantity;

      // Eliminar del carrito
      await removeFromCart(userId, item.id);
    }

    // 5. Crear orden en Realtime Database
    const orderData = {
      userId,
      userEmail,
      items: orderItems,
      total,
      createdAt: new Date().toISOString(),
      status: "completed"
    };

    const newOrderRef = push(ref(rtdb, 'orders'));
    await set(newOrderRef, orderData);

    // 6. Enviar correo electrónico de confirmación usando nuestro servicio mock
    // (temporalmente mientras configuramos EmailJS correctamente)
    try {
      const emailResult = await sendOrderConfirmationEmail({
        orderId: newOrderRef.key || 'unknown',
        userEmail,
        items: orderItems,
        total,
        createdAt: orderData.createdAt
      });

      if (!emailResult.success) {
        console.warn('Advertencia: No se pudo enviar el correo de confirmación:');
        // No fallamos el checkout si el correo falla
      }
    } catch (emailError: any) {
      console.error("Error al enviar correo de confirmación:", emailError);
      // No fallamos la compra si el correo falla
    }

    return {
      success: true,
      orderId: newOrderRef.key,
      orderData
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Obtener registros de valores
export const getRegistrosValores = async (limite = 100) => {
  try {
    const registrosCollection = collection(db, "registros_valores");
    const q = query(registrosCollection, orderBy("timestamp", "desc"), limit(limite));
    const registrosSnapshot = await getDocs(q);
    const registros = registrosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, registros };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Exportar servicios de Firebase
export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
export const getFirebaseRtdb = () => rtdb;

export default { auth, db, rtdb };
