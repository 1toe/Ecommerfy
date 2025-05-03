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
  child
} from "firebase/database";

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

// Carrito
export const addToCart = async (userId: string, productId: string, quantity: number) => {
  try {
    // Primero obtenemos el producto para saber a qué categoría pertenece
    const productResult = await getRealTimeProductById(productId);
    if (!productResult.success || !productResult.product) {
      return { success: false, error: "Producto no encontrado" };
    }

    // Verificar si el producto ya está en el carrito
    const cartCollection = collection(db, "carts");
    const q = query(cartCollection, where("userId", "==", userId), where("productId", "==", productId));
    const cartSnapshot = await getDocs(q);

    if (!cartSnapshot.empty) {
      // Actualizar cantidad
      const cartItemDoc = cartSnapshot.docs[0];
      const currentQuantity = cartItemDoc.data().quantity || 0;
      await updateDoc(doc(db, "carts", cartItemDoc.id), {
        quantity: currentQuantity + quantity
      });
    } else {
      // Añadir nuevo item al carrito
      await addDoc(collection(db, "carts"), {
        userId,
        productId,
        category: productResult.product.category, // Guardar la categoría para acceso rápido
        quantity,
        createdAt: new Date()
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCart = async (userId: string) => {
  try {
    const cartCollection = collection(db, "carts");
    const q = query(cartCollection, where("userId", "==", userId));
    const cartSnapshot = await getDocs(q);

    // Obtener detalles de los productos
    const cartItems = [];
    for (const cartDoc of cartSnapshot.docs) {
      const cartItem = cartDoc.data();
      const productResult = await getRealTimeProductById(cartItem.productId);

      if (productResult.success && productResult.product) {
        cartItems.push({
          id: cartDoc.id,
          product: productResult.product,
          quantity: cartItem.quantity
        });
      }
    }

    return { success: true, cartItems };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const removeFromCart = async (cartItemId: string) => {
  try {
    await deleteDoc(doc(db, "carts", cartItemId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
  try {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
    } else {
      await updateDoc(doc(db, "carts", cartItemId), { quantity });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Proceso de compra
export const processCheckout = async (userId: string) => {
  try {
    // 1. Obtener carrito de compras
    const { success, cartItems, error } = await getCart(userId);

    if (!success || !cartItems) {
      return { success: false, error: error || "Error al obtener el carrito" };
    }

    // 2. Verificar stock para cada producto
    const outOfStockItems = [];
    const validItems = [];

    for (const item of cartItems) {
      const product = item.product;
      if (product.stock >= item.quantity) {
        validItems.push(item);
      } else {
        outOfStockItems.push({
          productId: product.id,
          name: product.name,
          requestedQuantity: item.quantity,
          availableStock: product.stock,
          cartItemId: item.id
        });
      }
    }

    // 3. Si hay productos sin stock, informar al usuario y eliminarlos del carrito
    if (outOfStockItems.length > 0) {
      // Eliminar items sin stock del carrito
      for (const item of outOfStockItems) {
        await removeFromCart(item.cartItemId);
      }

      return {
        success: false,
        error: "Algunos productos no tienen suficiente stock",
        outOfStockItems,
        remainingItems: validItems.length
      };
    }

    // 4. Procesar la compra (actualizar stock)
    for (const item of validItems) {
      const product = item.product;
      await updateDoc(doc(db, "products", product.id), {
        stock: product.stock - item.quantity
      });

      // Eliminar del carrito
      await removeFromCart(item.id);
    }

    // 5. Crear orden
    const orderData = {
      userId,
      items: validItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: validItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      createdAt: new Date(),
      status: "completed"
    };

    const orderRef = await addDoc(collection(db, "orders"), orderData);

    return {
      success: true,
      orderId: orderRef.id,
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
