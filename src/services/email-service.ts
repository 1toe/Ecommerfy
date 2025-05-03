import emailjs from '@emailjs/browser';

interface OrderEmailData {
  orderId: string;
  userEmail: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  total: number;
  createdAt: string;
}

// Configuración de EmailJS desde variables de entorno
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

/**
 * Envía un correo electrónico de confirmación de compra usando EmailJS
 * @param orderData Datos de la orden
 * @returns Promesa con el resultado del envío
 */
export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<{success: boolean, error?: string}> => {
  try {
    // Formatear los productos para mostrarlos en el correo
    const itemsList = orderData.items.map(item => 
      `${item.name} - ${item.quantity} unidad(es) x $${item.price.toFixed(2)} = $${item.subtotal.toFixed(2)}`
    ).join('\n');
    
    // Datos para la plantilla
    const templateParams = {
      to_email: orderData.userEmail,
      order_id: orderData.orderId,
      order_date: new Date(orderData.createdAt).toLocaleString(),
      items_list: itemsList,
      total_amount: `$${orderData.total.toFixed(2)}`,
      customer_name: orderData.userEmail.split('@')[0] // Simplificación, mejor usar nombre real
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID, 
      templateParams,
      USER_ID
    );
    
    if (response.status === 200) {
      return { success: true };
    } else {
      console.error('Error al enviar el correo: Estado inesperado', response);
      return { success: false, error: 'Error al enviar el correo' };
    }
  } catch (error: any) {
    console.error('Error al enviar el correo:', error);
    return { success: false, error: error.message || 'Error al enviar el correo' };
  }
};
