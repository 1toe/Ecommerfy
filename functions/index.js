const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

admin.initializeApp();

// Configuración de OAuth2 para Gmail
const oauth2Client = new OAuth2(
    functions.config().gmail.client_id,
    functions.config().gmail.client_secret,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: functions.config().gmail.refresh_token
});

exports.sendOrderConfirmation = functions.https.onCall(async (data, context) => {
    // Verificación de autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado');
    }

    const { order, to } = data;

    if (!order || !to) {
        throw new functions.https.HttpsError('invalid-argument', 'Se requieren los datos de la orden y el correo de destino');
    }

    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: functions.config().gmail.email,
                clientId: functions.config().gmail.client_id,
                clientSecret: functions.config().gmail.client_secret,
                refreshToken: functions.config().gmail.refresh_token,
                accessToken: accessToken.token
            }
        });

        // Crear el contenido HTML del correo
        let productsHtml = '';
        order.items.forEach(item => {
            productsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
        });

        const mailOptions = {
            from: `"Shopper Cart" <${functions.config().gmail.email}>`,
            to,
            subject: `Confirmación de Orden #${order.id}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; text-align: center;">¡Gracias por tu compra!</h1>
          <p>Hola,</p>
          <p>Tu pedido ha sido recibido y será procesado a la brevedad.</p>
          
          <h2 style="color: #1e40af;">Detalles del pedido</h2>
          <p><strong>Número de orden:</strong> ${order.id}</p>
          <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="text-align: left; padding: 10px;">Producto</th>
                <th style="text-align: left; padding: 10px;">Cantidad</th>
                <th style="text-align: left; padding: 10px;">Precio</th>
                <th style="text-align: left; padding: 10px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
                <td style="padding: 10px;"><strong>$${order.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <p style="margin-top: 20px;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
          
          <div style="margin-top: 40px; text-align: center; padding: 20px; background-color: #f3f4f6;">
            <p>© 2023 Shopper Cart. Todos los derechos reservados.</p>
          </div>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);

        return { success: true };
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new functions.https.HttpsError('internal', 'Error al enviar el correo de confirmación');
    }
});
