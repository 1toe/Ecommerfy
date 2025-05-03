import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || !orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`);
        const snapshot = await get(orderRef);

        if (snapshot.exists()) {
          const orderData = snapshot.val();
          if (orderData.userId === currentUser.uid) {
            setOrder(orderData);
          } else {
            setError('No tienes permiso para ver esta orden');
          }
        } else {
          setError('La orden no fue encontrada');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la tienda
        </Button>

        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p>Cargando información de tu pedido...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Volver a la tienda
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center flex-col mb-8">
                <div className="bg-green-100 p-3 rounded-full">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold mt-4 text-center">¡Compra realizada con éxito!</h1>
                <p className="text-gray-600 mt-2 text-center">
                  Tu pedido ha sido procesado correctamente.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <p className="font-medium">Número de pedido: <span className="font-bold">{orderId}</span></p>
                <p className="text-sm text-gray-600 mt-1">
                  Fecha: {new Date(order?.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <h2 className="font-bold mb-3">Resumen del pedido:</h2>
              <ul className="space-y-2 mb-4">
                {order?.items.map((item: any, index: number) => (
                  <li key={index} className="flex justify-between text-sm border-b pb-2">
                    <span className="flex-1">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total:</span>
                <span>${order?.total.toFixed(2)}</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Se ha enviado un correo de confirmación a {order?.userEmail}
                </p>
                
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continuar comprando
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
