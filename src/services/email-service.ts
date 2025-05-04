import emailjs from '@emailjs/browser';

interface OrderEmailData {
    orderId: string;
    userEmail: string;
    userName?: string;
    items: Array<{
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    total: number;
    createdAt: string;
}

// Configuración de EmailJS
const SERVICE_ID = "service_m4b2a8u";
const TEMPLATE_ID = "template_grusq6b";
const PUBLIC_KEY = "JWo9NZfMPxqB-MI_a";

// Inicializar EmailJS
emailjs.init(PUBLIC_KEY);

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<{ success: boolean, error?: string }> => {
    try {
        // Generar HTML para la tabla de productos
        const itemsRows = orderData.items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px; text-align: left;">${item.name}</td>
                <td style="padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right;">$${item.subtotal.toFixed(2)}</td>
            </tr>
        `).join('');

        const itemsTable = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Producto</th>
                        <th style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">Cantidad</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Precio</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                        <td style="padding: 8px; text-align: right; font-weight: bold;">$${orderData.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        `;

        // Parámetros para la plantilla
        const templateParams = {
            to_name: orderData.userName || orderData.userEmail.split('@')[0],
            to_email: orderData.userEmail,
            order_id: orderData.orderId,
            order_date: new Date(orderData.createdAt).toLocaleDateString(),
            items_table: itemsTable,
            total_amount: orderData.total.toFixed(2)
        };

        console.log('Enviando email con params:', JSON.stringify(templateParams));

        // IMPORTANTE: Para que el HTML se renderice correctamente en EmailJS:
        // 1. La plantilla debe tener habilitada la opción "Enable HTML content"
        // 2. Para insertar HTML en la plantilla, usa TRIPLE LLAVES: {{{items_table}}} en lugar de {{items_table}}
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