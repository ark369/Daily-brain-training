/**
 * Daily Thinking Studio — Offline-First Service Worker
 * Precaches the full app shell (HTML, CSS, JS, all 12 games & icons) so families
 * can play offline on tablets/phones after one visit, while still pulling fresh
 * updates seamlessly whenever online (network-first with cache fallback).
 */

const CACHE_NAME = 'dts-shell-v2';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './css/tokens.css',
  './css/base.css',
  './css/games.css',
  './js/main.js',
  './js/storage.js',
  './js/audio.js',
  './js/avatars.js',
  './js/daily.js',
  './js/ui/home.js',
  './js/ui/session.js',
  './js/ui/parent.js',
  './js/games/index.js',
  './js/games/utils.js',
  './js/games/cubeArchitect.js',
  './js/games/shapeShifter.js',
  './js/games/shapeComposer.js',
  './js/games/numberLine.js',
  './js/games/factStudio.js',
  './js/games/targetForge.js',
  './js/games/balanceLab.js',
  './js/games/ruleSwitcher.js',
  './js/games/clueGrid.js',
  './js/games/wordBuilder.js',
  './js/games/wordConnections.js',
  './js/games/storyDetective.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle same-origin requests (leave Google Fonts graceful offline fallback alone)
  if (url.origin !== self.location.origin) return;

  // Network-first with automatic cache refresh & instant offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
