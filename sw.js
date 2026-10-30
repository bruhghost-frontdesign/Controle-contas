self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('push', function(e){
  self.registration.showNotification('Controle de Contas', {
    body: e.data ? e.data.text() : 'Você tem contas vencendo!',
    icon: 'https://cdn-icons-png.flaticon.com/512/584/584026.png'
  });
});
