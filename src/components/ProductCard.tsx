import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Monitor, Smartphone, Headphones, Cpu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product.id, 1);
  };
  
  // Determinar un icono basado en la categoría
  const getCategoryIcon = () => {
    const categoryLower = product.category?.toLowerCase() || '';
    
    switch(true) {
      case categoryLower.includes('laptop') || categoryLower.includes('computación'):
        return <Monitor className="h-12 w-12 opacity-30" />;
      case categoryLower.includes('smartphone') || categoryLower.includes('móviles') || categoryLower.includes('accesorios'):
        return <Smartphone className="h-12 w-12 opacity-30" />;
      case categoryLower.includes('audio'):
        return <Headphones className="h-12 w-12 opacity-30" />;
      case categoryLower.includes('componentes'):
        return <Cpu className="h-12 w-12 opacity-30" />;
      default:
        return <ShoppingCart className="h-12 w-12 opacity-30" />;
    }
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      onClick={handleViewDetails}
    >
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          {getCategoryIcon()}
        </div>
        <Badge className="absolute top-2 right-2">{product.category}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 h-10">{product.description || "Sin descripción"}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-blue-600">${(product.price || 0).toFixed(2)}</span>
          {(product.stock > 0) ? (
            <span className="text-xs text-gray-500">Stock: {product.stock}</span>
          ) : (
            <span className="text-xs text-red-500">Agotado</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleAddToCart}
          disabled={!product.stock || product.stock <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Añadir al carrito
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;