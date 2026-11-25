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
  'narwhal',
  'sloth',
  'wolf',
  'dragon',
];

export const BONUS_AVATAR_STARS = {
  narwhal: 3,
  sloth: 7,
  wolf: 14,
  dragon: 25,
};

export function isAvatarUnlocked(key, totalStars = 0) {
  const req = BONUS_AVATAR_STARS[key] || 0;
  return totalStars >= req;
}

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
  narwhal: {
    label: 'Narwhal',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#DFF2F6"/>
      <polygon points="32,7 29,24 35,24" fill="#F2C04A" stroke="#B68010" stroke-width="1.5" stroke-linejoin="round"/>
      <ellipse cx="32" cy="38" rx="19" ry="15" fill="#469DB3"/>
      <ellipse cx="32" cy="45" rx="13" ry="7" fill="#E3F5FA"/>
      <circle cx="24" cy="36" r="2.7" fill="#232733"/><circle cx="40" cy="36" r="2.7" fill="#232733"/>
      <circle cx="24.8" cy="35.1" r="0.9" fill="#FFF"/><circle cx="40.8" cy="35.1" r="0.9" fill="#FFF"/>
      <path d="M28 42Q32 45 36 42" fill="none" stroke="#232733" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
  sloth: {
    label: 'Sloth',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#E5F2E4"/>
      <ellipse cx="32" cy="36" rx="19" ry="17" fill="#8C735B"/>
      <ellipse cx="32" cy="39" rx="14" ry="12" fill="#F2E7D8"/>
      <ellipse cx="23" cy="36" rx="5.5" ry="4" transform="rotate(-14 23 36)" fill="#6D5642"/>
      <ellipse cx="41" cy="36" rx="5.5" ry="4" transform="rotate(14 41 36)" fill="#6D5642"/>
      <circle cx="24" cy="36" r="2.2" fill="#232733"/><circle cx="40" cy="36" r="2.2" fill="#232733"/>
      <ellipse cx="32" cy="40" rx="3.4" ry="2.2" fill="#3D3127"/>
      <path d="M27 45Q32 48.5 37 45" fill="none" stroke="#3D3127" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
  wolf: {
    label: 'Arctic Wolf',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#E6EEF5"/>
      <polygon points="15,14 26,25 16,32" fill="#8D9AA8"/><polygon points="49,14 38,25 48,32" fill="#8D9AA8"/>
      <polygon points="18,19 24,25 18,29" fill="#FFFDF8"/><polygon points="46,19 40,25 46,29" fill="#FFFDF8"/>
      <ellipse cx="32" cy="37" rx="18" ry="16" fill="#A6B2BE"/>
      <path d="M18 39C21 48 26 52 32 52C38 52 43 48 46 39C41 41 36 39 32 35C28 39 23 41 18 39Z" fill="#FFFDF8"/>
      <circle cx="24.5" cy="34" r="2.6" fill="#232733"/><circle cx="39.5" cy="34" r="2.6" fill="#232733"/>
      <polygon points="29,41 35,41 32,45" fill="#232733"/>
    </svg>`,
  },
  dragon: {
    label: 'Studio Dragon',
    svg: `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#FBEFD7"/>
      <path d="M19 16L24 26L15 24Z" fill="#E9A825"/><path d="M45 16L40 26L49 24Z" fill="#E9A825"/>
      <ellipse cx="32" cy="37" rx="18" ry="16" fill="#2E9690"/>
      <ellipse cx="32" cy="45" rx="11" ry="7" fill="#BCE3DF"/>
      <circle cx="24.5" cy="34" r="2.8" fill="#232733"/><circle cx="39.5" cy="34" r="2.8" fill="#232733"/>
      <circle cx="25.3" cy="33.1" r="0.9" fill="#FFF"/><circle cx="40.3" cy="33.1" r="0.9" fill="#FFF"/>
      <circle cx="28" cy="40" r="1.4" fill="#174F4B"/><circle cx="36" cy="40" r="1.4" fill="#174F4B"/>
      <path d="M26 45Q32 49 38 45" fill="none" stroke="#174F4B" stroke-width="1.9" stroke-linecap="round"/>
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

// Calm cumulative Studio Shelf keepsakes (unlocked permanently by total Daily Mix stars — never lost!)
export const STUDIO_SHELF_ITEMS = [
  {
    id: 'sprout-pot',
    title: 'Sunlit Sprout',
    starsRequired: 1,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <path d="M15 28H33L30 42H18Z" fill="#D97A54" stroke="#8C4226" stroke-width="2" stroke-linejoin="round"/>
      <rect x="13" y="25" width="22" height="4.5" rx="2" fill="#E68B66" stroke="#8C4226" stroke-width="1.8"/>
      <path d="M24 25V15" stroke="#2D7B48" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M24 19C16 19 13 13 18 10C22 10 24 15 24 19Z" fill="#4BAE6B" stroke="#26693D" stroke-width="1.8"/>
      <path d="M24 17C32 17 35 11 30 8C26 8 24 13 24 17Z" fill="#63C280" stroke="#26693D" stroke-width="1.8"/>
    </svg>`,
  },
  {
    id: 'brass-compass',
    title: 'Explorer Compass',
    starsRequired: 2,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <circle cx="24" cy="25" r="16" fill="#F2C96B" stroke="#9B6E14" stroke-width="2.2"/>
      <circle cx="24" cy="25" r="11.5" fill="#FFFDF8" stroke="#C79834" stroke-width="1.5"/>
      <polygon points="24,15 27.5,25 24,23 20.5,25" fill="#E45A3C"/>
      <polygon points="24,35 27.5,25 24,27 20.5,25" fill="#2A354B"/>
      <circle cx="24" cy="25" r="2" fill="#F2C96B"/>
    </svg>`,
  },
  {
    id: 'origami-crane',
    title: 'Paper Crane',
    starsRequired: 4,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <polygon points="8,24 24,19 20,34" fill="#5BC0B8" stroke="#1E6863" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="24,19 41,11 30,28" fill="#82D4CD" stroke="#1E6863" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="20,34 30,28 38,37 16,38" fill="#2E9690" stroke="#1E6863" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="8,24 14,16 18,21" fill="#E9A825" stroke="#8C5E08" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'sand-hourglass',
    title: 'Calm Hourglass',
    starsRequired: 6,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <rect x="13" y="8" width="22" height="4" rx="2" fill="#8D664E" stroke="#4D3425" stroke-width="1.8"/>
      <rect x="13" y="36" width="22" height="4" rx="2" fill="#8D664E" stroke="#4D3425" stroke-width="1.8"/>
      <path d="M16 12H32L25.5 24L32 36H16L22.5 24Z" fill="#E8F4F6" stroke="#5D707F" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="19,35 29,35 24,28" fill="#F2B430"/>
      <polygon points="20,16 28,16 24,22" fill="#F2B430"/>
    </svg>`,
  },
  {
    id: 'brass-telescope',
    title: 'Star Telescope',
    starsRequired: 9,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <line x1="24" y1="26" x2="15" y2="41" stroke="#6F5340" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="24" y1="26" x2="33" y2="41" stroke="#6F5340" stroke-width="2.5" stroke-linecap="round"/>
      <g transform="rotate(-24 24 22)">
        <rect x="9" y="18" width="28" height="8" rx="3" fill="#E9A825" stroke="#8C5E08" stroke-width="2"/>
        <rect x="33" y="16.5" width="7" height="11" rx="2" fill="#2E9690" stroke="#1E6863" stroke-width="1.8"/>
      </g>
    </svg>`,
  },
  {
    id: 'crystal-prism',
    title: 'Rainbow Prism',
    starsRequired: 12,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <line x1="5" y1="28" x2="18" y2="25" stroke="#F4B41A" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="30" y1="22" x2="43" y2="16" stroke="#EB5E3C" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="31" y1="25" x2="43" y2="24" stroke="#4BAE6B" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="30" y1="28" x2="43" y2="32" stroke="#2E9690" stroke-width="2.2" stroke-linecap="round"/>
      <polygon points="24,10 36,36 12,36" fill="#E5F6FA" stroke="#2A6E82" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'desk-lamp',
    title: 'Warm Desk Lamp',
    starsRequired: 16,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <rect x="14" y="38" width="20" height="4" rx="2" fill="#2A354B"/>
      <path d="M22 38L16 24L25 14" fill="none" stroke="#5D707F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 12L34 18L28 24L18 18Z" fill="#E46B49" stroke="#9B3B20" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="30" cy="23" r="3" fill="#FFE07A"/>
    </svg>`,
  },
  {
    id: 'paint-palette',
    title: 'Artist Palette',
    starsRequired: 20,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <path d="M24 9C14 9 8 16 8 25C8 33 14 39 22 39C26 39 27 36 27 34C27 32 29 31 32 31C37 31 40 27 40 22C40 14 33 9 24 9Z" fill="#EAD4B4" stroke="#8C6A44" stroke-width="2"/>
      <circle cx="17" cy="20" r="3" fill="#E46B49"/><circle cx="24" cy="16" r="3" fill="#F2B430"/>
      <circle cx="31" cy="19" r="3" fill="#2E9690"/><circle cx="17" cy="29" r="3" fill="#4BAE6B"/>
    </svg>`,
  },
  {
    id: 'wooden-globe',
    title: 'World Globe',
    starsRequired: 25,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <circle cx="24" cy="21" r="12" fill="#4CA9C4" stroke="#1E5F74" stroke-width="2"/>
      <path d="M18 16Q22 19 20 24Q24 27 28 22Q27 16 22 14Z" fill="#5CB874"/>
      <path d="M13 28A14 14 0 0 0 35 14" fill="none" stroke="#B68010" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="33" x2="24" y2="40" stroke="#8C5E08" stroke-width="2.6"/>
      <rect x="16" y="39" width="16" height="3.5" rx="1.7" fill="#8D664E"/>
    </svg>`,
  },
  {
    id: 'snowglobe',
    title: 'Starry Dome',
    starsRequired: 32,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <circle cx="24" cy="22" r="14" fill="#2A354B" stroke="#6D8294" stroke-width="2"/>
      <circle cx="18" cy="17" r="1.6" fill="#FFE07A"/><circle cx="29" cy="15" r="1.8" fill="#FFE07A"/>
      <circle cx="25" cy="23" r="1.4" fill="#FFF"/><path d="M16 30L24 22L32 30Z" fill="#3FA45E"/>
      <rect x="14" y="34" width="20" height="7" rx="3" fill="#B67642" stroke="#6F4422" stroke-width="1.8"/>
    </svg>`,
  },
  {
    id: 'studio-rocket',
    title: 'Model Rocket',
    starsRequired: 40,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <path d="M24 7C30 14 31 24 30 33H18C17 24 18 14 24 7Z" fill="#FFFDF8" stroke="#2A354B" stroke-width="2"/>
      <path d="M18 26L11 34L18 33Z" fill="#E46B49" stroke="#2A354B" stroke-width="1.6"/>
      <path d="M30 26L37 34L30 33Z" fill="#E46B49" stroke="#2A354B" stroke-width="1.6"/>
      <circle cx="24" cy="20" r="4" fill="#3AB0A8" stroke="#2A354B" stroke-width="1.8"/>
      <path d="M21 34L24 42L27 34Z" fill="#F4B41A"/>
    </svg>`,
  },
  {
    id: 'owl-trophy',
    title: 'Golden Owl',
    starsRequired: 50,
    svg: `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
      <ellipse cx="24" cy="22" rx="11" ry="12" fill="#F2B830" stroke="#9B6E14" stroke-width="2"/>
      <circle cx="20" cy="19" r="3.4" fill="#FFF8E0"/><circle cx="28" cy="19" r="3.4" fill="#FFF8E0"/>
      <circle cx="20" cy="19" r="1.5" fill="#232733"/><circle cx="28" cy="19" r="1.5" fill="#232733"/>
      <polygon points="22,22 26,22 24,25.5" fill="#D96B27"/>
      <rect x="15" y="34" width="18" height="6" rx="2.5" fill="#8D664E" stroke="#4D3425" stroke-width="1.8"/>
    </svg>`,
  },
];

// 16 Competence-Based Mastery Milestones (earned via accuracy, mastery depth & cumulative daily stars)
export const STUDIO_BADGES = [
  { id: 'daily-star', title: 'First Gold Star', desc: 'Complete your first full 4-pillar Daily Mix', pillar: 'analyze' },
  { id: 'five-stars', title: '5-Star Scholar', desc: 'Collect 5 cumulative Daily Mix stars', pillar: 'analyze' },
  { id: 'fifteen-stars', title: '15-Star Builder', desc: 'Collect 15 cumulative Daily Mix stars', pillar: 'visualize' },
  { id: 'thirty-stars', title: '30-Star Master', desc: 'Collect 30 cumulative Daily Mix stars', pillar: 'compute' },
  { id: 'spatial-builder', title: 'Spatial Ace', desc: 'Score 80%+ clean in a Visualize room', pillar: 'visualize' },
  { id: 'number-navigator', title: 'Compute Ace', desc: 'Score 80%+ clean (or 8+ sprint facts) in Compute', pillar: 'compute' },
  { id: 'logic-detective', title: 'Logic Ace', desc: 'Score 80%+ clean in an Analyze room', pillar: 'analyze' },
  { id: 'word-wizard', title: 'WordCraft Ace', desc: 'Score 80%+ clean in a WordCraft room', pillar: 'wordcraft' },
  { id: 'perfect-round', title: 'Clean Sweep (5/5)', desc: 'Solve every puzzle on the first try in any room', pillar: 'visualize' },
  { id: 'all-rounder', title: 'Studio Explorer', desc: 'Play 4 different games across the studio', pillar: 'visualize' },
  { id: 'grand-explorer', title: 'Grand Explorer', desc: 'Play 8 different games across the studio', pillar: 'wordcraft' },
  { id: 'word-collector', title: 'Word Collector', desc: 'Master 15 vocabulary, phonics, or root items cleanly', pillar: 'wordcraft' },
  { id: 'word-scholar', title: 'Word Scholar', desc: 'Master 45 vocabulary, phonics, or root items cleanly', pillar: 'wordcraft' },
  { id: 'fact-smooth', title: 'Smooth Recall', desc: 'Smooth out 20 math facts in Fact Studio', pillar: 'compute' },
  { id: 'stage-2-unlock', title: 'Stage 2 Climber', desc: 'Reach Mastery Stage 2 in any studio game', pillar: 'analyze' },
  { id: 'stage-3-master', title: 'Stage 3 Master', desc: 'Reach Mastery Stage 3 in any studio game', pillar: 'compute' },
];
