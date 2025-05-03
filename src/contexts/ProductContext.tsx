import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getRealTimeProducts,
  getProductsByCategory,
  searchRealTimeProducts,
  getAllCategories
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { getDatabase, ref, onValue, off } from 'firebase/database';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchTerm: string;
  setSelectedCategory: (category: string | null) => void;
  setSearchTerm: (term: string) => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  filteredProducts: [],
  categories: [],
  loading: true,
  error: null,
  selectedCategory: null,
  searchTerm: '',
  setSelectedCategory: () => {},
  setSearchTerm: () => {},
  refreshProducts: async () => {},
});

export const useProducts = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const refreshProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Primero obtenemos todas las categorías disponibles
      const categoriesResult = await getAllCategories();
      if (categoriesResult.success) {
        setCategories(categoriesResult.categories || []);
      }

      let result;
      
      // Luego obtenemos los productos según el filtro
      if (selectedCategory) {
        result = await getProductsByCategory(selectedCategory);
      } else if (searchTerm) {
        result = await searchRealTimeProducts(searchTerm);  // Usar searchRealTimeProducts en lugar de searchProducts
      } else {
        result = await getRealTimeProducts();
      }

      if (result.success && result.products) {
        // Filtrar productos inválidos
        const validProducts = result.products.filter(prod => 
          prod && prod.name && typeof prod.price === 'number'
        );
        
        setProducts(validProducts);
        setFilteredProducts(validProducts);
      } else {
        setError(result.error || 'Error al cargar productos');
        toast({
          title: "Error",
          description: result.error || 'Error al cargar productos',
          variant: "destructive"
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para escuchar cambios en tiempo real
  useEffect(() => {
    // Solo configuramos el listener cuando no hay filtros aplicados
    if (!selectedCategory && !searchTerm) {
      const db = getDatabase();
      const productsRef = ref(db, 'products');
      
      setLoading(true);
      
      // Obtener las categorías una sola vez
      getAllCategories().then((result) => {
        if (result.success) {
          setCategories(result.categories || []);
        }
      });
      
      // Configurar listener para productos
      const unsubscribe = onValue(productsRef, (snapshot) => {
        if (snapshot.exists()) {
          const productsArray: any[] = [];
          
          snapshot.forEach((categorySnapshot) => {
            const category = categorySnapshot.key;
            
            categorySnapshot.forEach((productSnapshot) => {
              const productData = productSnapshot.val();
              productsArray.push({
                id: productSnapshot.key,
                category,
                ...productData
              });
            });
          });
          
          // Filtrar productos inválidos
          const validProducts = productsArray.filter(prod => 
            prod && prod.name && typeof prod.price === 'number'
          );
          
          setProducts(validProducts);
          setFilteredProducts(validProducts);
          setLoading(false);
        } else {
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
        }
      }, (error) => {
        setError(`Error al cargar productos: ${error.message}`);
        setLoading(false);
        toast({
          title: "Error",
          description: `Error al cargar productos: ${error.message}`,
          variant: "destructive"
        });
      });
      
      return () => {
        // Limpiar listener cuando el componente se desmonta
        off(productsRef);
      };
    } else {
      // Cuando hay filtros, usamos la función normal
      refreshProducts();
    }
  }, [selectedCategory, searchTerm]);

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        categories,
        loading,
        error,
        selectedCategory,
        searchTerm,
        setSelectedCategory,
        setSearchTerm,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
