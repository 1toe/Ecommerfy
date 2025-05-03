import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, getRealTimeProductById } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { getDatabase, ref, onValue, off } from 'firebase/database';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  totalItems: number;
  totalPrice: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  loading: true,
  error: null,
  addItem: async () => { },
  removeItem: async () => { },
  updateQuantity: async () => { },
  totalItems: 0,
  totalPrice: 0,
  refreshCart: async () => { }
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const refreshCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { success, cartItems: items, error: cartError } = await getCart(currentUser.uid);

    if (success && items) {
      setCartItems(items);
    } else {
      setError(cartError || 'Error al cargar el carrito');
      toast({
        title: "Error",
        description: cartError || 'Error al cargar el carrito',
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  // Suscripción en tiempo real al carrito
  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getDatabase();
    const cartRef = ref(db, `carts/${currentUser.uid}`);

    const unsubscribe = onValue(cartRef, async (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const items: CartItem[] = [];
        const promises: Promise<any>[] = [];

        snapshot.forEach((childSnapshot) => {
          const cartItemId = childSnapshot.key;
          const cartItemData = childSnapshot.val();

          if (cartItemId && cartItemData) {
            const promise = getRealTimeProductById(cartItemData.productId)
              .then(result => {
                if (result.success && result.product) {
                  items.push({
                    id: cartItemId,
                    product: result.product as any,
                    quantity: cartItemData.quantity
                  });
                }
              })
              .catch(err => {
                console.error(`Error al cargar producto ${cartItemData.productId}:`, err);
              });

            promises.push(promise);
          }
        });

        await Promise.all(promises);


        setCartItems(items);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: `Error al cargar el carrito: ${err.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    // Limpieza al desmontar
    return () => {
      off(cartRef);
    };
  }, [currentUser]);

  const addItem = async (productId: string, quantity: number) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive"
      });
      return;
    }

    const { success, error: addError } = await addToCart(currentUser.uid, productId, quantity);

    if (success) {
      toast({
        title: "Éxito",
        description: "Producto agregado al carrito",
      });
      refreshCart();
    } else {
      toast({
        title: "Error",
        description: addError || 'Error al agregar el producto',
        variant: "destructive"
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!currentUser) return;

    const { success, error: removeError } = await removeFromCart(currentUser.uid, cartItemId);

    if (success) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      toast({
        title: "Éxito",
        description: "Producto eliminado del carrito",
      });
    } else {
      toast({
        title: "Error",
        description: removeError || 'Error al eliminar el producto',
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!currentUser) return;

    const { success, error: updateError } = await updateCartItemQuantity(currentUser.uid, cartItemId, quantity);

    if (success) {
      if (quantity <= 0) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      } else {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === cartItemId ? { ...item, quantity } : item
          )
        );
      }
    } else {
      toast({
        title: "Error",
        description: updateError || 'Error al actualizar la cantidad',
        variant: "destructive"
      });
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        totalPrice,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
