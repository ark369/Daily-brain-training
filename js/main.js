/**
 * Daily Thinking Studio — Main Application Controller
 */

import { loadState, saveState, getActiveProfile } from './storage.js';
import { setSoundEnabled, setSpeechEnabled, playClick, stopSpeaking } from './audio.js';
import { UI_ICONS } from './avatars.js';
import { getGameById } from './games/index.js';
import { renderHome } from './ui/home.js';
import { runGameSession } from './ui/session.js';
import { openParentModal } from './ui/parent.js';

const state = loadState();
let activeFilter = 'all';
let currentView = 'home'; // 'home' | 'session'
let sessionCleanup = null;

const mainEl = document.getElementById('app-main');
const modalRoot = document.getElementById('modal-root');
const toastRoot = document.getElementById('toast-root');
const soundBtn = document.getElementById('btn-toggle-sound');
const soundIcon = document.getElementById('sound-icon');
const speechBtn = document.getElementById('btn-toggle-speech');
const speechIcon = document.getElementById('speech-icon');
const parentBtn = document.getElementById('btn-open-parent');
const parentIcon = document.getElementById('parent-icon');
const brandBtn = document.getElementById('btn-home-brand');

speechIcon.innerHTML = UI_ICONS.speak;
parentIcon.innerHTML = UI_ICONS.settings;

let toastTimer = null;
function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer);
  toastRoot.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = String(msg);
  toastRoot.appendChild(el);
  toastTimer = setTimeout(() => {
    toastRoot.innerHTML = '';
    toastTimer = null;
  }, 2400);
}

function syncAudioControls() {
  const profile = getActiveProfile(state);
  setSoundEnabled(state.soundEnabled);
  setSpeechEnabled(profile.readAloud);

  soundBtn.setAttribute('aria-pressed', String(state.soundEnabled));
  soundIcon.innerHTML = state.soundEnabled ? UI_ICONS.soundOn : UI_ICONS.soundOff;
  speechBtn.setAttribute('aria-pressed', String(Boolean(profile.readAloud)));
}

function cleanupSession() {
  stopSpeaking();
  if (sessionCleanup) {
    sessionCleanup();
    sessionCleanup = null;
  }
}

function goHome({ preserveScroll = false } = {}) {
  cleanupSession();
  currentView = 'home';
  const profile = getActiveProfile(state);
  syncAudioControls();

  renderHome(mainEl, state, profile, activeFilter, {
    onSelectProfile: (profileId) => {
      playClick();
      state.activeProfileId = profileId;
      saveState(state);
      goHome({ preserveScroll: true });
    },
    onFilterChange: (filterId) => {
      playClick();
      activeFilter = filterId;
      goHome({ preserveScroll: true });
    },
    onStartGame: (gameId, opts) => {
      playClick();
      startGame(gameId, opts);
    },
  });
  if (!preserveScroll) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
}

function startGame(gameId, opts) {
  cleanupSession();
  currentView = 'session';
  const profile = getActiveProfile(state);
  syncAudioControls();
  const gameMod = getGameById(gameId);

  sessionCleanup = runGameSession(mainEl, state, profile, gameMod, opts, {
    onExitHome: () => goHome(),
    onStartGame: (nextId, nextOpts) => startGame(nextId, nextOpts),
  });
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

soundBtn.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  saveState(state);
  syncAudioControls();
  if (state.soundEnabled) playClick();
  showToast(state.soundEnabled ? 'Sound chimes ON' : 'Sound chimes muted');
});

speechBtn.addEventListener('click', () => {
  const profile = getActiveProfile(state);
  profile.readAloud = !profile.readAloud;
  saveState(state);
  syncAudioControls();
  playClick();
  showToast(
    profile.readAloud
      ? `Read Aloud ON for ${profile.name}`
      : `Read Aloud OFF for ${profile.name}`
  );
});

parentBtn.addEventListener('click', () => {
  playClick();
  openParentModal(modalRoot, state, {
    onToast: showToast,
    onStateUpdated: () => {
      syncAudioControls();
      if (currentView === 'home') goHome();
    },
  });
});

brandBtn.addEventListener('click', () => {
  playClick();
  goHome();
});

// Boot
goHome();
