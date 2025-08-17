// Arquivo main.js simples para teste
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
        <h1 style="color: #3e8bff;">MedStudios - Painel de Controle</h1>
        <p>Bem-vindo ao Painel de Controle do MedStudios. Esta página está funcionando corretamente!</p>
      </div>
    `;
  }
});