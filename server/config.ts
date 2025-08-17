// Configurações do aplicativo
export const config = {
  // Controle de autenticação - alterar para true quando quiser ativar login obrigatório
  auth: {
    enabled: false, // ✅ false = acesso livre, true = login obrigatório
    requireLogin: false, // Para futuras funcionalidades que precisem de usuário específico
    allowGuestAccess: true, // Permitir acesso como convidado
  },
  
  // Configurações de desenvolvimento
  development: {
    showAuthButtons: true, // Mostrar botões de login/cadastro no header
    enableTestUser: true, // Usuário admin padrão para testes
  },
  
  // Configurações de produção (para o futuro)
  production: {
    requireSecureAuth: true, // JWT, sessions, etc.
    enableUserProfiles: true, // Perfis personalizados por usuário
    enableDataPersistence: true, // Banco de dados real
  }
};

// Helper para verificar se auth está ativada
export const isAuthEnabled = () => config.auth.enabled;
export const requiresLogin = () => config.auth.enabled && config.auth.requireLogin;
export const allowsGuests = () => config.auth.allowGuestAccess;
