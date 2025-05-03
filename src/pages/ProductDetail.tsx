import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRealTimeProductById } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID de producto no válido');
        setLoading(false);
        return;
      }

      try {
        const { success, product: fetchedProduct, error: productError } = await getRealTimeProductById(id);
        
        if (success && fetchedProduct) {
          setProduct(fetchedProduct as Product);
        } else {
          setError(productError || 'No se pudo cargar el producto');
          toast({
            title: "Error",
            description: productError || 'No se pudo cargar el producto',
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

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && (product ? value <= product.stock : true)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (product) {
      await addItem(product.id, quantity);
    }
  };

  // Si no hay un usuario autenticado, redirigir a /login
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la tienda
        </Button>

        {loading ? (
          <div className="animate-pulse">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-4">
                  <div className="bg-gray-300 h-64 rounded-md"></div>
                </div>
                <div className="w-full md:w-1/2 md:pl-4">
                  <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2 w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
                  <div className="h-24 bg-gray-300 rounded mb-6"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-6 bg-red-100 rounded-lg">
            <p>{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate('/')}>
              Volver a la tienda
            </Button>
          </div>
        ) : product ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-4">
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-4">
                  <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                  <Badge className="mb-2">{product.category}</Badge>
                  <p className="text-xl font-bold text-blue-600 mb-4">${product.price.toFixed(2)}</p>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 mb-6">
                    <p className="text-sm">Disponible: {product.stock} unidades</p>
                    {product.stock === 0 && (
                      <Badge variant="outline" className="text-red-500 border-red-300">
                        Producto agotado hasta nuevo aviso
                      </Badge>
                    )}
                  </div>
                  
                  {product.stock > 0 ? (
                    <>
                      <div className="flex items-center mb-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input 
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-20 mx-2 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementQuantity}
                          disabled={quantity >= product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Añadir al carrito
                      </Button>
                    </>
                  ) : (
                    <Button disabled className="w-full">
                      Agotado
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetail;
