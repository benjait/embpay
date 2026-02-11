import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  date: string;
  downloadUrl?: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'EmbPay <noreply@embpay.com>',
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.productName}`,
      html: getOrderConfirmationHTML(data),
    });

    console.log('[Email] Order confirmation sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('[Email] Failed to send order confirmation:', error);
    return { success: false, error };
  }
}

export async function sendRefundNotification(data: OrderEmailData) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'EmbPay <noreply@embpay.com>',
      to: data.customerEmail,
      subject: `Refund Processed - ${data.productName}`,
      html: getRefundNotificationHTML(data),
    });

    console.log('[Email] Refund notification sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('[Email] Failed to send refund notification:', error);
    return { success: false, error };
  }
}

// ── Email Templates ──────────────────────────────────────

function getOrderConfirmationHTML(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Order Confirmed! 🎉</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Thank you for your purchase</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1e293b; font-size: 16px; line-height: 1.5;">
                Hi ${data.customerName || 'there'},
              </p>
              <p style="margin: 0 0 30px; color: #64748b; font-size: 15px; line-height: 1.6;">
                Your order has been confirmed and processed successfully. Here are the details:
              </p>

              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order Details</p>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Product</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${data.productName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Order ID</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">#${data.orderId.substring(0, 8)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Date</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 12px 0 0;">Total Amount</td>
                        <td style="color: #10b981; font-size: 20px; font-weight: 700; padding: 12px 0 0; text-align: right;">$${data.amount.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.downloadUrl ? `
              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${data.downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                      Download Your Product
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 0 0 20px; color: #64748b; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to reach out to support.
              </p>
              
              <p style="margin: 0; color: #1e293b; font-size: 14px;">
                Best regards,<br>
                <strong>The EmbPay Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                Powered by <strong>EmbPay</strong> — Modern Payment Platform
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getRefundNotificationHTML(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Refund Processed ✓</h1>
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 14px;">Your payment has been refunded</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1e293b; font-size: 16px; line-height: 1.5;">
                Hi ${data.customerName || 'there'},
              </p>
              <p style="margin: 0 0 30px; color: #64748b; font-size: 15px; line-height: 1.6;">
                Your refund has been processed successfully. The amount will appear in your account within 5-10 business days.
              </p>

              <!-- Refund Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; color: #166534; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Refund Details</p>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #d1fae5;">Product</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right;">${data.productName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #d1fae5;">Order ID</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right; font-family: monospace;">#${data.orderId.substring(0, 8)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 12px 0 0;">Refund Amount</td>
                        <td style="color: #10b981; font-size: 20px; font-weight: 700; padding: 12px 0 0; text-align: right;">$${data.amount.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #64748b; font-size: 14px; line-height: 1.6;">
                If you have any questions about this refund, please contact support.
              </p>
              
              <p style="margin: 0; color: #1e293b; font-size: 14px;">
                Best regards,<br>
                <strong>The EmbPay Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                Powered by <strong>EmbPay</strong> — Modern Payment Platform
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
