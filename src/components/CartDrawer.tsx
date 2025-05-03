import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { processCheckout } from '@/lib/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ShoppingCart, Trash2, Plus, Minus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { cartItems, loading, removeItem, updateQuantity, totalPrice, refreshCart } = useCart();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState(false);
  const [outOfStockDialog, setOutOfStockDialog] = React.useState(false);
  const [outOfStockItems, setOutOfStockItems] = React.useState<any[]>([]);
  const [remainingItems, setRemainingItems] = React.useState(0);

  const handleRemoveItem = (cartItemId: string) => {
    removeItem(cartItemId);
  };

  const handleUpdateQuantity = (cartItemId: string, currentQty: number, delta: number) => {
    updateQuantity(cartItemId, currentQty + delta);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar la compra",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      const userEmail = currentUser.email || '';
      // Pasamos el email del usuario para el envío del correo
      const result = await processCheckout(currentUser.uid, userEmail);

      if (result.success) {
        toast({
          title: "¡Compra exitosa!",
          description: "Se ha enviado un correo con los detalles de tu pedido",
        });
        await refreshCart();
        onClose();
        
        // Redirigir a la página de éxito con el ID de la orden
        navigate(`/order/success/${result.orderId}`);
      } else if (result.outOfStockItems) {
        setOutOfStockItems(result.outOfStockItems);
        setRemainingItems(result.remainingItems);
        setOutOfStockDialog(true);
      } else {
        toast({
          title: "Error",
          description: result.error || "Hubo un error al procesar tu compra",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const continueWithAvailableItems = () => {
    setOutOfStockDialog(false);
    if (remainingItems > 0) {
      setConfirmDialog(true);
    } else {
      toast({
        title: "Carrito vacío",
        description: "No hay productos disponibles en tu carrito",
        variant: "destructive"
      });
      onClose();
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" /> 
              Tu Carrito
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <ShoppingCart className="h-16 w-16 mb-2 opacity-20" />
                <p className="text-center">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      {item.product.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="h-8 w-8 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">${item.product.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-auto text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <Separator className="mb-4" />
            <div className="flex justify-between mb-2 text-sm">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <SheetFooter>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={cartItems.length === 0 || processing}
                onClick={() => setConfirmDialog(true)}
              >
                {processing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar compra
                  </span>
                )}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Dialog de confirmación */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar compra</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas realizar esta compra? Se verificará el stock disponible y se procesará tu pedido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckout}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog de productos sin stock */}
      <AlertDialog open={outOfStockDialog} onOpenChange={setOutOfStockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Productos sin stock suficiente</AlertDialogTitle>
            <AlertDialogDescription>
              Los siguientes productos no tienen stock suficiente y han sido eliminados de tu carrito:
              <ul className="mt-2 list-disc pl-4">
                {outOfStockItems.map(item => (
                  <li key={item.productId} className="text-sm">
                    {item.name} - Solicitaste: {item.requestedQuantity}, Disponible: {item.availableStock}
                  </li>
                ))}
              </ul>
              {remainingItems > 0 ? (
                <p className="mt-4">¿Deseas continuar con los productos disponibles?</p>
              ) : (
                <p className="mt-4">No hay productos disponibles en tu carrito.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {remainingItems > 0 && (
              <AlertDialogAction onClick={continueWithAvailableItems}>
                Continuar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CartDrawer;
