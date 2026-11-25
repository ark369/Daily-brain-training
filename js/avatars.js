/**
 * Hand-crafted crisp SVG avatars, pillar icons, UI icons, and Studio Mastery Badges
 * for Daily Thinking Studio.
 */

export const AVATAR_KEYS = [
  'fox',
  'owl',
  'otter',
  'panda',
  'hedgehog',
  'dino',
  'penguin',
  'koala',
];

const AVATARS = {
  fox: {
    label: 'Fox',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#FDEBD7"/>
      <path d="M14 14L24 24L14 31Z" fill="#DF6738"/>
      <path d="M50 14L40 24L50 31Z" fill="#DF6738"/>
      <path d="M17 18L22 24L17 28Z" fill="#FFF4E6"/>
      <path d="M47 18L42 24L47 28Z" fill="#FFF4E6"/>
      <ellipse cx="32" cy="36" rx="19" ry="16" fill="#E67342"/>
      <path d="M15 38C18 48 25 52 32 52C39 52 46 48 49 38C44 41 38 39 32 34C26 39 20 41 15 38Z" fill="#FFF7EE"/>
      <circle cx="24.5" cy="34" r="2.7" fill="#232733"/>
      <circle cx="39.5" cy="34" r="2.7" fill="#232733"/>
      <circle cx="25.3" cy="33.1" r="0.9" fill="#FFF"/>
      <circle cx="40.3" cy="33.1" r="0.9" fill="#FFF"/>
      <polygon points="29,40 35,40 32,44" fill="#232733"/>
      <path d="M29 46Q32 48.5 35 46" fill="none" stroke="#232733" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
  owl: {
    label: 'Owl',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#E1F2F1"/>
      <path d="M16 17L24 23L17 29Z" fill="#5D707F"/>
      <path d="M48 17L40 23L47 29Z" fill="#5D707F"/>
      <ellipse cx="32" cy="37" rx="18" ry="18" fill="#6D8294"/>
      <ellipse cx="32" cy="44" rx="12" ry="10" fill="#E9ECEF"/>
      <circle cx="24" cy="32" r="8.5" fill="#FFFDF8"/>
      <circle cx="40" cy="32" r="8.5" fill="#FFFDF8"/>
      <circle cx="24" cy="32" r="4.2" fill="#232733"/>
      <circle cx="40" cy="32" r="4.2" fill="#232733"/>
      <circle cx="25.4" cy="30.6" r="1.3" fill="#FFF"/>
      <circle cx="41.4" cy="30.6" r="1.3" fill="#FFF"/>
      <polygon points="29,37 35,37 32,43" fill="#E9A825"/>
    </svg>`,
  },
  otter: {
    label: 'Otter',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#FBEFD7"/>
      <circle cx="16" cy="24" r="6" fill="#7D5A44"/>
      <circle cx="48" cy="24" r="6" fill="#7D5A44"/>
      <circle cx="16" cy="24" r="3" fill="#D4B59E"/>
      <circle cx="48" cy="24" r="3" fill="#D4B59E"/>
      <ellipse cx="32" cy="35" rx="19" ry="17" fill="#8D664E"/>
      <ellipse cx="32" cy="40" rx="13" ry="11" fill="#F3E2CE"/>
      <circle cx="24.5" cy="32" r="2.8" fill="#232733"/>
      <circle cx="39.5" cy="32" r="2.8" fill="#232733"/>
      <circle cx="25.3" cy="31.1" r="0.9" fill="#FFF"/>
      <circle cx="40.3" cy="31.1" r="0.9" fill="#FFF"/>
      <ellipse cx="32" cy="37.5" rx="4.2" ry="3" fill="#232733"/>
      <path d="M28 43Q32 46 36 43" fill="none" stroke="#573B2A" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="16" y1="38" x2="23" y2="39" stroke="#573B2A" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="48" y1="38" x2="41" y2="39" stroke="#573B2A" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
  },
  panda: {
    label: 'Red Panda',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#E3F2E8"/>
      <circle cx="17" cy="20" r="7" fill="#C9522B"/>
      <circle cx="47" cy="20" r="7" fill="#C9522B"/>
      <circle cx="17" cy="20" r="4" fill="#FFF7EE"/>
      <circle cx="47" cy="20" r="4" fill="#FFF7EE"/>
      <ellipse cx="32" cy="36" rx="19" ry="16" fill="#D45A32"/>
      <ellipse cx="22" cy="38" rx="6" ry="5" fill="#FFF7EE"/>
      <ellipse cx="42" cy="38" rx="6" ry="5" fill="#FFF7EE"/>
      <ellipse cx="32" cy="43" rx="8" ry="6" fill="#FFF7EE"/>
      <circle cx="24" cy="33" r="2.7" fill="#232733"/>
      <circle cx="40" cy="33" r="2.7" fill="#232733"/>
      <ellipse cx="23" cy="27.5" rx="3" ry="1.8" fill="#FFF7EE"/>
      <ellipse cx="41" cy="27.5" rx="3" ry="1.8" fill="#FFF7EE"/>
      <ellipse cx="32" cy="40" rx="3.4" ry="2.4" fill="#232733"/>
      <path d="M29 45Q32 47.5 35 45" fill="none" stroke="#232733" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
  hedgehog: {
    label: 'Hedgehog',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#F9E9E2"/>
      <path d="M12 36L14 22L22 24L27 14L34 20L42 15L45 24L52 24L51 37Z" fill="#6F5340"/>
      <ellipse cx="32" cy="39" rx="17" ry="14" fill="#E8C9A9"/>
      <circle cx="19" cy="31" r="4.5" fill="#D9B18A"/>
      <circle cx="45" cy="31" r="4.5" fill="#D9B18A"/>
      <circle cx="25" cy="36" r="2.7" fill="#232733"/>
      <circle cx="39" cy="36" r="2.7" fill="#232733"/>
      <circle cx="25.8" cy="35.1" r="0.9" fill="#FFF"/>
      <circle cx="39.8" cy="35.1" r="0.9" fill="#FFF"/>
      <circle cx="32" cy="41.5" r="3.2" fill="#232733"/>
      <path d="M29 46.5Q32 48.5 35 46.5" fill="none" stroke="#5A4030" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,
  },
  dino: {
    label: 'Dino',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#E4F4E7"/>
      <polygon points="27,12 33,18 25,20" fill="#E49E2D"/>
      <polygon points="36,14 42,20 34,21" fill="#E49E2D"/>
      <ellipse cx="32" cy="37" rx="18" ry="16" fill="#489A67"/>
      <ellipse cx="32" cy="45" rx="12" ry="7" fill="#A9DCB8"/>
      <circle cx="24" cy="33" r="3" fill="#232733"/>
      <circle cx="40" cy="33" r="3" fill="#232733"/>
      <circle cx="25" cy="32" r="1" fill="#FFF"/>
      <circle cx="41" cy="32" r="1" fill="#FFF"/>
      <circle cx="28" cy="39" r="1.4" fill="#2D6A44"/>
      <circle cx="36" cy="39" r="1.4" fill="#2D6A44"/>
      <path d="M24 44Q32 49 40 44" fill="none" stroke="#232733" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  penguin: {
    label: 'Penguin',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#DFEFF5"/>
      <ellipse cx="32" cy="37" rx="18" ry="19" fill="#2E3B4E"/>
      <path d="M19 37C19 29 24 25 28 28C30 29.5 34 29.5 36 28C40 25 45 29 45 37C45 48 39 53 32 53C25 53 19 48 19 37Z" fill="#FFFDF8"/>
      <circle cx="25" cy="34" r="2.7" fill="#232733"/>
      <circle cx="39" cy="34" r="2.7" fill="#232733"/>
      <circle cx="25.8" cy="33.1" r="0.9" fill="#FFF"/>
      <circle cx="39.8" cy="33.1" r="0.9" fill="#FFF"/>
      <ellipse cx="21" cy="38.5" rx="2.8" ry="1.8" fill="#F2A490"/>
      <ellipse cx="43" cy="38.5" rx="2.8" ry="1.8" fill="#F2A490"/>
      <polygon points="28,38 36,38 32,44" fill="#EB9528"/>
    </svg>`,
  },
  koala: {
    label: 'Koala',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#EFEAE2"/>
      <circle cx="15" cy="29" r="9.5" fill="#8B939C"/>
      <circle cx="49" cy="29" r="9.5" fill="#8B939C"/>
      <circle cx="15" cy="29" r="5.5" fill="#EAE6E1"/>
      <circle cx="49" cy="29" r="5.5" fill="#EAE6E1"/>
      <ellipse cx="32" cy="36" rx="17" ry="16" fill="#9DA5AE"/>
      <circle cx="24" cy="34" r="2.7" fill="#232733"/>
      <circle cx="40" cy="34" r="2.7" fill="#232733"/>
      <circle cx="24.8" cy="33.1" r="0.9" fill="#FFF"/>
      <circle cx="40.8" cy="33.1" r="0.9" fill="#FFF"/>
      <ellipse cx="32" cy="38.5" rx="4.5" ry="6" fill="#3C424B"/>
      <path d="M29 46.5Q32 48.5 35 46.5" fill="none" stroke="#3C424B" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
};

export function getAvatarSvg(key) {
  return (AVATARS[key] || AVATARS.fox).svg;
}

export function getAvatarLabel(key) {
  return (AVATARS[key] || AVATARS.fox).label;
}

export const UI_ICONS = {
  soundOn: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.8 5.8a9 9 0 0 1 0 12.4"/>
  </svg>`,
  soundOff: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M11 5L6 9H3v6h3l5 4V5z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>
  </svg>`,
  speak: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 18.5a6.5 6.5 0 0 0 6.5-6.5V10"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/>
    <rect x="9" y="3" width="6" height="10" rx="3"/><line x1="12" y1="19" x2="12" y2="22"/>
  </svg>`,
  listen: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9.5 9.5 0 0 1 0 14"/>
  </svg>`,
  settings: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,
  bulb: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.3A7 7 0 0 0 12 2z"/>
  </svg>`,
};

export const PILLAR_ICONS = {
  visualize: `<svg viewBox="0 0 32 32" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M16 4L27 10.5L16 17L5 10.5L16 4Z" fill="currentColor" opacity="0.28" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M5 10.5V21.5L16 28V17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M27 10.5V21.5L16 28" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,
  compute: `<svg viewBox="0 0 32 32" width="26" height="26" fill="none" aria-hidden="true">
    <line x1="4" y1="20" x2="28" y2="20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="8" y1="16" x2="8" y2="24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="16" y1="15" x2="16" y2="25" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="24" y1="16" x2="24" y2="24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M8 14C10 7 14 7 16 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="24" cy="11" r="3" fill="currentColor"/>
  </svg>`,
  analyze: `<svg viewBox="0 0 32 32" width="26" height="26" fill="none" aria-hidden="true">
    <line x1="16" y1="6" x2="16" y2="26" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="10" y1="26" x2="22" y2="26" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="6" y1="12" x2="26" y2="10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M4 18H11L9.5 21.5H5.5L4 18Z" fill="currentColor" opacity="0.35" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M21 16H28L26.5 19.5H22.5L21 16Z" fill="currentColor" opacity="0.35" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`,
  wordcraft: `<svg viewBox="0 0 32 32" width="26" height="26" fill="none" aria-hidden="true">
    <rect x="4" y="6" width="11" height="11" rx="3" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="2"/>
    <rect x="17" y="15" width="11" height="11" rx="3" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="2"/>
    <path d="M8.5 14L10 9L11.5 14M9 12.6H11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20.5 18.5H24.5M22.5 18.5V23.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M18 9.5H24M21 6.5V12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

export const STAR_SVG = `<svg class="cal-star-svg" viewBox="0 0 24 24" fill="#E39D1E" aria-hidden="true">
  <path d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"/>
</svg>`;

export const MEDAL_SVG = `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
  <path d="M20 36L14 58L26 52L30 58L32 42Z" fill="#2E9690"/>
  <path d="M44 36L50 58L38 52L34 58L32 42Z" fill="#E46B49"/>
  <circle cx="32" cy="26" r="19" fill="#F1B83D" stroke="#C78A16" stroke-width="3"/>
  <path d="M32 14L35.4 21L43 22.1L37.5 27.4L38.8 35L32 31.4L25.2 35L26.5 27.4L21 22.1L28.6 21L32 14Z" fill="#FFF8E8"/>
</svg>`;

// Competence-based Mastery Badges (informational feedback, never punitive or lost!)
export const STUDIO_BADGES = [
  {
    id: 'spatial-builder',
    title: '3D Architect',
    desc: 'Complete a Visualize game',
    pillar: 'visualize',
  },
  {
    id: 'number-navigator',
    title: 'Number Navigator',
    desc: 'Complete a Compute game',
    pillar: 'compute',
  },
  {
    id: 'logic-detective',
    title: 'Logic Detective',
    desc: 'Complete an Analyze game',
    pillar: 'analyze',
  },
  {
    id: 'word-wizard',
    title: 'Word Explorer',
    desc: 'Complete a WordCraft game',
    pillar: 'wordcraft',
  },
  {
    id: 'daily-star',
    title: 'First Gold Star',
    desc: 'Finish a full 4-pillar Daily Mix',
    pillar: 'analyze',
  },
  {
    id: 'all-rounder',
    title: 'Studio All-Rounder',
    desc: 'Try 4 different games across the studio',
    pillar: 'visualize',
  },
];
