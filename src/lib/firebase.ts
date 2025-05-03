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

const firebaseConfig = {
  apiKey: "AIzaSyBMIZZmHLlSJyTQP_hvCCfp2dIaIxCgVyw",
  authDomain: "app-334.firebaseapp.com",
  projectId: "app-334",
  storageBucket: "app-334.firebasestorage.app",
  messagingSenderId: "512446977355",
  appId: "1:512446977355:web:4769f6cf58c46b8b2c44ce"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

// Productos
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
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("category", "==", category));
    const productsSnapshot = await getDocs(q);
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, products };
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

// Carrito
export const addToCart = async (userId: string, productId: string, quantity: number) => {
  try {
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
      const productDoc = await getDoc(doc(db, "products", cartItem.productId));

      if (productDoc.exists()) {
        cartItems.push({
          id: cartDoc.id,
          product: { id: productDoc.id, ...productDoc.data() },
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

export default { auth, db };
