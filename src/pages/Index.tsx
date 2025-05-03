import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Filter, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logoutUser } from '@/lib/firebase';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { filteredProducts, categories, loading, error, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useProducts();
  const { currentUser } = useAuth();
  const { totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  const handleLogout = async () => {
    const { success, error } = await logoutUser();
    
    if (success) {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate('/login');
    } else {
      toast({
        title: "Error",
        description: error || "No se pudo cerrar sesión",
        variant: "destructive"
      });
    }
  };
  
  const refreshProducts = () => {
    window.location.reload();
  };

  // Si no hay un usuario autenticado, redirigir a /login
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) {
    return null; // No renderizar nada mientras redirige
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Shopper Cart</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-blue-600">
                  {totalItems}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Search and filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="w-full md:w-2/3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full md:w-1/3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full bg-gray-200">
                <TabsTrigger 
                  value="all" 
                  onClick={() => handleCategoryChange(null)}
                  className="flex-1"
                >
                  Todos
                </TabsTrigger>
                {categories.slice(0, 3).map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    onClick={() => handleCategoryChange(category)}
                    className="flex-1"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Product list */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Skeleton loading */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-300 animate-pulse"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-6 bg-red-100 rounded-md">
            <p>{error}</p>
            <Button className="mt-4" variant="outline" onClick={refreshProducts}>
              Intentar de nuevo
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-6 bg-gray-100 rounded-md">
            <p className="text-gray-600">No se encontraron productos</p>
            {searchTerm && (
              <Button className="mt-4" variant="outline" onClick={() => setSearchTerm('')}>
                Limpiar búsqueda
              </Button>
            )}
            {selectedCategory && (
              <Button className="mt-4 ml-2" variant="outline" onClick={() => setSelectedCategory(null)}>
                Mostrar todos
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Index;
