import emailjs from '@emailjs/browser';

interface OrderEmailData {
    orderId: string;
    userEmail: string;
    userName?: string; // Agregamos campo opcional para el nombre
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
        // Generar tabla HTML de productos
        const itemsTableHtml = orderData.items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px;">${item.name}</td>
                <td style="padding: 8px;">${item.quantity}</td>
                <td style="padding: 8px;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px;">$${item.subtotal.toFixed(2)}</td>
            </tr>
        `).join('');

        const tableHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 8px; text-align: left;">Producto</th>
                    <th style="padding: 8px; text-align: left;">Cantidad</th>
                    <th style="padding: 8px; text-align: left;">Precio</th>
                    <th style="padding: 8px; text-align: left;">Subtotal</th>
                </tr>
                ${itemsTableHtml}
            </table>
        `;

        // Parámetros para la plantilla
        const templateParams = {
            to_name: orderData.userName || orderData.userEmail.split('@')[0],
            order_id: orderData.orderId,
            order_date: new Date(orderData.createdAt).toLocaleDateString(),
            items_table: tableHtml,
            total_amount: orderData.total.toFixed(2),
            to_email: orderData.userEmail // Cambiamos 'email' por 'to_email' para que coincida con la plantilla
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
