// Configuração de autenticação do cliente
export const authConfig = {
  // Controle principal - alterar para true quando quiser ativar login obrigatório
  enabled: false, // ✅ false = acesso livre, true = login obrigatório
  
  // Opções de interface
  showLoginButton: true, // Mostrar botão "Login" no header
  showUserProfile: false, // Mostrar perfil do usuário quando logado
  
  // Comportamento
  redirectToLoginOnError: false, // Redirecionar para login em caso de erro 401
  persistUserData: true, // Manter dados do usuário no localStorage
  
  // Para desenvolvimento
  allowGuestMode: true, // Permitir uso sem login
  defaultUser: null, // Usuário padrão (null = modo convidado)
};

// Helpers para verificar estado da autenticação
export const isAuthEnabled = () => authConfig.enabled;
export const isGuestModeAllowed = () => authConfig.allowGuestMode;
export const shouldShowLoginButton = () => authConfig.showLoginButton;
