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

// Obtener las variables de entorno
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Inicializar EmailJS con la clave pública desde las variables de entorno
emailjs.init(PUBLIC_KEY);

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<{ success: boolean, error?: string }> => {
    try {
        // Formatear los productos para la plantilla
        const itemsList = orderData.items.map(item => ({
            name: item.name,
            units: item.quantity,
            price: item.price,
            subtotal: item.subtotal
        }));

        // Parámetros exactos que espera la plantilla
        const templateParams = {
            email: orderData.userEmail,
            order_id: orderData.orderId,
            cost: {
                subtotal: orderData.total,
                shipping: 0,
                tax: 0,
                total: orderData.total
            },
            orders: itemsList,
            order_date: new Date(orderData.createdAt).toLocaleString()
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams
        );

        console.log('Email enviado correctamente:', response);
        
        if (response.status === 200) {
            return { success: true };
        } else {
            console.error('Error al enviar el correo: Estado inesperado', response);
            return { success: false, error: 'Error al enviar el correo' };
        }
    } catch (error: any) {
        console.error('Error al enviar el correo:', error);
        return { success: false, error: error.message };
    }
};

// Función alternativa que usa un servicio mock para desarrollo
export const sendOrderConfirmationEmailMock = async (orderData: OrderEmailData): Promise<{ success: boolean }> => {


    // Simulamos un pequeño retraso como en una API real
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
};
