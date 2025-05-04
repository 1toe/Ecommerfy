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

// Configuración correcta de EmailJS
const SERVICE_ID = "service_m4b2a8u";
const TEMPLATE_ID = "template_grusq6b"; // ID correcto de la plantilla "Order Confirmed"
const PUBLIC_KEY = "JWo9NZfMPxqB-MI_a";

// Inicializar EmailJS con la clave pública
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

        // Formato simple para EmailJS - lo importante es incluir correctamente los campos
        const templateParams = {
            to_name: orderData.userName || orderData.userEmail.split('@')[0],
            to_email: orderData.userEmail,
            order_id: orderData.orderId,
            order_date: new Date(orderData.createdAt).toLocaleDateString(),
            items_table: tableHtml,
            total_amount: orderData.total.toFixed(2)
        };

        console.log('Enviando email con params:', JSON.stringify(templateParams));

        // Solución: En EmailJS, debes configurar el "recipient" en la plantilla en el panel de EmailJS
        // y no en el código. El correo se enviará usando la plantilla configurada.
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams
        );

        console.log('Respuesta de EmailJS:', response);

        return { success: true };
    } catch (error: any) {
        console.error('Error detallado en EmailJS:', error);
        return { success: false, error: error.message };
    }
};

export const sendOrderConfirmationEmailMock = async (orderData: OrderEmailData): Promise<{ success: boolean }> => {

    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
};
