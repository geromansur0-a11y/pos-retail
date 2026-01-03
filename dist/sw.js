const CACHE_NAME = 'pos-retail-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json',
  'https://unpkg.com/html5-qrcode',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Tahap Install: Menyimpan aset ke dalam cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching aset aplikasi...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Tahap Fetch: Mengambil data dari cache jika offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Kembalikan file dari cache jika ada, jika tidak ambil dari jaringan
      return response || fetch(event.request);
    })
  );
});

// Tahap Aktivasi: Membersihkan cache lama jika ada update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
