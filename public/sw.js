const CACHE_NAME = 'medstudios-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/cronograma.html',
  '/agenda.html',
  '/disciplinas.html',
  '/professores.html',
  '/semestre.html',
  '/progresso.html',
  '/planejamento.html',
  '/styles/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons-sprite.svg'
];

// Instalar o service worker e fazer cache dos recursos estáticos
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Recursos em cache');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Erro ao fazer cache:', error);
      })
  );
});

// Ativar o service worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Ativado');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições e servir do cache quando offline
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para outros domínios (exceto fontes e ícones)
  const url = new URL(event.request.url);
  const isLocalRequest = url.origin === location.origin;
  const isFontRequest = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const isIconRequest = url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('tabler/icons');

  if (!isLocalRequest && !isFontRequest && !isIconRequest) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Se encontrou no cache, retorna
        if (cachedResponse) {
          console.log('Service Worker: Servindo do cache:', event.request.url);
          return cachedResponse;
        }

        // Se não encontrou no cache, busca na rede
        console.log('Service Worker: Buscando na rede:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para armazenar no cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('Service Worker: Adicionado ao cache:', event.request.url);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Erro na rede:', error);
            
            // Se for uma página HTML e não conseguiu carregar, retorna página offline
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Para outros recursos, retorna erro
            throw error;
          });
      })
  );
});

// Lidar com mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do MedStudios',
    icon: '/manifest.json',
    badge: '/manifest.json',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/manifest.json'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/manifest.json'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MedStudios', options)
  );
});

// Lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique na notificação');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});