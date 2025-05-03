
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProducts, getProductsByCategory, searchProducts } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

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
      let result;
      
      if (selectedCategory) {
        result = await getProductsByCategory(selectedCategory);
      } else if (searchTerm) {
        result = await searchProducts(searchTerm);
      } else {
        result = await getProducts();
      }

      if (result.success && result.products) {
        setProducts(result.products);
        setFilteredProducts(result.products);
        
        // Extract unique categories
        if (!selectedCategory && !searchTerm) {
          const uniqueCategories = Array.from(
            new Set(result.products.map((product: Product) => product.category))
          );
          setCategories(uniqueCategories);
        }
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

  // Efecto inicial para cargar todos los productos
  useEffect(() => {
    refreshProducts();
  }, []);

  // Efecto para filtrar productos cuando cambia la categoría o término de búsqueda
  useEffect(() => {
    refreshProducts();
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
