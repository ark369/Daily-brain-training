/**
 * Parent Corner Modal:
 * - Manage kids' profiles (names, avatars, global tier & optional per-pillar overrides)
 * - Toggle Read-Aloud & Calm Mode (untimed math fluency) per child
 * - View gentle per-pillar play summary & "Math Facts Being Practiced" from spaced retrieval
 * - Export/Import local JSON backup & read the Evidence + Offline Pairing notes
 */

import { AVATAR_KEYS, getAvatarSvg, getAvatarLabel } from '../avatars.js';
import { PILLARS, GAMES } from '../games/index.js';
import {
  TIERS,
  addProfile,
  deleteProfile,
  saveState,
  getTrickyFacts,
  exportStateJson,
  importStateJson,
} from '../storage.js';
import { escapeHtml } from '../games/utils.js';

export function openParentModal(modalRoot, state, handlers) {
  let activeTab = 'profiles'; // 'profiles' | 'progress' | 'science'
  let editingProfileId = state.activeProfileId;

  function close() {
    modalRoot.innerHTML = '';
    handlers.onStateUpdated();
  }

  function render() {
    const selectedProfile =
      state.profiles.find((p) => p.id === editingProfileId) || state.profiles[0];
    editingProfileId = selectedProfile.id;

    let bodyHtml = '';

    if (activeTab === 'profiles') {
      bodyHtml = `
        <div class="parent-section">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;">
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${state.profiles
                .map(
                  (p) => `
                  <button type="button" class="filter-btn ${p.id === selectedProfile.id ? 'active' : ''}" data-edit-profile="${escapeHtml(p.id)}">
                    ${escapeHtml(p.name)}
                  </button>`
                )
                .join('')}
            </div>
            <button type="button" class="btn btn-secondary" id="btn-add-kid" style="min-height:38px;padding:6px 14px;font-size:0.86rem;">
              + Add Kid
            </button>
          </div>

          <div class="parent-row">
            <div class="parent-form-grid">
              <div class="field-group">
                <label class="field-label" for="input-kid-name">Child's Name</label>
                <input id="input-kid-name" class="text-input" type="text" maxlength="24" value="${escapeHtml(selectedProfile.name)}" />
              </div>

              <div class="field-group">
                <label class="field-label" for="select-kid-tier">Default Difficulty Tier</label>
                <select id="select-kid-tier" class="select-input">
                  ${TIERS.map(
                    (t) =>
                      `<option value="${t.id}" ${Number(selectedProfile.tier) === t.id ? 'selected' : ''}>${t.name} (${t.ageLabel})</option>`
                  ).join('')}
                </select>
              </div>
            </div>

            <div class="field-group">
              <span class="field-label">Animal Avatar</span>
              <div class="avatar-picker">
                ${AVATAR_KEYS.map(
                  (key) => `
                  <button type="button" class="avatar-choice ${selectedProfile.avatar === key ? 'selected' : ''}"
                          data-avatar-key="${key}" title="${getAvatarLabel(key)}" aria-label="${getAvatarLabel(key)}">
                    ${getAvatarSvg(key)}
                  </button>`
                ).join('')}
              </div>
            </div>

            <div>
              <div class="toggle-row">
                <div class="toggle-info">
                  <strong>Auto Read-Aloud Prompts</strong>
                  <span>Speaks game questions aloud automatically (great for 5–6 year old emerging readers).</span>
                </div>
                <button type="button" class="switch-btn" id="sw-readaloud" role="switch" aria-checked="${Boolean(selectedProfile.readAloud)}"></button>
              </div>

              <div class="toggle-row">
                <div class="toggle-info">
                  <strong>Calm Mode (Untimed Math Fluency)</strong>
                  <span>Turns off the 60-second Fact Studio sprint for kids who prefer purely untimed practice.</span>
                </div>
                <button type="button" class="switch-btn" id="sw-calm" role="switch" aria-checked="${Boolean(selectedProfile.calmMode)}"></button>
              </div>
            </div>

            <div class="field-group">
              <span class="field-label">Optional Per-Pillar Tier Overrides (great when a child is ahead in one subject)</span>
              <div class="parent-form-grid parent-overrides-grid">
                ${PILLARS.map((pil) => {
                  const ov = (selectedProfile.pillarTiers && selectedProfile.pillarTiers[pil.id]) || '';
                  return `
                    <div class="field-group">
                      <label class="field-label" for="ov-${pil.id}">${escapeHtml(pil.name)}</label>
                      <select id="ov-${pil.id}" class="select-input" data-pillar-ov="${pil.id}">
                        <option value="">Use Default</option>
                        ${TIERS.map(
                          (t) =>
                            `<option value="${t.id}" ${Number(ov) === t.id ? 'selected' : ''}>${t.name} (${t.ageLabel})</option>`
                        ).join('')}
                      </select>
                    </div>`;
                }).join('')}
              </div>
            </div>

            ${
              state.profiles.length > 1
                ? `<div style="display:flex;justify-content:flex-end;">
                     <button type="button" class="btn btn-ghost" id="btn-delete-kid" style="color:var(--compute-dark);">Remove Profile</button>
                   </div>`
                : ''
            }
          </div>
        </div>
      `;
    } else if (activeTab === 'progress') {
      bodyHtml = `
        <div class="parent-section">
          ${state.profiles
            .map((p) => {
              const tricky = getTrickyFacts(p, 8);
              const pillarCounts = PILLARS.map((pil) => {
                const gamesInPillar = GAMES.filter((g) => g.meta.pillar === pil.id);
                const plays = gamesInPillar.reduce(
                  (sum, g) => sum + ((p.gameStats[g.meta.id] && p.gameStats[g.meta.id].plays) || 0),
                  0
                );
                return { pil, plays };
              });
              const maxPlays = Math.max(4, ...pillarCounts.map((x) => x.plays));

              return `
                <div class="parent-row">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <span class="profile-avatar" style="width:36px;height:36px;">${getAvatarSvg(p.avatar)}</span>
                      <strong>${escapeHtml(p.name)}</strong>
                    </div>
                    <span class="calendar-count">★ ${p.completedDates.length} total daily stars</span>
                  </div>

                  <div class="skill-bars">
                    ${pillarCounts
                      .map(
                        ({ pil, plays }) => `
                        <div class="skill-bar-row">
                          <strong>${escapeHtml(pil.name)}</strong>
                          <div class="skill-bar-track">
                            <div class="skill-bar-fill ${pil.id}" style="width:${Math.min(100, (plays / maxPlays) * 100)}%"></div>
                          </div>
                          <span style="text-align:right;color:var(--ink-muted);">${plays} ${plays === 1 ? 'play' : 'plays'}</span>
                        </div>`
                      )
                      .join('')}
                  </div>

                  <div>
                    <span class="field-label" style="display:block;margin-bottom:6px;">
                      Spaced-Retrieval Queue (Math facts this child is still smoothing out):
                    </span>
                    ${
                      tricky.length > 0
                        ? `<div class="fact-pill-list">
                            ${tricky
                              .map(
                                (f) =>
                                  `<span class="fact-pill">${escapeHtml(f.key.replace('x', ' × ').replace('/', ' ÷ ').replace('+', ' + ').replace('-', ' − '))} (${(f.avgMs / 1000).toFixed(1)}s)</span>`
                              )
                              .join('')}
                           </div>`
                        : '<span style="font-size:0.82rem;color:var(--ink-muted);">Play Fact Studio to build a personalized spaced-retrieval queue.</span>'
                    }
                  </div>
                </div>
              `;
            })
            .join('')}

          <div class="parent-row">
            <strong>Backup / Transfer Between Devices</strong>
            <p style="font-size:0.84rem;color:var(--ink-secondary);">
              Progress stays 100% private in this browser. Export a JSON snapshot if you switch tablets or laptops.
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              <button type="button" class="btn btn-secondary" id="btn-export-json" style="min-height:40px;font-size:0.88rem;">Download Progress JSON</button>
              <label class="btn btn-secondary" style="min-height:40px;font-size:0.88rem;cursor:pointer;">
                Import Progress JSON
                <input type="file" id="input-import-json" accept="application/json" hidden />
              </label>
            </div>
          </div>
        </div>
      `;
    } else {
      bodyHtml = `
        <div class="parent-section">
          <div class="parent-row">
            <strong>Why These 4 Pillars (and No "IQ Magic" Claims)?</strong>
            <ul class="science-list">
              <li><strong>Near transfer works; far transfer doesn't:</strong> Decades of RCTs (Simons et al., 2016; Sala &amp; Gobet, 2019) show abstract memory drills don't broadly raise IQ. Every game here directly practices a high-value academic or spatial skill instead.</li>
              <li><strong>Spatial reasoning transfers to math:</strong> Meta-analyses (Uttal et al., 2013; Hawes et al., 2022) show 3D block visualization, symmetry, and rotation measurably improve math performance (especially when paired with hands-on blocks/origami!).</li>
              <li><strong>Research-backed timer policy:</strong> Reasoning, spatial, language, and Tier 1 (ages 5–6) games are strictly <em>untimed</em>. Only Fact Studio for ages 7+ offers a calm, self-referenced 60-second sprint (IES Practice Guide 2021, Rec. 6) — always preceded by visual strategy warm-ups and disableable via Calm Mode.</li>
              <li><strong>Healthy motivation:</strong> Forgiving monthly stars instead of anxiety-inducing streak resets protect intrinsic curiosity (Deci, Koestner, &amp; Ryan, 1999).</li>
            </ul>
          </div>

          <div class="parent-row">
            <strong>High-Impact Offline Pairings</strong>
            <p style="font-size:0.86rem;color:var(--ink-secondary);">
              This studio is designed as a crisp 8–10 minute replacement for passive screen time—not a replacement for reading, physical play, or hands-on building. Pair it with wooden blocks/LEGO, tangrams, origami, family board games (like Rush Hour, Set, Ticket to Ride, or Mancala), and reading books aloud!
            </p>
          </div>
        </div>
      `;
    }

    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="parent-backdrop" role="dialog" aria-modal="true" aria-labelledby="parent-modal-title">
        <div class="modal-panel">
          <div class="modal-header">
            <div>
              <h2 id="parent-modal-title">Parent Corner</h2>
              <p style="font-size:0.84rem;color:var(--ink-muted);">Customize each child's name, tier, audio &amp; calm settings</p>
            </div>
            <button type="button" class="btn btn-secondary" id="btn-close-parent" style="min-height:38px;padding:6px 14px;">Done</button>
          </div>

          <div class="parent-tabs" role="tablist">
            <button type="button" class="filter-btn ${activeTab === 'profiles' ? 'active' : ''}" data-ptab="profiles">Kids &amp; Tiers</button>
            <button type="button" class="filter-btn ${activeTab === 'progress' ? 'active' : ''}" data-ptab="progress">Progress &amp; Backup</button>
            <button type="button" class="filter-btn ${activeTab === 'science' ? 'active' : ''}" data-ptab="science">Research &amp; Offline Tips</button>
          </div>

          ${bodyHtml}
        </div>
      </div>
    `;

    modalRoot.querySelector('#btn-close-parent').addEventListener('click', close);
    modalRoot.querySelector('#parent-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'parent-backdrop') close();
    });

    modalRoot.querySelectorAll('[data-ptab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.ptab;
        render();
      });
    });

    if (activeTab === 'profiles') {
      modalRoot.querySelectorAll('[data-edit-profile]').forEach((btn) => {
        btn.addEventListener('click', () => {
          editingProfileId = btn.dataset.editProfile;
          render();
        });
      });

      modalRoot.querySelector('#btn-add-kid').addEventListener('click', () => {
        const created = addProfile(state, { name: `Kid ${state.profiles.length + 1}`, avatar: 'dino', tier: 1 });
        editingProfileId = created.id;
        handlers.onToast(`Added profile "${created.name}"`);
        render();
      });

      const nameInput = modalRoot.querySelector('#input-kid-name');
      nameInput.addEventListener('input', () => {
        selectedProfile.name = nameInput.value.trim() || 'Explorer';
        saveState(state);
      });

      const tierSelect = modalRoot.querySelector('#select-kid-tier');
      tierSelect.addEventListener('change', () => {
        selectedProfile.tier = Number(tierSelect.value);
        if (selectedProfile.tier === 1) {
          selectedProfile.readAloud = true;
          selectedProfile.calmMode = true;
        }
        saveState(state);
        render();
      });

      modalRoot.querySelectorAll('[data-avatar-key]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedProfile.avatar = btn.dataset.avatarKey;
          saveState(state);
          render();
        });
      });

      modalRoot.querySelector('#sw-readaloud').addEventListener('click', () => {
        selectedProfile.readAloud = !selectedProfile.readAloud;
        saveState(state);
        render();
      });

      modalRoot.querySelector('#sw-calm').addEventListener('click', () => {
        selectedProfile.calmMode = !selectedProfile.calmMode;
        saveState(state);
        render();
      });

      modalRoot.querySelectorAll('[data-pillar-ov]').forEach((sel) => {
        sel.addEventListener('change', () => {
          const pilId = sel.dataset.pillarOv;
          if (!selectedProfile.pillarTiers) selectedProfile.pillarTiers = {};
          if (sel.value === '') {
            delete selectedProfile.pillarTiers[pilId];
          } else {
            selectedProfile.pillarTiers[pilId] = Number(sel.value);
          }
          saveState(state);
        });
      });

      const delBtn = modalRoot.querySelector('#btn-delete-kid');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          deleteProfile(state, selectedProfile.id);
          editingProfileId = state.profiles[0].id;
          handlers.onToast('Profile removed');
          render();
        });
      }
    }

    if (activeTab === 'progress') {
      modalRoot.querySelector('#btn-export-json').addEventListener('click', () => {
        const blob = new Blob([exportStateJson(state)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-thinking-studio-backup.json`;
        a.click();
        URL.revokeObjectURL(url);
        handlers.onToast('Backup JSON downloaded!');
      });

      modalRoot.querySelector('#input-import-json').addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const imported = importStateJson(text);
          Object.assign(state, imported);
          handlers.onToast('Backup restored!');
          render();
        } catch {
          handlers.onToast('Could not read backup file — please choose a valid JSON backup.');
        }
      });
    }
  }

  render();
}
