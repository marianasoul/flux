import express from "express";
import type { Request, Response, NextFunction, Express } from "express";
import { registerRoutes } from "./routes.ts";
import { setupVite, serveStatic } from "./vite.ts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log removido para evitar dependência do vite
// app.use((req, res, next) => {
//   ...existing code...
// });

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log do erro para debug
    console.error(`[ERROR] ${req.method} ${req.path}:`, {
      status,
      message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    // Enviar resposta de erro
    res.status(status).json({ 
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });

    // NÃO re-lançar o erro - isso crasharia a aplicação
  });

  // Servir páginas HTML diretamente do servidor
  // Página inicial/login
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MedStudios - Painel de Controle</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f7ff;
            color: #141b2d;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            max-width: 800px;
            padding: 2rem;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          h1 {
            color: #3e8bff;
            margin-bottom: 1rem;
          }
          p {
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }
          .form-group {
            margin-bottom: 1rem;
            text-align: left;
          }
          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
          }
          button {
            background-color: #3e8bff;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          button:hover {
            background-color: #2d7ae5;
          }
          .error {
            color: #e53e3e;
            margin-top: 1rem;
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>MedStudios - Painel de Controle</h1>
          <p>Bem-vindo ao Painel de Controle do MedStudios. Faça login para acessar o sistema.</p>
          
          <form id="loginForm">
            <div class="form-group">
              <label for="email">E-mail</label>
              <input type="email" id="email" name="email" required placeholder="Seu e-mail">
            </div>
            <div class="form-group">
              <label for="password">Senha</label>
              <input type="password" id="password" name="password" required placeholder="Sua senha">
            </div>
            <button type="submit">Entrar</button>
            <p class="error" id="errorMessage"></p>
          </form>
        </div>

        <script>
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            
            try {
              const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                // Login bem-sucedido, redirecionar para o dashboard
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
              } else {
                // Exibir mensagem de erro
                errorMessage.textContent = data.error || 'Erro ao fazer login';
                errorMessage.style.display = 'block';
              }
            } catch (error) {
              errorMessage.textContent = 'Erro ao conectar com o servidor';
              errorMessage.style.display = 'block';
              console.error('Erro:', error);
            }
          });
        </script>
      </body>
      </html>
    `);
  });
  
  // Página de dashboard
  app.get('/dashboard', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MedStudios - Dashboard</title>
        <style>
          :root {
            --primary: #3e8bff;
            --primary-dark: #2d7ae5;
            --background: #f8f7ff;
            --text: #141b2d;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background);
            color: var(--text);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          
          .app-container {
            display: flex;
            min-height: 100vh;
          }
          
          .sidebar {
            width: var(--sidebar-width);
            background-color: white;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
            padding: 1.5rem 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
          }
          
          .sidebar-header {
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid #eee;
            margin-bottom: 1.5rem;
          }
          
          .sidebar-header h1 {
            color: var(--primary);
            font-size: 1.5rem;
            margin: 0;
          }
          
          .nav-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .nav-item {
            margin-bottom: 0.5rem;
          }
          
          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            color: var(--text);
            text-decoration: none;
            transition: background-color 0.2s;
          }
          
          .nav-link:hover, .nav-link.active {
            background-color: rgba(62, 139, 255, 0.1);
            color: var(--primary);
          }
          
          .nav-link-icon {
            margin-right: 0.75rem;
            width: 20px;
            height: 20px;
          }
          
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          
          .page-title {
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0;
          }
          
          .user-info {
            display: flex;
            align-items: center;
          }
          
          .user-name {
            margin-right: 1rem;
            font-weight: 500;
          }
          
          .logout-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .logout-btn:hover {
            background-color: #f1f1f1;
          }
          
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .card-action {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
          }
          
          .subject-card {
            border-left: 4px solid var(--primary);
            transition: transform 0.2s;
          }
          
          .subject-card:hover {
            transform: translateY(-3px);
          }
          
          .subject-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .subject-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
          }
          
          .subject-code {
            font-size: 0.85rem;
            color: #666;
            margin: 0;
          }
          
          .subject-stats {
            display: flex;
            margin-top: 1rem;
            justify-content: space-between;
          }
          
          .stat {
            text-align: center;
          }
          
          .stat-value {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .stat-label {
            font-size: 0.75rem;
            color: #666;
            margin: 0;
          }
          
          .btn {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .btn:hover {
            background-color: var(--primary-dark);
          }
          
          .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
          
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
          }
          
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid var(--primary);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error-message {
            color: #e53e3e;
            text-align: center;
            padding: 1rem;
          }
          
          /* Responsividade */
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              z-index: 1000;
            }
            
            .sidebar.open {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
            }
            
            .menu-toggle {
              display: block;
              position: fixed;
              top: 1rem;
              left: 1rem;
              z-index: 1001;
              background-color: var(--primary);
              color: white;
              border: none;
              border-radius: 4px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            }
          }
        </style>
      </head>
      <body>
        <div class="app-container">
          <aside class="sidebar">
            <div class="sidebar-header">
              <h1>MedStudios</h1>
            </div>
            <nav>
              <ul class="nav-list">
                <li class="nav-item">
                  <a href="/dashboard" class="nav-link active">
                    <span class="nav-link-icon">📊</span>
                    Dashboard
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/disciplinas" class="nav-link">
                    <span class="nav-link-icon">📚</span>
                    Disciplinas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/aulas" class="nav-link">
                    <span class="nav-link-icon">🗓️</span>
                    Aulas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/tarefas" class="nav-link">
                    <span class="nav-link-icon">✅</span>
                    Tarefas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/notas" class="nav-link">
                    <span class="nav-link-icon">📝</span>
                    Notas
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main class="main-content">
            <header class="page-header">
              <h1 class="page-title">Dashboard</h1>
              <div class="user-info">
                <span class="user-name" id="userName">Carregando...</span>
                <button class="logout-btn" id="logoutBtn">Sair</button>
              </div>
            </header>
            
            <section class="card">
              <div class="card-header">
                <h2 class="card-title">Disciplinas</h2>
                <a href="/disciplinas" class="card-action">Ver todas</a>
              </div>
              <div id="subjectsContainer" class="grid">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </section>
            
            <section class="card">
              <div class="card-header">
                <h2 class="card-title">Próximas Aulas</h2>
                <a href="/aulas" class="card-action">Ver todas</a>
              </div>
              <div id="classesContainer">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </section>
            
            <section class="card">
              <div class="card-header">
                <h2 class="card-title">Tarefas Pendentes</h2>
                <a href="/tarefas" class="card-action">Ver todas</a>
              </div>
              <div id="tasksContainer">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </section>
          </main>
        </div>
        
        <script>
          // Verificar se o usuário está logado
          document.addEventListener('DOMContentLoaded', () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
              // Redirecionar para a página de login se não estiver logado
              window.location.href = '/';
              return;
            }
            
            const user = JSON.parse(userStr);
            document.getElementById('userName').textContent = user.name;
            
            // Carregar dados das disciplinas
            fetchSubjects();
            
            // Configurar botão de logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
              localStorage.removeItem('user');
              window.location.href = '/';
            });
          });
          
          // Função para buscar disciplinas
          async function fetchSubjects() {
            const container = document.getElementById('subjectsContainer');
            
            try {
              const response = await fetch('/api/subjects/stats');
              if (!response.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await response.json();
              
              if (subjects.length === 0) {
                container.innerHTML = '<p>Nenhuma disciplina encontrada. Adicione sua primeira disciplina!</p>';
                return;
              }
              
              container.innerHTML = subjects.map(subject => `
                <div class="card subject-card" style="border-left-color: ${subject.color || '#3e8bff'}">
                  <div class="subject-header">
                    <div>
                      <h3 class="subject-title">${subject.name}</h3>
                      <p class="subject-code">${subject.code || 'Sem código'}</p>
                    </div>
                  </div>
                  <div class="subject-stats">
                    <div class="stat">
                      <p class="stat-value">${subject.classCount || 0}</p>
                      <p class="stat-label">Aulas</p>
                    </div>
                    <div class="stat">
                      <p class="stat-value">${subject.taskCount || 0}</p>
                      <p class="stat-label">Tarefas</p>
                    </div>
                    <div class="stat">
                      <p class="stat-value">${subject.averageGrade?.toFixed(1) || '-'}</p>
                      <p class="stat-label">Média</p>
                    </div>
                  </div>
                </div>
              `).join('');
            } catch (error) {
              console.error('Erro ao carregar disciplinas:', error);
              container.innerHTML = '<p class="error-message">Erro ao carregar disciplinas. Tente novamente mais tarde.</p>';
            }
          }
        </script>
      </body>
      </html>
    `);
  });

  // Página de disciplinas
  app.get('/disciplinas', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MedStudios - Disciplinas</title>
        <style>
          :root {
            --primary: #3e8bff;
            --primary-dark: #2d7ae5;
            --background: #f8f7ff;
            --text: #141b2d;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background);
            color: var(--text);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          
          .app-container {
            display: flex;
            min-height: 100vh;
          }
          
          .sidebar {
            width: var(--sidebar-width);
            background-color: white;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
            padding: 1.5rem 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
          }
          
          .sidebar-header {
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid #eee;
            margin-bottom: 1.5rem;
          }
          
          .sidebar-header h1 {
            color: var(--primary);
            font-size: 1.5rem;
            margin: 0;
          }
          
          .nav-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .nav-item {
            margin-bottom: 0.5rem;
          }
          
          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            color: var(--text);
            text-decoration: none;
            transition: background-color 0.2s;
          }
          
          .nav-link:hover, .nav-link.active {
            background-color: rgba(62, 139, 255, 0.1);
            color: var(--primary);
          }
          
          .nav-link-icon {
            margin-right: 0.75rem;
            width: 20px;
            height: 20px;
          }
          
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          
          .page-title {
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0;
          }
          
          .user-info {
            display: flex;
            align-items: center;
          }
          
          .user-name {
            margin-right: 1rem;
            font-weight: 500;
          }
          
          .logout-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .logout-btn:hover {
            background-color: #f1f1f1;
          }
          
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .btn {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .btn:hover {
            background-color: var(--primary-dark);
          }
          
          .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
          
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
          }
          
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid var(--primary);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error-message {
            color: #e53e3e;
            text-align: center;
            padding: 1rem;
          }
          
          .subject-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
          }
          
          .subject-card {
            border-left: 4px solid var(--primary);
            transition: transform 0.2s;
          }
          
          .subject-card:hover {
            transform: translateY(-3px);
          }
          
          .subject-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .subject-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
          }
          
          .subject-code {
            font-size: 0.85rem;
            color: #666;
            margin: 0;
          }
          
          .subject-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
          }
          
          .action-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .action-btn:hover {
            background-color: #f1f1f1;
          }
          
          .action-btn.edit {
            color: #3e8bff;
          }
          
          .action-btn.delete {
            color: #e53e3e;
          }
          
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .modal.open {
            display: flex;
          }
          
          .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 100%;
            max-width: 500px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .modal-close {
            background-color: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
          }
          
          .form-group {
            margin-bottom: 1.5rem;
          }
          
          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          
          .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            font-family: inherit;
          }
          
          .form-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(62, 139, 255, 0.2);
          }
          
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }
          
          .btn-cancel {
            background-color: transparent;
            border: 1px solid #ddd;
            color: var(--text);
          }
          
          /* Responsividade */
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              z-index: 1000;
            }
            
            .sidebar.open {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
            }
            
            .menu-toggle {
              display: block;
              position: fixed;
              top: 1rem;
              left: 1rem;
              z-index: 1001;
              background-color: var(--primary);
              color: white;
              border: none;
              border-radius: 4px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            }
          }
        </style>
      </head>
      <body>
        <div class="app-container">
          <aside class="sidebar">
            <div class="sidebar-header">
              <h1>MedStudios</h1>
            </div>
            <nav>
              <ul class="nav-list">
                <li class="nav-item">
                  <a href="/dashboard" class="nav-link">
                    <span class="nav-link-icon">📊</span>
                    Dashboard
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/disciplinas" class="nav-link active">
                    <span class="nav-link-icon">📚</span>
                    Disciplinas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/aulas" class="nav-link">
                    <span class="nav-link-icon">🗓️</span>
                    Aulas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/tarefas" class="nav-link">
                    <span class="nav-link-icon">✅</span>
                    Tarefas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/notas" class="nav-link">
                    <span class="nav-link-icon">📝</span>
                    Notas
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main class="main-content">
            <header class="page-header">
              <h1 class="page-title">Disciplinas</h1>
              <div class="user-info">
                <span class="user-name" id="userName">Carregando...</span>
                <button class="logout-btn" id="logoutBtn">Sair</button>
              </div>
            </header>
            
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Minhas Disciplinas</h2>
                <button class="btn" id="addSubjectBtn">Nova Disciplina</button>
              </div>
              <div id="subjectsContainer" class="subject-list">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
        
        <!-- Modal de Adicionar/Editar Disciplina -->
        <div class="modal" id="subjectModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title" id="modalTitle">Nova Disciplina</h2>
              <button class="modal-close" id="closeModal">&times;</button>
            </div>
            <form id="subjectForm">
              <input type="hidden" id="subjectId">
              <div class="form-group">
                <label for="subjectName" class="form-label">Nome da Disciplina</label>
                <input type="text" id="subjectName" class="form-input" required>
              </div>
              <div class="form-group">
                <label for="subjectCode" class="form-label">Código da Disciplina</label>
                <input type="text" id="subjectCode" class="form-input">
              </div>
              <div class="form-group">
                <label for="subjectDescription" class="form-label">Descrição</label>
                <textarea id="subjectDescription" class="form-input" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label for="subjectColor" class="form-label">Cor</label>
                <input type="color" id="subjectColor" class="form-input" value="#3e8bff">
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-cancel" id="cancelSubject">Cancelar</button>
                <button type="submit" class="btn">Salvar</button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Modal de Confirmação de Exclusão -->
        <div class="modal" id="deleteModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title">Confirmar Exclusão</h2>
              <button class="modal-close" id="closeDeleteModal">&times;</button>
            </div>
            <p>Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita.</p>
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" id="cancelDelete">Cancelar</button>
              <button type="button" class="btn" style="background-color: #e53e3e;" id="confirmDelete">Excluir</button>
            </div>
          </div>
        </div>
        
        <script>
          // Verificar se o usuário está logado
          document.addEventListener('DOMContentLoaded', () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
              // Redirecionar para a página de login se não estiver logado
              window.location.href = '/';
              return;
            }
            
            const user = JSON.parse(userStr);
            document.getElementById('userName').textContent = user.name;
            
            // Configurar botão de logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
              localStorage.removeItem('user');
              window.location.href = '/';
            });
            
            // Carregar disciplinas
            fetchSubjects();
            
            // Configurar modal de disciplina
            setupSubjectModal();
            
            // Configurar modal de exclusão
            setupDeleteModal();
          });
          
          // Função para buscar disciplinas
          async function fetchSubjects() {
            const container = document.getElementById('subjectsContainer');
            
            try {
              const response = await fetch('/api/subjects');
              if (!response.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await response.json();
              
              if (subjects.length === 0) {
                container.innerHTML = '<p>Nenhuma disciplina encontrada. Adicione sua primeira disciplina!</p>';
                return;
              }
              
              container.innerHTML = subjects.map(subject => `
                <div class="card subject-card" style="border-left-color: ${subject.color || '#3e8bff'}">
                  <div class="subject-header">
                    <div>
                      <h3 class="subject-title">${subject.name}</h3>
                      <p class="subject-code">${subject.code || 'Sem código'}</p>
                    </div>
                  </div>
                  <p>${subject.description || 'Sem descrição'}</p>
                  <div class="subject-actions">
                    <button class="action-btn edit" data-id="${subject.id}" data-action="edit">
                      ✏️ Editar
                    </button>
                    <button class="action-btn delete" data-id="${subject.id}" data-action="delete">
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              `).join('');
              
              // Adicionar event listeners para os botões de ação
              document.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', handleSubjectAction);
              });
            } catch (error) {
              console.error('Erro ao carregar disciplinas:', error);
              container.innerHTML = '<p class="error-message">Erro ao carregar disciplinas. Tente novamente mais tarde.</p>';
            }
          }
          
          // Configurar modal de disciplina
          function setupSubjectModal() {
            const modal = document.getElementById('subjectModal');
            const form = document.getElementById('subjectForm');
            const addBtn = document.getElementById('addSubjectBtn');
            const closeBtn = document.getElementById('closeModal');
            const cancelBtn = document.getElementById('cancelSubject');
            
            // Abrir modal para adicionar
            addBtn.addEventListener('click', () => {
              document.getElementById('modalTitle').textContent = 'Nova Disciplina';
              form.reset();
              document.getElementById('subjectId').value = '';
              document.getElementById('subjectColor').value = '#3e8bff';
              modal.classList.add('open');
            });
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Enviar formulário
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const subjectId = document.getElementById('subjectId').value;
              const name = document.getElementById('subjectName').value;
              const code = document.getElementById('subjectCode').value;
              const description = document.getElementById('subjectDescription').value;
              const color = document.getElementById('subjectColor').value;
              
              const subjectData = {
                name,
                code,
                description,
                color
              };
              
              try {
                let response;
                
                if (subjectId) {
                  // Atualizar disciplina existente
                  response = await fetch(`/api/subjects/${subjectId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subjectData)
                  });
                } else {
                  // Criar nova disciplina
                  response = await fetch('/api/subjects', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subjectData)
                  });
                }
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao salvar disciplina');
                }
                
                // Fechar modal e recarregar disciplinas
                modal.classList.remove('open');
                fetchSubjects();
              } catch (error) {
                console.error('Erro ao salvar disciplina:', error);
                alert(`Erro ao salvar disciplina: ${error.message}`);
              }
            });
          }
          
          // Configurar modal de exclusão
          function setupDeleteModal() {
            const modal = document.getElementById('deleteModal');
            const closeBtn = document.getElementById('closeDeleteModal');
            const cancelBtn = document.getElementById('cancelDelete');
            const confirmBtn = document.getElementById('confirmDelete');
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Confirmar exclusão
            confirmBtn.addEventListener('click', async () => {
              const subjectId = confirmBtn.dataset.id;
              
              try {
                const response = await fetch(`/api/subjects/${subjectId}`, {
                  method: 'DELETE'
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao excluir disciplina');
                }
                
                // Fechar modal e recarregar disciplinas
                modal.classList.remove('open');
                fetchSubjects();
              } catch (error) {
                console.error('Erro ao excluir disciplina:', error);
                alert(`Erro ao excluir disciplina: ${error.message}`);
              }
            });
          }
          
          // Lidar com ações de disciplina (editar/excluir)
          async function handleSubjectAction(e) {
            const btn = e.currentTarget;
            const action = btn.dataset.action;
            const subjectId = btn.dataset.id;
            
            if (action === 'edit') {
              // Buscar dados da disciplina e abrir modal de edição
              try {
                const response = await fetch(`/api/subjects/${subjectId}`);
                if (!response.ok) throw new Error('Falha ao carregar dados da disciplina');
                
                const subject = await response.json();
                
                // Preencher formulário
                document.getElementById('modalTitle').textContent = 'Editar Disciplina';
                document.getElementById('subjectId').value = subject.id;
                document.getElementById('subjectName').value = subject.name;
                document.getElementById('subjectCode').value = subject.code || '';
                document.getElementById('subjectDescription').value = subject.description || '';
                document.getElementById('subjectColor').value = subject.color || '#3e8bff';
                
                // Abrir modal
                document.getElementById('subjectModal').classList.add('open');
              } catch (error) {
                console.error('Erro ao carregar dados da disciplina:', error);
                alert('Erro ao carregar dados da disciplina. Tente novamente.');
              }
            } else if (action === 'delete') {
              // Configurar e abrir modal de confirmação de exclusão
              document.getElementById('confirmDelete').dataset.id = subjectId;
              document.getElementById('deleteModal').classList.add('open');
            }
          }
        </script>
      </body>
      </html>
    `);
  });
  
  // Página de aulas
  app.get('/aulas', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MedStudios - Aulas</title>
        <style>
          :root {
            --primary: #3e8bff;
            --primary-dark: #2d7ae5;
            --background: #f8f7ff;
            --text: #141b2d;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background);
            color: var(--text);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          
          .app-container {
            display: flex;
            min-height: 100vh;
          }
          
          .sidebar {
            width: var(--sidebar-width);
            background-color: white;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
            padding: 1.5rem 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
          }
          
          .sidebar-header {
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid #eee;
            margin-bottom: 1.5rem;
          }
          
          .sidebar-header h1 {
            color: var(--primary);
            font-size: 1.5rem;
            margin: 0;
          }
          
          .nav-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .nav-item {
            margin-bottom: 0.5rem;
          }
          
          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            color: var(--text);
            text-decoration: none;
            transition: background-color 0.2s;
          }
          
          .nav-link:hover, .nav-link.active {
            background-color: rgba(62, 139, 255, 0.1);
            color: var(--primary);
          }
          
          .nav-link-icon {
            margin-right: 0.75rem;
            width: 20px;
            height: 20px;
          }
          
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          
          .page-title {
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0;
          }
          
          .user-info {
            display: flex;
            align-items: center;
          }
          
          .user-name {
            margin-right: 1rem;
            font-weight: 500;
          }
          
          .logout-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .logout-btn:hover {
            background-color: #f1f1f1;
          }
          
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .btn {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .btn:hover {
            background-color: var(--primary-dark);
          }
          
          .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
          
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
          }
          
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid var(--primary);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error-message {
            color: #e53e3e;
            text-align: center;
            padding: 1rem;
          }
          
          .class-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .class-card {
            border-left: 4px solid var(--primary);
            transition: transform 0.2s;
          }
          
          .class-card:hover {
            transform: translateY(-3px);
          }
          
          .class-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .class-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
          }
          
          .class-subject {
            font-size: 0.85rem;
            color: #666;
            margin: 0;
          }
          
          .class-date {
            font-size: 0.85rem;
            color: #666;
            margin: 0.5rem 0;
          }
          
          .class-type {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-right: 0.5rem;
          }
          
          .class-type.lecture {
            background-color: rgba(62, 139, 255, 0.1);
            color: var(--primary);
          }
          
          .class-type.lab {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }
          
          .class-type.seminar {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
          }
          
          .class-type.exam {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          
          .class-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
          }
          
          .action-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .action-btn:hover {
            background-color: #f1f1f1;
          }
          
          .action-btn.edit {
            color: #3e8bff;
          }
          
          .action-btn.delete {
            color: #e53e3e;
          }
          
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .modal.open {
            display: flex;
          }
          
          .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 100%;
            max-width: 500px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .modal-close {
            background-color: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
          }
          
          .form-group {
            margin-bottom: 1.5rem;
          }
          
          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          
          .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            font-family: inherit;
          }
          
          .form-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(62, 139, 255, 0.2);
          }
          
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }
          
          .btn-cancel {
            background-color: transparent;
            border: 1px solid #ddd;
            color: var(--text);
          }
          
          /* Responsividade */
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              z-index: 1000;
            }
            
            .sidebar.open {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
            }
            
            .menu-toggle {
              display: block;
              position: fixed;
              top: 1rem;
              left: 1rem;
              z-index: 1001;
              background-color: var(--primary);
              color: white;
              border: none;
              border-radius: 4px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            }
          }
        </style>
      </head>
      <body>
        <div class="app-container">
          <aside class="sidebar">
            <div class="sidebar-header">
              <h1>MedStudios</h1>
            </div>
            <nav>
              <ul class="nav-list">
                <li class="nav-item">
                  <a href="/dashboard" class="nav-link">
                    <span class="nav-link-icon">📊</span>
                    Dashboard
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/disciplinas" class="nav-link">
                    <span class="nav-link-icon">📚</span>
                    Disciplinas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/aulas" class="nav-link active">
                    <span class="nav-link-icon">🗓️</span>
                    Aulas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/tarefas" class="nav-link">
                    <span class="nav-link-icon">✅</span>
                    Tarefas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/notas" class="nav-link">
                    <span class="nav-link-icon">📝</span>
                    Notas
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main class="main-content">
            <header class="page-header">
              <h1 class="page-title">Aulas</h1>
              <div class="user-info">
                <span class="user-name" id="userName">Carregando...</span>
                <button class="logout-btn" id="logoutBtn">Sair</button>
              </div>
            </header>
            
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Minhas Aulas</h2>
                <button class="btn" id="addClassBtn">Nova Aula</button>
              </div>
              <div id="classesContainer" class="class-list">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
        
        <!-- Modal de Adicionar/Editar Aula -->
        <div class="modal" id="classModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title" id="modalTitle">Nova Aula</h2>
              <button class="modal-close" id="closeModal">&times;</button>
            </div>
            <form id="classForm">
              <input type="hidden" id="classId">
              <div class="form-group">
                <label for="classTitle" class="form-label">Título da Aula</label>
                <input type="text" id="classTitle" class="form-input" required>
              </div>
              <div class="form-group">
                <label for="classSubject" class="form-label">Disciplina</label>
                <select id="classSubject" class="form-input" required>
                  <option value="">Selecione uma disciplina</option>
                </select>
              </div>
              <div class="form-group">
                <label for="classType" class="form-label">Tipo de Aula</label>
                <select id="classType" class="form-input" required>
                  <option value="lecture">Aula Teórica</option>
                  <option value="lab">Aula Prática</option>
                  <option value="seminar">Seminário</option>
                  <option value="exam">Prova</option>
                </select>
              </div>
              <div class="form-group">
                <label for="classDate" class="form-label">Data</label>
                <input type="date" id="classDate" class="form-input" required>
              </div>
              <div class="form-group">
                <label for="classTime" class="form-label">Horário</label>
                <input type="time" id="classTime" class="form-input" required>
              </div>
              <div class="form-group">
                <label for="classDuration" class="form-label">Duração (minutos)</label>
                <input type="number" id="classDuration" class="form-input" min="15" step="15" value="60" required>
              </div>
              <div class="form-group">
                <label for="classLocation" class="form-label">Local</label>
                <input type="text" id="classLocation" class="form-input">
              </div>
              <div class="form-group">
                <label for="classNotes" class="form-label">Observações</label>
                <textarea id="classNotes" class="form-input" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-cancel" id="cancelClass">Cancelar</button>
                <button type="submit" class="btn">Salvar</button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Modal de Confirmação de Exclusão -->
        <div class="modal" id="deleteModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title">Confirmar Exclusão</h2>
              <button class="modal-close" id="closeDeleteModal">&times;</button>
            </div>
            <p>Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.</p>
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" id="cancelDelete">Cancelar</button>
              <button type="button" class="btn" style="background-color: #e53e3e;" id="confirmDelete">Excluir</button>
            </div>
          </div>
        </div>
        
        <script>
          // Verificar se o usuário está logado
          document.addEventListener('DOMContentLoaded', () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
              // Redirecionar para a página de login se não estiver logado
              window.location.href = '/';
              return;
            }
            
            const user = JSON.parse(userStr);
            document.getElementById('userName').textContent = user.name;
            
            // Configurar botão de logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
              localStorage.removeItem('user');
              window.location.href = '/';
            });
            
            // Carregar disciplinas para o select
            loadSubjectsForSelect();
            
            // Carregar aulas
            fetchClasses();
            
            // Configurar modal de aula
            setupClassModal();
            
            // Configurar modal de exclusão
            setupDeleteModal();
          });
          
          // Função para carregar disciplinas para o select
          async function loadSubjectsForSelect() {
            try {
              const response = await fetch('/api/subjects');
              if (!response.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await response.json();
              const select = document.getElementById('classSubject');
              
              // Limpar opções existentes, exceto a primeira
              while (select.options.length > 1) {
                select.remove(1);
              }
              
              // Adicionar disciplinas como opções
              subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                select.appendChild(option);
              });
            } catch (error) {
              console.error('Erro ao carregar disciplinas:', error);
              alert('Erro ao carregar disciplinas. Tente novamente.');
            }
          }
          
          // Função para buscar aulas
          async function fetchClasses() {
            const container = document.getElementById('classesContainer');
            
            try {
              const response = await fetch('/api/classes');
              if (!response.ok) throw new Error('Falha ao carregar aulas');
              
              const classes = await response.json();
              
              if (classes.length === 0) {
                container.innerHTML = '<p>Nenhuma aula encontrada. Adicione sua primeira aula!</p>';
                return;
              }
              
              // Buscar disciplinas para mostrar os nomes
              const subjectsResponse = await fetch('/api/subjects');
              if (!subjectsResponse.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await subjectsResponse.json();
              const subjectsMap = {};
              subjects.forEach(subject => {
                subjectsMap[subject.id] = subject;
              });
              
              // Ordenar aulas por data
              classes.sort((a, b) => new Date(a.date) - new Date(b.date));
              
              // Formatar tipo de aula
              const classTypeLabels = {
                lecture: 'Aula Teórica',
                lab: 'Aula Prática',
                seminar: 'Seminário',
                exam: 'Prova'
              };
              
              container.innerHTML = classes.map(classItem => {
                const subject = subjectsMap[classItem.subjectId] || { name: 'Disciplina não encontrada', color: '#3e8bff' };
                const classDate = new Date(classItem.date);
                const formattedDate = classDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                const formattedTime = classItem.time;
                
                return `
                  <div class="card class-card" style="border-left-color: ${subject.color || '#3e8bff'}">
                    <div class="class-header">
                      <div>
                        <h3 class="class-title">${classItem.title}</h3>
                        <p class="class-subject">${subject.name}</p>
                        <p class="class-date">${formattedDate} às ${formattedTime}</p>
                      </div>
                      <span class="class-type ${classItem.type}">${classTypeLabels[classItem.type] || classItem.type}</span>
                    </div>
                    <p>${classItem.location ? `Local: ${classItem.location}` : ''}</p>
                    <p>${classItem.notes || ''}</p>
                    <div class="class-actions">
                      <button class="action-btn edit" data-id="${classItem.id}" data-action="edit">
                        ✏️ Editar
                      </button>
                      <button class="action-btn delete" data-id="${classItem.id}" data-action="delete">
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                `;
              }).join('');
              
              // Adicionar event listeners para os botões de ação
              document.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', handleClassAction);
              });
            } catch (error) {
              console.error('Erro ao carregar aulas:', error);
              container.innerHTML = '<p class="error-message">Erro ao carregar aulas. Tente novamente mais tarde.</p>';
            }
          }
          
          // Configurar modal de aula
          function setupClassModal() {
            const modal = document.getElementById('classModal');
            const form = document.getElementById('classForm');
            const addBtn = document.getElementById('addClassBtn');
            const closeBtn = document.getElementById('closeModal');
            const cancelBtn = document.getElementById('cancelClass');
            
            // Abrir modal para adicionar
            addBtn.addEventListener('click', () => {
              document.getElementById('modalTitle').textContent = 'Nova Aula';
              form.reset();
              document.getElementById('classId').value = '';
              
              // Definir data padrão como hoje
              const today = new Date();
              const formattedDate = today.toISOString().split('T')[0];
              document.getElementById('classDate').value = formattedDate;
              
              modal.classList.add('open');
            });
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Enviar formulário
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const classId = document.getElementById('classId').value;
              const title = document.getElementById('classTitle').value;
              const subjectId = document.getElementById('classSubject').value;
              const type = document.getElementById('classType').value;
              const date = document.getElementById('classDate').value;
              const time = document.getElementById('classTime').value;
              const duration = document.getElementById('classDuration').value;
              const location = document.getElementById('classLocation').value;
              const notes = document.getElementById('classNotes').value;
              
              const classData = {
                title,
                subjectId,
                type,
                date,
                time,
                duration: parseInt(duration),
                location,
                notes
              };
              
              try {
                let response;
                
                if (classId) {
                  // Atualizar aula existente
                  response = await fetch(`/api/classes/${classId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(classData)
                  });
                } else {
                  // Criar nova aula
                  response = await fetch('/api/classes', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(classData)
                  });
                }
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao salvar aula');
                }
                
                // Fechar modal e recarregar aulas
                modal.classList.remove('open');
                fetchClasses();
              } catch (error) {
                console.error('Erro ao salvar aula:', error);
                alert(`Erro ao salvar aula: ${error.message}`);
              }
            });
          }
          
          // Configurar modal de exclusão
          function setupDeleteModal() {
            const modal = document.getElementById('deleteModal');
            const closeBtn = document.getElementById('closeDeleteModal');
            const cancelBtn = document.getElementById('cancelDelete');
            const confirmBtn = document.getElementById('confirmDelete');
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Confirmar exclusão
            confirmBtn.addEventListener('click', async () => {
              const classId = confirmBtn.dataset.id;
              
              try {
                const response = await fetch(`/api/classes/${classId}`, {
                  method: 'DELETE'
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao excluir aula');
                }
                
                // Fechar modal e recarregar aulas
                modal.classList.remove('open');
                fetchClasses();
              } catch (error) {
                console.error('Erro ao excluir aula:', error);
                alert(`Erro ao excluir aula: ${error.message}`);
              }
            });
          }
          
          // Lidar com ações de aula (editar/excluir)
          async function handleClassAction(e) {
            const btn = e.currentTarget;
            const action = btn.dataset.action;
            const classId = btn.dataset.id;
            
            if (action === 'edit') {
              // Buscar dados da aula e abrir modal de edição
              try {
                const response = await fetch(`/api/classes/${classId}`);
                if (!response.ok) throw new Error('Falha ao carregar dados da aula');
                
                const classData = await response.json();
                
                // Preencher formulário
                document.getElementById('modalTitle').textContent = 'Editar Aula';
                document.getElementById('classId').value = classData.id;
                document.getElementById('classTitle').value = classData.title;
                document.getElementById('classSubject').value = classData.subjectId;
                document.getElementById('classType').value = classData.type;
                document.getElementById('classDate').value = classData.date;
                document.getElementById('classTime').value = classData.time;
                document.getElementById('classDuration').value = classData.duration;
                document.getElementById('classLocation').value = classData.location || '';
                document.getElementById('classNotes').value = classData.notes || '';
                
                // Abrir modal
                document.getElementById('classModal').classList.add('open');
              } catch (error) {
                console.error('Erro ao carregar dados da aula:', error);
                alert('Erro ao carregar dados da aula. Tente novamente.');
              }
            } else if (action === 'delete') {
              // Configurar e abrir modal de confirmação de exclusão
              document.getElementById('confirmDelete').dataset.id = classId;
              document.getElementById('deleteModal').classList.add('open');
            }
          }
        </script>
      </body>
      </html>
    `);
  });
  
  // Página de tarefas
  app.get('/tarefas', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MedStudios - Tarefas</title>
        <style>
          :root {
            --primary: #3e8bff;
            --primary-dark: #2d7ae5;
            --background: #f8f7ff;
            --text: #141b2d;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background);
            color: var(--text);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          
          .app-container {
            display: flex;
            min-height: 100vh;
          }
          
          .sidebar {
            width: var(--sidebar-width);
            background-color: white;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
            padding: 1.5rem 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
          }
          
          .sidebar-header {
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid #eee;
            margin-bottom: 1.5rem;
          }
          
          .sidebar-header h1 {
            color: var(--primary);
            font-size: 1.5rem;
            margin: 0;
          }
          
          .nav-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .nav-item {
            margin-bottom: 0.5rem;
          }
          
          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            color: var(--text);
            text-decoration: none;
            transition: background-color 0.2s;
          }
          
          .nav-link:hover, .nav-link.active {
            background-color: rgba(62, 139, 255, 0.1);
            color: var(--primary);
          }
          
          .nav-link-icon {
            margin-right: 0.75rem;
            width: 20px;
            height: 20px;
          }
          
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          
          .page-title {
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0;
          }
          
          .user-info {
            display: flex;
            align-items: center;
          }
          
          .user-name {
            margin-right: 1rem;
            font-weight: 500;
          }
          
          .logout-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .logout-btn:hover {
            background-color: #f1f1f1;
          }
          
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .btn {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .btn:hover {
            background-color: var(--primary-dark);
          }
          
          .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
          
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
          }
          
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid var(--primary);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error-message {
            color: #e53e3e;
            text-align: center;
            padding: 1rem;
          }
          
          .task-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .task-card {
            border-left: 4px solid var(--primary);
            transition: transform 0.2s;
          }
          
          .task-card:hover {
            transform: translateY(-3px);
          }
          
          .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .task-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
          }
          
          .task-subject {
            font-size: 0.85rem;
            color: #666;
            margin: 0;
          }
          
          .task-date {
            font-size: 0.85rem;
            color: #666;
            margin: 0.5rem 0;
          }
          
          .task-status {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-right: 0.5rem;
          }
          
          .task-status.pending {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
          }
          
          .task-status.in_progress {
            background-color: rgba(62, 139, 255, 0.1);
            color: var(--primary);
          }
          
          .task-status.completed {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }
          
          .task-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
          }
          
          .action-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .action-btn:hover {
            background-color: #f1f1f1;
          }
          
          .action-btn.edit {
            color: #3e8bff;
          }
          
          .action-btn.delete {
            color: #e53e3e;
          }
          
          .action-btn.complete {
            color: #10b981;
          }
          
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .modal.open {
            display: flex;
          }
          
          .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 100%;
            max-width: 500px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .modal-close {
            background-color: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
          }
          
          .form-group {
            margin-bottom: 1.5rem;
          }
          
          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          
          .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            font-family: inherit;
          }
          
          .form-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(62, 139, 255, 0.2);
          }
          
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }
          
          .btn-cancel {
            background-color: transparent;
            border: 1px solid #ddd;
            color: var(--text);
          }
          
          .task-filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .filter-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .filter-btn.active {
            background-color: var(--primary);
            color: white;
            border-color: var(--primary);
          }
          
          /* Responsividade */
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              z-index: 1000;
            }
            
            .sidebar.open {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
            }
            
            .menu-toggle {
              display: block;
              position: fixed;
              top: 1rem;
              left: 1rem;
              z-index: 1001;
              background-color: var(--primary);
              color: white;
              border: none;
              border-radius: 4px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            }
          }
        </style>
      </head>
      <body>
        <div class="app-container">
          <aside class="sidebar">
            <div class="sidebar-header">
              <h1>MedStudios</h1>
            </div>
            <nav>
              <ul class="nav-list">
                <li class="nav-item">
                  <a href="/dashboard" class="nav-link">
                    <span class="nav-link-icon">📊</span>
                    Dashboard
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/disciplinas" class="nav-link">
                    <span class="nav-link-icon">📚</span>
                    Disciplinas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/aulas" class="nav-link">
                    <span class="nav-link-icon">🗓️</span>
                    Aulas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/tarefas" class="nav-link active">
                    <span class="nav-link-icon">✅</span>
                    Tarefas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/notas" class="nav-link">
                    <span class="nav-link-icon">📝</span>
                    Notas
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main class="main-content">
            <header class="page-header">
              <h1 class="page-title">Tarefas</h1>
              <div class="user-info">
                <span class="user-name" id="userName">Carregando...</span>
                <button class="logout-btn" id="logoutBtn">Sair</button>
              </div>
            </header>
            
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Minhas Tarefas</h2>
                <button class="btn" id="addTaskBtn">Nova Tarefa</button>
              </div>
              <div class="task-filters">
                <button class="filter-btn active" data-filter="all">Todas</button>
                <button class="filter-btn" data-filter="pending">Pendentes</button>
                <button class="filter-btn" data-filter="in_progress">Em Andamento</button>
                <button class="filter-btn" data-filter="completed">Concluídas</button>
              </div>
              <div id="tasksContainer" class="task-list">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
        
        <!-- Modal de Adicionar/Editar Tarefa -->
        <div class="modal" id="taskModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title" id="modalTitle">Nova Tarefa</h2>
              <button class="modal-close" id="closeModal">&times;</button>
            </div>
            <form id="taskForm">
              <input type="hidden" id="taskId">
              <div class="form-group">
                <label for="taskTitle" class="form-label">Título da Tarefa</label>
                <input type="text" id="taskTitle" class="form-input" required>
              </div>
              <div class="form-group">
                <label for="taskSubject" class="form-label">Disciplina</label>
                <select id="taskSubject" class="form-input" required>
                  <option value="">Selecione uma disciplina</option>
                </select>
              </div>
              <div class="form-group">
                <label for="taskDescription" class="form-label">Descrição</label>
                <textarea id="taskDescription" class="form-input" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label for="taskDueDate" class="form-label">Data de Entrega</label>
                <input type="date" id="taskDueDate" class="form-input" required>
              </div>
              <div class="form-group">
                <label for="taskStatus" class="form-label">Status</label>
                <select id="taskStatus" class="form-input" required>
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-cancel" id="cancelTask">Cancelar</button>
                <button type="submit" class="btn">Salvar</button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Modal de Confirmação de Exclusão -->
        <div class="modal" id="deleteModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title">Confirmar Exclusão</h2>
              <button class="modal-close" id="closeDeleteModal">&times;</button>
            </div>
            <p>Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" id="cancelDelete">Cancelar</button>
              <button type="button" class="btn" style="background-color: #e53e3e;" id="confirmDelete">Excluir</button>
            </div>
          </div>
        </div>
        
        <script>
          // Verificar se o usuário está logado
          document.addEventListener('DOMContentLoaded', () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
              // Redirecionar para a página de login se não estiver logado
              window.location.href = '/';
              return;
            }
            
            const user = JSON.parse(userStr);
            document.getElementById('userName').textContent = user.name;
            
            // Configurar botão de logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
              localStorage.removeItem('user');
              window.location.href = '/';
            });
            
            // Carregar disciplinas para o select
            loadSubjectsForSelect();
            
            // Carregar tarefas
            fetchTasks();
            
            // Configurar modal de tarefa
            setupTaskModal();
            
            // Configurar modal de exclusão
            setupDeleteModal();
            
            // Configurar filtros
            setupFilters();
          });
          
          // Função para carregar disciplinas para o select
          async function loadSubjectsForSelect() {
            try {
              const response = await fetch('/api/subjects');
              if (!response.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await response.json();
              const select = document.getElementById('taskSubject');
              
              // Limpar opções existentes, exceto a primeira
              while (select.options.length > 1) {
                select.remove(1);
              }
              
              // Adicionar disciplinas como opções
              subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                select.appendChild(option);
              });
            } catch (error) {
              console.error('Erro ao carregar disciplinas:', error);
              alert('Erro ao carregar disciplinas. Tente novamente.');
            }
          }
          
          // Variável para armazenar todas as tarefas
          let allTasks = [];
          
          // Função para buscar tarefas
          async function fetchTasks() {
            const container = document.getElementById('tasksContainer');
            
            try {
              const response = await fetch('/api/tasks');
              if (!response.ok) throw new Error('Falha ao carregar tarefas');
              
              allTasks = await response.json();
              
              if (allTasks.length === 0) {
                container.innerHTML = '<p>Nenhuma tarefa encontrada. Adicione sua primeira tarefa!</p>';
                return;
              }
              
              // Buscar disciplinas para mostrar os nomes
              const subjectsResponse = await fetch('/api/subjects');
              if (!subjectsResponse.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await subjectsResponse.json();
              const subjectsMap = {};
              subjects.forEach(subject => {
                subjectsMap[subject.id] = subject;
              });
              
              // Ordenar tarefas por data de entrega
              allTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
              
              // Renderizar tarefas (todas inicialmente)
              renderTasks(allTasks, subjectsMap);
            } catch (error) {
              console.error('Erro ao carregar tarefas:', error);
              container.innerHTML = '<p class="error-message">Erro ao carregar tarefas. Tente novamente mais tarde.</p>';
            }
          }
          
          // Função para renderizar tarefas filtradas
          function renderTasks(tasks, subjectsMap) {
            const container = document.getElementById('tasksContainer');
            
            // Formatar status da tarefa
            const taskStatusLabels = {
              pending: 'Pendente',
              in_progress: 'Em Andamento',
              completed: 'Concluída'
            };
            
            container.innerHTML = tasks.map(task => {
              const subject = subjectsMap[task.subjectId] || { name: 'Disciplina não encontrada', color: '#3e8bff' };
              const dueDate = new Date(task.dueDate);
              const formattedDate = dueDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
              
              // Verificar se a data de entrega já passou (para tarefas não concluídas)
              const isOverdue = task.status !== 'completed' && dueDate < new Date() && dueDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
              
              return `
                <div class="card task-card" style="border-left-color: ${subject.color || '#3e8bff'}">
                  <div class="task-header">
                    <div>
                      <h3 class="task-title">${task.title}</h3>
                      <p class="task-subject">${subject.name}</p>
                      <p class="task-date" ${isOverdue ? 'style="color: #e53e3e;"' : ''}>
                        ${isOverdue ? '⚠️ Atrasada - ' : ''}Entrega: ${formattedDate}
                      </p>
                    </div>
                    <span class="task-status ${task.status}">${taskStatusLabels[task.status] || task.status}</span>
                  </div>
                  <p>${task.description || ''}</p>
                  <div class="task-actions">
                    ${task.status !== 'completed' ? `
                      <button class="action-btn complete" data-id="${task.id}" data-action="complete">
                        ✓ Concluir
                      </button>
                    ` : ''}
                    <button class="action-btn edit" data-id="${task.id}" data-action="edit">
                      ✏️ Editar
                    </button>
                    <button class="action-btn delete" data-id="${task.id}" data-action="delete">
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              `;
            }).join('');
            
            // Adicionar event listeners para os botões de ação
            document.querySelectorAll('.action-btn').forEach(btn => {
              btn.addEventListener('click', handleTaskAction);
            });
          }
          
          // Configurar filtros
          function setupFilters() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            filterButtons.forEach(btn => {
              btn.addEventListener('click', async () => {
                // Remover classe ativa de todos os botões
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // Adicionar classe ativa ao botão clicado
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                
                // Se não temos disciplinas ou tarefas, buscar novamente
                if (allTasks.length === 0) {
                  await fetchTasks();
                }
                
                // Buscar disciplinas para mostrar os nomes
                const subjectsResponse = await fetch('/api/subjects');
                if (!subjectsResponse.ok) throw new Error('Falha ao carregar disciplinas');
                
                const subjects = await subjectsResponse.json();
                const subjectsMap = {};
                subjects.forEach(subject => {
                  subjectsMap[subject.id] = subject;
                });
                
                // Filtrar tarefas
                let filteredTasks = allTasks;
                if (filter !== 'all') {
                  filteredTasks = allTasks.filter(task => task.status === filter);
                }
                
                // Renderizar tarefas filtradas
                renderTasks(filteredTasks, subjectsMap);
              });
            });
          }
          
          // Configurar modal de tarefa
          function setupTaskModal() {
            const modal = document.getElementById('taskModal');
            const form = document.getElementById('taskForm');
            const addBtn = document.getElementById('addTaskBtn');
            const closeBtn = document.getElementById('closeModal');
            const cancelBtn = document.getElementById('cancelTask');
            
            // Abrir modal para adicionar
            addBtn.addEventListener('click', () => {
              document.getElementById('modalTitle').textContent = 'Nova Tarefa';
              form.reset();
              document.getElementById('taskId').value = '';
              
              // Definir data padrão como hoje
              const today = new Date();
              const formattedDate = today.toISOString().split('T')[0];
              document.getElementById('taskDueDate').value = formattedDate;
              
              // Status padrão: pendente
              document.getElementById('taskStatus').value = 'pending';
              
              modal.classList.add('open');
            });
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Enviar formulário
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const taskId = document.getElementById('taskId').value;
              const title = document.getElementById('taskTitle').value;
              const subjectId = document.getElementById('taskSubject').value;
              const description = document.getElementById('taskDescription').value;
              const dueDate = document.getElementById('taskDueDate').value;
              const status = document.getElementById('taskStatus').value;
              
              const taskData = {
                title,
                subjectId,
                description,
                dueDate,
                status
              };
              
              try {
                let response;
                
                if (taskId) {
                  // Atualizar tarefa existente
                  response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskData)
                  });
                } else {
                  // Criar nova tarefa
                  response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskData)
                  });
                }
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao salvar tarefa');
                }
                
                // Fechar modal e recarregar tarefas
                modal.classList.remove('open');
                fetchTasks();
              } catch (error) {
                console.error('Erro ao salvar tarefa:', error);
                alert(`Erro ao salvar tarefa: ${error.message}`);
              }
            });
          }
          
          // Configurar modal de exclusão
          function setupDeleteModal() {
            const modal = document.getElementById('deleteModal');
            const closeBtn = document.getElementById('closeDeleteModal');
            const cancelBtn = document.getElementById('cancelDelete');
            const confirmBtn = document.getElementById('confirmDelete');
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Confirmar exclusão
            confirmBtn.addEventListener('click', async () => {
              const taskId = confirmBtn.dataset.id;
              
              try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                  method: 'DELETE'
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao excluir tarefa');
                }
                
                // Fechar modal e recarregar tarefas
                modal.classList.remove('open');
                fetchTasks();
              } catch (error) {
                console.error('Erro ao excluir tarefa:', error);
                alert(`Erro ao excluir tarefa: ${error.message}`);
              }
            });
          }
          
          // Lidar com ações de tarefa (editar/excluir/concluir)
          async function handleTaskAction(e) {
            const btn = e.currentTarget;
            const action = btn.dataset.action;
            const taskId = btn.dataset.id;
            
            if (action === 'edit') {
              // Buscar dados da tarefa e abrir modal de edição
              try {
                const response = await fetch(`/api/tasks/${taskId}`);
                if (!response.ok) throw new Error('Falha ao carregar dados da tarefa');
                
                const taskData = await response.json();
                
                // Preencher formulário
                document.getElementById('modalTitle').textContent = 'Editar Tarefa';
                document.getElementById('taskId').value = taskData.id;
                document.getElementById('taskTitle').value = taskData.title;
                document.getElementById('taskSubject').value = taskData.subjectId;
                document.getElementById('taskDescription').value = taskData.description || '';
                document.getElementById('taskDueDate').value = taskData.dueDate;
                document.getElementById('taskStatus').value = taskData.status;
                
                // Abrir modal
                document.getElementById('taskModal').classList.add('open');
              } catch (error) {
                console.error('Erro ao carregar dados da tarefa:', error);
                alert('Erro ao carregar dados da tarefa. Tente novamente.');
              }
            } else if (action === 'delete') {
              // Configurar e abrir modal de confirmação de exclusão
              document.getElementById('confirmDelete').dataset.id = taskId;
              document.getElementById('deleteModal').classList.add('open');
            } else if (action === 'complete') {
              // Marcar tarefa como concluída
              try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ status: 'completed' })
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao concluir tarefa');
                }
                
                // Recarregar tarefas
                fetchTasks();
              } catch (error) {
                console.error('Erro ao concluir tarefa:', error);
                alert(`Erro ao concluir tarefa: ${error.message}`);
              }
            }
          }
        </script>
      </body>
      </html>
    `);
  });
  
  // Página de notas
  app.get('/notas', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MedStudios - Notas</title>
        <style>
          :root {
            --primary: #3e8bff;
            --primary-dark: #2d7ae5;
            --background: #f8f7ff;
            --text: #141b2d;
            --sidebar-width: 250px;
          }
          
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background);
            color: var(--text);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          
          .app-container {
            display: flex;
            min-height: 100vh;
          }
          
          .sidebar {
            width: var(--sidebar-width);
            background-color: white;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
            padding: 1.5rem 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
          }
          
          .sidebar-header {
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid #eee;
            margin-bottom: 1.5rem;
          }
          
          .sidebar-header h1 {
            color: var(--primary);
            font-size: 1.5rem;
            margin: 0;
          }
          
          .nav-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .nav-item {
            margin-bottom: 0.5rem;
          }
          
          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            color: var(--text);
            text-decoration: none;
            transition: background-color 0.2s;
          }
          
          .nav-link:hover, .nav-link.active {
            background-color: rgba(62, 139, 255, 0.1);
            color: var(--primary);
          }
          
          .nav-link-icon {
            margin-right: 0.75rem;
            width: 20px;
            height: 20px;
          }
          
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 2rem;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          
          .page-title {
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0;
          }
          
          .user-info {
            display: flex;
            align-items: center;
          }
          
          .user-name {
            margin-right: 1rem;
            font-weight: 500;
          }
          
          .logout-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .logout-btn:hover {
            background-color: #f1f1f1;
          }
          
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .btn {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .btn:hover {
            background-color: var(--primary-dark);
          }
          
          .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
          
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
          }
          
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid var(--primary);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error-message {
            color: #e53e3e;
            text-align: center;
            padding: 1rem;
          }
          
          .grades-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }
          
          .grades-table th,
          .grades-table td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          
          .grades-table th {
            font-weight: 600;
            color: #666;
            background-color: #f9f9f9;
          }
          
          .grades-table tr:hover {
            background-color: #f5f5f5;
          }
          
          .grade-value {
            font-weight: 600;
          }
          
          .grade-value.good {
            color: #10b981;
          }
          
          .grade-value.medium {
            color: #f59e0b;
          }
          
          .grade-value.bad {
            color: #e53e3e;
          }
          
          .grade-actions {
            display: flex;
            gap: 0.5rem;
          }
          
          .action-btn {
            background-color: transparent;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .action-btn:hover {
            background-color: #f1f1f1;
          }
          
          .action-btn.edit {
            color: #3e8bff;
          }
          
          .action-btn.delete {
            color: #e53e3e;
          }
          
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .modal.open {
            display: flex;
          }
          
          .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 100%;
            max-width: 500px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .modal-close {
            background-color: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
          }
          
          .form-group {
            margin-bottom: 1.5rem;
          }
          
          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          
          .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            font-family: inherit;
          }
          
          .form-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(62, 139, 255, 0.2);
          }
          
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }
          
          .btn-cancel {
            background-color: transparent;
            border: 1px solid #ddd;
            color: var(--text);
          }
          
          .grade-summary {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
          }
          
          .summary-card {
            background-color: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .summary-value {
            font-size: 2rem;
            font-weight: 700;
            margin: 0.5rem 0;
          }
          
          .summary-label {
            color: #666;
            font-size: 0.875rem;
          }
          
          .summary-card.good {
            border-top: 4px solid #10b981;
          }
          
          .summary-card.medium {
            border-top: 4px solid #f59e0b;
          }
          
          .summary-card.bad {
            border-top: 4px solid #e53e3e;
          }
          
          .summary-card.neutral {
            border-top: 4px solid #3e8bff;
          }
          
          /* Responsividade */
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              z-index: 1000;
            }
            
            .sidebar.open {
              transform: translateX(0);
            }
            
            .main-content {
              margin-left: 0;
            }
            
            .menu-toggle {
              display: block;
              position: fixed;
              top: 1rem;
              left: 1rem;
              z-index: 1001;
              background-color: var(--primary);
              color: white;
              border: none;
              border-radius: 4px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            }
            
            .grade-summary {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="app-container">
          <aside class="sidebar">
            <div class="sidebar-header">
              <h1>MedStudios</h1>
            </div>
            <nav>
              <ul class="nav-list">
                <li class="nav-item">
                  <a href="/dashboard" class="nav-link">
                    <span class="nav-link-icon">📊</span>
                    Dashboard
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/disciplinas" class="nav-link">
                    <span class="nav-link-icon">📚</span>
                    Disciplinas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/aulas" class="nav-link">
                    <span class="nav-link-icon">🗓️</span>
                    Aulas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/tarefas" class="nav-link">
                    <span class="nav-link-icon">✅</span>
                    Tarefas
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/notas" class="nav-link active">
                    <span class="nav-link-icon">📝</span>
                    Notas
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main class="main-content">
            <header class="page-header">
              <h1 class="page-title">Notas</h1>
              <div class="user-info">
                <span class="user-name" id="userName">Carregando...</span>
                <button class="logout-btn" id="logoutBtn">Sair</button>
              </div>
            </header>
            
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Resumo de Desempenho</h2>
              </div>
              <div id="gradeSummary" class="grade-summary">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Minhas Notas</h2>
                <button class="btn" id="addGradeBtn">Nova Nota</button>
              </div>
              <div id="gradesContainer">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
        
        <!-- Modal de Adicionar/Editar Nota -->
        <div class="modal" id="gradeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title" id="modalTitle">Nova Nota</h2>
              <button class="modal-close" id="closeModal">&times;</button>
            </div>
            <form id="gradeForm">
              <input type="hidden" id="gradeId">
              <div class="form-group">
                <label for="gradeSubject" class="form-label">Disciplina</label>
                <select id="gradeSubject" class="form-input" required>
                  <option value="">Selecione uma disciplina</option>
                </select>
              </div>
              <div class="form-group">
                <label for="gradeTitle" class="form-label">Título da Avaliação</label>
                <input type="text" id="gradeTitle" class="form-input" required>
              </div>
              <div class="form-group">
                <label for="gradeValue" class="form-label">Nota (0-10)</label>
                <input type="number" id="gradeValue" class="form-input" min="0" max="10" step="0.1" required>
              </div>
              <div class="form-group">
                <label for="gradeWeight" class="form-label">Peso da Avaliação</label>
                <input type="number" id="gradeWeight" class="form-input" min="1" max="10" step="1" value="1" required>
              </div>
              <div class="form-group">
                <label for="gradeDate" class="form-label">Data da Avaliação</label>
                <input type="date" id="gradeDate" class="form-input" required>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-cancel" id="cancelGrade">Cancelar</button>
                <button type="submit" class="btn">Salvar</button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Modal de Confirmação de Exclusão -->
        <div class="modal" id="deleteModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title">Confirmar Exclusão</h2>
              <button class="modal-close" id="closeDeleteModal">&times;</button>
            </div>
            <p>Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.</p>
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" id="cancelDelete">Cancelar</button>
              <button type="button" class="btn" style="background-color: #e53e3e;" id="confirmDelete">Excluir</button>
            </div>
          </div>
        </div>
        
        <script>
          // Verificar se o usuário está logado
          document.addEventListener('DOMContentLoaded', () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
              // Redirecionar para a página de login se não estiver logado
              window.location.href = '/';
              return;
            }
            
            const user = JSON.parse(userStr);
            document.getElementById('userName').textContent = user.name;
            
            // Configurar botão de logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
              localStorage.removeItem('user');
              window.location.href = '/';
            });
            
            // Carregar disciplinas para o select
            loadSubjectsForSelect();
            
            // Carregar notas
            fetchGrades();
            
            // Configurar modal de nota
            setupGradeModal();
            
            // Configurar modal de exclusão
            setupDeleteModal();
          });
          
          // Função para carregar disciplinas para o select
          async function loadSubjectsForSelect() {
            try {
              const response = await fetch('/api/subjects');
              if (!response.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await response.json();
              const select = document.getElementById('gradeSubject');
              
              // Limpar opções existentes, exceto a primeira
              while (select.options.length > 1) {
                select.remove(1);
              }
              
              // Adicionar disciplinas como opções
              subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                select.appendChild(option);
              });
            } catch (error) {
              console.error('Erro ao carregar disciplinas:', error);
              alert('Erro ao carregar disciplinas. Tente novamente.');
            }
          }
          
          // Função para buscar notas
          async function fetchGrades() {
            const container = document.getElementById('gradesContainer');
            const summaryContainer = document.getElementById('gradeSummary');
            
            try {
              const response = await fetch('/api/grades');
              if (!response.ok) throw new Error('Falha ao carregar notas');
              
              const grades = await response.json();
              
              if (grades.length === 0) {
                container.innerHTML = '<p>Nenhuma nota encontrada. Adicione sua primeira nota!</p>';
                summaryContainer.innerHTML = '<p>Adicione notas para ver o resumo de desempenho.</p>';
                return;
              }
              
              // Buscar disciplinas para mostrar os nomes
              const subjectsResponse = await fetch('/api/subjects');
              if (!subjectsResponse.ok) throw new Error('Falha ao carregar disciplinas');
              
              const subjects = await subjectsResponse.json();
              const subjectsMap = {};
              subjects.forEach(subject => {
                subjectsMap[subject.id] = subject;
              });
              
              // Renderizar notas
              renderGrades(grades, subjectsMap);
              
              // Renderizar resumo
              renderGradeSummary(grades, subjectsMap);
            } catch (error) {
              console.error('Erro ao carregar notas:', error);
              container.innerHTML = '<p class="error-message">Erro ao carregar notas. Tente novamente mais tarde.</p>';
              summaryContainer.innerHTML = '<p class="error-message">Erro ao carregar resumo. Tente novamente mais tarde.</p>';
            }
          }
          
          // Função para renderizar notas
          function renderGrades(grades, subjectsMap) {
            const container = document.getElementById('gradesContainer');
            
            // Agrupar notas por disciplina
            const gradesBySubject = {};
            grades.forEach(grade => {
              if (!gradesBySubject[grade.subjectId]) {
                gradesBySubject[grade.subjectId] = [];
              }
              gradesBySubject[grade.subjectId].push(grade);
            });
            
            // Criar tabela para cada disciplina
            let html = '';
            Object.keys(gradesBySubject).forEach(subjectId => {
              const subject = subjectsMap[subjectId] || { name: 'Disciplina não encontrada' };
              const subjectGrades = gradesBySubject[subjectId];
              
              html += `
                <div class="subject-grades">
                  <h3>${subject.name}</h3>
                  <table class="grades-table">
                    <thead>
                      <tr>
                        <th>Avaliação</th>
                        <th>Data</th>
                        <th>Nota</th>
                        <th>Peso</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
              `;
              
              subjectGrades.forEach(grade => {
                const date = new Date(grade.date);
                const formattedDate = date.toLocaleDateString('pt-BR');
                
                // Definir classe da nota com base no valor
                let gradeClass = '';
                if (grade.value >= 7) gradeClass = 'good';
                else if (grade.value >= 5) gradeClass = 'medium';
                else gradeClass = 'bad';
                
                html += `
                  <tr>
                    <td>${grade.title}</td>
                    <td>${formattedDate}</td>
                    <td><span class="grade-value ${gradeClass}">${grade.value.toFixed(1)}</span></td>
                    <td>${grade.weight}</td>
                    <td>
                      <div class="grade-actions">
                        <button class="action-btn edit" data-id="${grade.id}" data-action="edit">
                          ✏️ Editar
                        </button>
                        <button class="action-btn delete" data-id="${grade.id}" data-action="delete">
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              });
              
              // Calcular média ponderada da disciplina
              const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
              const weightedSum = subjectGrades.reduce((sum, grade) => sum + (grade.value * grade.weight), 0);
              const average = totalWeight > 0 ? weightedSum / totalWeight : 0;
              
              // Definir classe da média com base no valor
              let averageClass = '';
              if (average >= 7) averageClass = 'good';
              else if (average >= 5) averageClass = 'medium';
              else averageClass = 'bad';
              
              html += `
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2"><strong>Média Ponderada</strong></td>
                        <td colspan="3"><span class="grade-value ${averageClass}">${average.toFixed(2)}</span></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              `;
            });
            
            container.innerHTML = html;
            
            // Adicionar event listeners para os botões de ação
            document.querySelectorAll('.action-btn').forEach(btn => {
              btn.addEventListener('click', handleGradeAction);
            });
          }
          
          // Função para renderizar resumo de desempenho
          function renderGradeSummary(grades, subjectsMap) {
            const container = document.getElementById('gradeSummary');
            
            // Calcular médias por disciplina
            const subjectAverages = {};
            const subjectGrades = {};
            
            // Agrupar notas por disciplina
            grades.forEach(grade => {
              if (!subjectGrades[grade.subjectId]) {
                subjectGrades[grade.subjectId] = [];
              }
              subjectGrades[grade.subjectId].push(grade);
            });
            
            // Calcular média ponderada para cada disciplina
            Object.keys(subjectGrades).forEach(subjectId => {
              const subjectGradesList = subjectGrades[subjectId];
              const totalWeight = subjectGradesList.reduce((sum, grade) => sum + grade.weight, 0);
              const weightedSum = subjectGradesList.reduce((sum, grade) => sum + (grade.value * grade.weight), 0);
              const average = totalWeight > 0 ? weightedSum / totalWeight : 0;
              
              subjectAverages[subjectId] = average;
            });
            
            // Calcular média geral
            const totalSubjects = Object.keys(subjectAverages).length;
            const overallAverage = totalSubjects > 0 ?
              Object.values(subjectAverages).reduce((sum, avg) => sum + avg, 0) / totalSubjects : 0;
            
            // Encontrar maior e menor média
            let highestAverage = 0;
            let lowestAverage = 10;
            let highestSubjectId = null;
            let lowestSubjectId = null;
            
            Object.entries(subjectAverages).forEach(([subjectId, average]) => {
              if (average > highestAverage) {
                highestAverage = average;
                highestSubjectId = subjectId;
              }
              if (average < lowestAverage) {
                lowestAverage = average;
                lowestSubjectId = subjectId;
              }
            });
            
            // Definir classes com base nos valores
            let overallClass = '';
            if (overallAverage >= 7) overallClass = 'good';
            else if (overallAverage >= 5) overallClass = 'medium';
            else overallClass = 'bad';
            
            // Criar cards de resumo
            let html = `
              <div class="summary-card ${overallClass}">
                <div class="summary-label">Média Geral</div>
                <div class="summary-value">${overallAverage.toFixed(2)}</div>
              </div>
            `;
            
            // Adicionar card para melhor disciplina
            if (highestSubjectId) {
              const highestSubject = subjectsMap[highestSubjectId] || { name: 'Disciplina não encontrada' };
              html += `
                <div class="summary-card good">
                  <div class="summary-label">Melhor Desempenho</div>
                  <div class="summary-value">${highestAverage.toFixed(2)}</div>
                  <div>${highestSubject.name}</div>
                </div>
              `;
            }
            
            // Adicionar card para pior disciplina
            if (lowestSubjectId && Object.keys(subjectAverages).length > 1) {
              const lowestSubject = subjectsMap[lowestSubjectId] || { name: 'Disciplina não encontrada' };
              let lowestClass = '';
              if (lowestAverage >= 7) lowestClass = 'good';
              else if (lowestAverage >= 5) lowestClass = 'medium';
              else lowestClass = 'bad';
              
              html += `
                <div class="summary-card ${lowestClass}">
                  <div class="summary-label">Precisa de Atenção</div>
                  <div class="summary-value">${lowestAverage.toFixed(2)}</div>
                  <div>${lowestSubject.name}</div>
                </div>
              `;
            }
            
            // Adicionar card para total de disciplinas
            html += `
              <div class="summary-card neutral">
                <div class="summary-label">Total de Disciplinas</div>
                <div class="summary-value">${totalSubjects}</div>
              </div>
            `;
            
            container.innerHTML = html;
          }
          
          // Configurar modal de nota
          function setupGradeModal() {
            const modal = document.getElementById('gradeModal');
            const form = document.getElementById('gradeForm');
            const addBtn = document.getElementById('addGradeBtn');
            const closeBtn = document.getElementById('closeModal');
            const cancelBtn = document.getElementById('cancelGrade');
            
            // Abrir modal para adicionar
            addBtn.addEventListener('click', () => {
              document.getElementById('modalTitle').textContent = 'Nova Nota';
              form.reset();
              document.getElementById('gradeId').value = '';
              
              // Definir data padrão como hoje
              const today = new Date();
              const formattedDate = today.toISOString().split('T')[0];
              document.getElementById('gradeDate').value = formattedDate;
              
              modal.classList.add('open');
            });
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Enviar formulário
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const gradeId = document.getElementById('gradeId').value;
              const title = document.getElementById('gradeTitle').value;
              const subjectId = document.getElementById('gradeSubject').value;
              const value = parseFloat(document.getElementById('gradeValue').value);
              const weight = parseInt(document.getElementById('gradeWeight').value);
              const date = document.getElementById('gradeDate').value;
              
              const gradeData = {
                title,
                subjectId,
                value,
                weight,
                date
              };
              
              try {
                let response;
                
                if (gradeId) {
                  // Atualizar nota existente
                  response = await fetch(`/api/grades/${gradeId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gradeData)
                  });
                } else {
                  // Criar nova nota
                  response = await fetch('/api/grades', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gradeData)
                  });
                }
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao salvar nota');
                }
                
                // Fechar modal e recarregar notas
                modal.classList.remove('open');
                fetchGrades();
              } catch (error) {
                console.error('Erro ao salvar nota:', error);
                alert(`Erro ao salvar nota: ${error.message}`);
              }
            });
          }
          
          // Configurar modal de exclusão
          function setupDeleteModal() {
            const modal = document.getElementById('deleteModal');
            const closeBtn = document.getElementById('closeDeleteModal');
            const cancelBtn = document.getElementById('cancelDelete');
            const confirmBtn = document.getElementById('confirmDelete');
            
            // Fechar modal
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
            cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
            
            // Confirmar exclusão
            confirmBtn.addEventListener('click', async () => {
              const gradeId = confirmBtn.dataset.id;
              
              try {
                const response = await fetch(`/api/grades/${gradeId}`, {
                  method: 'DELETE'
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Erro ao excluir nota');
                }
                
                // Fechar modal e recarregar notas
                modal.classList.remove('open');
                fetchGrades();
              } catch (error) {
                console.error('Erro ao excluir nota:', error);
                alert(`Erro ao excluir nota: ${error.message}`);
              }
            });
          }
          
          // Lidar com ações de nota (editar/excluir)
          async function handleGradeAction(e) {
            const btn = e.currentTarget;
            const action = btn.dataset.action;
            const gradeId = btn.dataset.id;
            
            if (action === 'edit') {
              // Buscar dados da nota e abrir modal de edição
              try {
                const response = await fetch(`/api/grades/${gradeId}`);
                if (!response.ok) throw new Error('Falha ao carregar dados da nota');
                
                const gradeData = await response.json();
                
                // Preencher formulário
                document.getElementById('modalTitle').textContent = 'Editar Nota';
                document.getElementById('gradeId').value = gradeData.id;
                document.getElementById('gradeTitle').value = gradeData.title;
                document.getElementById('gradeSubject').value = gradeData.subjectId;
                document.getElementById('gradeValue').value = gradeData.value;
                document.getElementById('gradeWeight').value = gradeData.weight;
                document.getElementById('gradeDate').value = gradeData.date;
                
                // Abrir modal
                document.getElementById('gradeModal').classList.add('open');
              } catch (error) {
                console.error('Erro ao carregar dados da nota:', error);
                alert('Erro ao carregar dados da nota. Tente novamente.');
              }
            } else if (action === 'delete') {
              // Configurar e abrir modal de confirmação de exclusão
              document.getElementById('confirmDelete').dataset.id = gradeId;
              document.getElementById('deleteModal').classList.add('open');
            }
          }
        </script>
      </body>
      </html>
    `);
  });
  
  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
})();
