import { Resend } from 'resend';

// Initialize Resend client (only if API key is available)
let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@agente-tributario.local';
const APP_NAME = 'Agente Tributário';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * EmailService
 * Handles sending emails via Resend
 */
export class EmailService {
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; }
              .footer { background-color: #f3f4f6; padding: 10px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
              .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${APP_NAME}</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>

                <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez essa solicitação, você pode ignorar este e-mail com segurança.</p>

                <p><strong>Para redefinir sua senha, clique no botão abaixo:</strong></p>

                <a href="${resetUrl}" class="button">Redefinir Senha</a>

                <p>Ou copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 5px;">
                  ${resetUrl}
                </p>

                <p><span class="warning">⚠️ Este link expirará em 24 horas</span></p>

                <hr style="border: none; border-top: 1px solid #d1d5db; margin: 20px 0;">

                <p><strong>Dicas de segurança:</strong></p>
                <ul>
                  <li>Nunca compartilhe este link com ninguém</li>
                  <li>O ${APP_NAME} nunca pedirá sua senha por e-mail</li>
                  <li>Se você não reconhecer essa atividade, recomendamos alterar sua senha imediatamente</li>
                </ul>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
                <p>Este é um e-mail automático, por favor não responda diretamente.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // In development, log to console instead of sending
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(60));
        console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email}`);
        console.log(`Subject: Reset your ${APP_NAME} password`);
        console.log('');
        console.log(`Reset link: ${resetUrl}`);
        console.log('');
        console.log('Full HTML:');
        console.log(htmlContent);
        console.log('='.repeat(60));
        return { success: true };
      }

      // In production, send via Resend
      if (resend) {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Reset your ${APP_NAME} password`,
          html: htmlContent,
        });

        if (result.error) {
          console.error('Email send error:', result.error);
          return { success: false, error: 'Failed to send email' };
        }

        return { success: true };
      } else {
        console.warn('Resend API key not configured. Email not sent.');
        return { success: true }; // Don't fail if email service is not configured
      }
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Email service error' };
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(
    email: string,
    name: string,
    role: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const roleLabel = role === 'EMPRESARIO'
        ? 'Empresário'
        : role === 'CONTADOR'
          ? 'Contador'
          : 'Administrador';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; }
              .footer { background-color: #f3f4f6; padding: 10px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
              .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .feature { margin: 15px 0; padding: 15px; background-color: white; border-left: 4px solid #3b82f6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bem-vindo ao ${APP_NAME}! 🎉</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>

                <p>Sua conta foi criada com sucesso como <strong>${roleLabel}</strong>.</p>

                <p><strong>Próximos passos:</strong></p>

                <a href="${APP_URL}/dashboard" class="button">Acessar Dashboard</a>

                <p><strong>Recursos disponíveis para você:</strong></p>
                ${role === 'EMPRESARIO' ? `
                  <div class="feature">
                    <strong>📊 Análise de Regime Tributário</strong>
                    <p>Compare diferentes regimes tributários e identifique oportunidades de economia.</p>
                  </div>
                  <div class="feature">
                    <strong>🤖 Consultor IA</strong>
                    <p>Obtenha orientação tributária personalizada em tempo real.</p>
                  </div>
                  <div class="feature">
                    <strong>📋 Gerenciamento de Empresas</strong>
                    <p>Adicione e gerencie múltiplas empresas em um único painel.</p>
                  </div>
                ` : role === 'CONTADOR' ? `
                  <div class="feature">
                    <strong>👥 Portfólio de Clientes</strong>
                    <p>Gerencie todas as empresas de seus clientes em um único lugar.</p>
                  </div>
                  <div class="feature">
                    <strong>⚠️ Alertas e Recomendações</strong>
                    <p>Receba alertas importantes sobre mudanças tributárias para seus clientes.</p>
                  </div>
                  <div class="feature">
                    <strong>💰 Programa de Referência</strong>
                    <p>Ganhe comissões indicando novos clientes.</p>
                  </div>
                ` : `
                  <div class="feature">
                    <strong>👤 Gerenciamento de Usuários</strong>
                    <p>Gerencie usuários e permissões do sistema.</p>
                  </div>
                  <div class="feature">
                    <strong>🏢 Gerenciamento de Empresas</strong>
                    <p>Monitore todas as empresas no sistema.</p>
                  </div>
                  <div class="feature">
                    <strong>📈 Análise do Sistema</strong>
                    <p>Visualize métricas de uso e desempenho.</p>
                  </div>
                `}

                <hr style="border: none; border-top: 1px solid #d1d5db; margin: 20px 0;">

                <p><strong>Precisa de ajuda?</strong></p>
                <p>Visite nossa <a href="${APP_URL}/docs">documentação</a> ou entre em contato com <a href="mailto:support@agente-tributario.com">support@agente-tributario.com</a></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // In development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(60));
        console.log('📧 WELCOME EMAIL (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email}`);
        console.log(`Subject: Welcome to ${APP_NAME}`);
        console.log(`Role: ${roleLabel}`);
        console.log('='.repeat(60));
        return { success: true };
      }

      // In production, send via Resend
      if (resend) {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Welcome to ${APP_NAME}!`,
          html: htmlContent,
        });

        if (result.error) {
          console.error('Email send error:', result.error);
          return { success: false, error: 'Failed to send email' };
        }

        return { success: true };
      } else {
        console.warn('Resend API key not configured. Email not sent.');
        return { success: true }; // Don't fail if email service is not configured
      }
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Email service error' };
    }
  }

  /**
   * Send email verification email (for future implementation)
   */
  static async sendEmailVerificationEmail(
    email: string,
    name: string,
    verificationToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const verifyUrl = `${APP_URL}/auth/verify-email?token=${verificationToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; }
              .footer { background-color: #f3f4f6; padding: 10px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
              .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${APP_NAME}</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>

                <p>Para confirmar seu endereço de e-mail, clique no botão abaixo:</p>

                <a href="${verifyUrl}" class="button">Verificar E-mail</a>

                <p>Ou copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 5px;">
                  ${verifyUrl}
                </p>

                <p><span style="color: #dc2626;">⚠️ Este link expirará em 24 horas</span></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // In development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(60));
        console.log('📧 EMAIL VERIFICATION (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email}`);
        console.log(`Link: ${verifyUrl}`);
        console.log('='.repeat(60));
        return { success: true };
      }

      // In production, send via Resend
      if (resend) {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Verify your email - ${APP_NAME}`,
          html: htmlContent,
        });

        if (result.error) {
          console.error('Email send error:', result.error);
          return { success: false, error: 'Failed to send email' };
        }

        return { success: true };
      } else {
        console.warn('Resend API key not configured. Email not sent.');
        return { success: true }; // Don't fail if email service is not configured
      }
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Email service error' };
    }
  }
}
