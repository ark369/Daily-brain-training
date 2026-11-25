/**
 * Word Builder (WordCraft Pillar — Phonics, Compounds, Prefixes/Suffixes & Greek/Latin Roots)
 * Full Read-Aloud audio support so 5–6 year olds can play independently!
 * - Tier 1 (Sprout): CVC word building & rhyming pairs with crisp custom SVG illustrations.
 * - Tier 2 (Explorer): Compound word forging & everyday prefixes/suffixes (un-, re-, -ful, -less).
 * - Tier 3 (Challenger): Greek & Latin roots (tele, bio, geo, tri, micro, auto, aqua, sub, etc.).
 * - Tier 4 (Trailblazer): Advanced morphological roots & vocabulary synthesis.
 */

import { pickMany, shuffle } from './utils.js';

export const meta = {
  id: 'word-builder',
  title: 'Word Builder',
  pillar: 'wordcraft',
  pillarLabel: 'WordCraft',
  shortDesc: 'Build rhymes, compound words, prefixes, and Greek & Latin word roots.',
  scienceNote: 'Morphological awareness & phonics word-building directly accelerate reading comprehension.',
  timed: false,
};

// Crisp kid-friendly inline SVG illustrations for Tier 1 early readers
const MINI_ART = {
  cat: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#FDEBD7"/>
    <polygon points="20,24 30,34 19,40" fill="#E48844"/>
    <polygon points="60,24 50,34 61,40" fill="#E48844"/>
    <circle cx="40" cy="44" r="19" fill="#EE9A55"/>
    <circle cx="33" cy="41" r="2.8" fill="#232733"/><circle cx="47" cy="41" r="2.8" fill="#232733"/>
    <polygon points="37,46 43,46 40,50" fill="#D95D5D"/>
    <path d="M36 53Q40 56 44 53" fill="none" stroke="#232733" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  sun: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#FFF4D6"/>
    <circle cx="40" cy="40" r="16" fill="#F2B430" stroke="#C98810" stroke-width="2.5"/>
    <g stroke="#E9A825" stroke-width="3.5" stroke-linecap="round">
      <line x1="40" y1="12" x2="40" y2="19"/><line x1="40" y1="61" x2="40" y2="68"/>
      <line x1="12" y1="40" x2="19" y2="40"/><line x1="61" y1="40" x2="68" y2="40"/>
      <line x1="20" y1="20" x2="25" y2="25"/><line x1="55" y1="55" x2="60" y2="60"/>
      <line x1="60" y1="20" x2="55" y2="25"/><line x1="25" y1="55" x2="20" y2="60"/>
    </g>
  </svg>`,
  bug: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#E4F4E7"/>
    <circle cx="40" cy="25" r="9" fill="#232733"/>
    <ellipse cx="40" cy="46" rx="17" ry="18" fill="#DC5842" stroke="#232733" stroke-width="2.2"/>
    <line x1="40" y1="29" x2="40" y2="64" stroke="#232733" stroke-width="2.2"/>
    <circle cx="32" cy="42" r="3.2" fill="#232733"/><circle cx="48" cy="42" r="3.2" fill="#232733"/>
    <circle cx="34" cy="54" r="3" fill="#232733"/><circle cx="46" cy="54" r="3" fill="#232733"/>
  </svg>`,
  hat: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#E1F2F1"/>
    <rect x="24" y="23" width="32" height="27" rx="6" fill="#2E9690" stroke="#1E6863" stroke-width="2.2"/>
    <rect x="24" y="42" width="32" height="7" fill="#E9A825"/>
    <ellipse cx="40" cy="52" rx="26" ry="7" fill="#2E9690" stroke="#1E6863" stroke-width="2.2"/>
  </svg>`,
  dog: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#FBEFD7"/>
    <ellipse cx="21" cy="42" rx="7" ry="15" fill="#7D5A44"/>
    <ellipse cx="59" cy="42" rx="7" ry="15" fill="#7D5A44"/>
    <circle cx="40" cy="42" r="18" fill="#B68661"/>
    <ellipse cx="40" cy="49" rx="9" ry="7" fill="#F3E2CE"/>
    <circle cx="33" cy="39" r="2.7" fill="#232733"/><circle cx="47" cy="39" r="2.7" fill="#232733"/>
    <ellipse cx="40" cy="47" rx="4" ry="3" fill="#232733"/>
  </svg>`,
  star: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#EEF2FA"/>
    <path d="M40 16L46.5 31L63 32.5L50.5 43L54 59L40 50.5L26 59L29.5 43L17 32.5L33.5 31Z" fill="#F2B430" stroke="#B67D0E" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`,
  bee: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#FFF4D6"/>
    <ellipse cx="34" cy="26" rx="9" ry="6" fill="#DFF2F6" stroke="#232733" stroke-width="1.8"/>
    <ellipse cx="47" cy="26" rx="9" ry="6" fill="#DFF2F6" stroke="#232733" stroke-width="1.8"/>
    <ellipse cx="40" cy="44" rx="20" ry="14" fill="#F2B430" stroke="#232733" stroke-width="2.2"/>
    <line x1="34" y1="31" x2="34" y2="57" stroke="#232733" stroke-width="4.5"/>
    <line x1="46" y1="31" x2="46" y2="57" stroke="#232733" stroke-width="4.5"/>
    <circle cx="27" cy="42" r="2.5" fill="#232733"/>
  </svg>`,
  cake: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#FCEAE4"/>
    <rect x="20" y="38" width="40" height="22" rx="5" fill="#F1B8A0" stroke="#232733" stroke-width="2"/>
    <path d="M20 42 Q26 49 32 42 Q38 49 44 42 Q50 49 60 42 L60 38 L20 38 Z" fill="#FFFDF8"/>
    <rect x="38" y="25" width="4" height="13" fill="#2E9690"/>
    <path d="M40 16 Q44 21 40 25 Q36 21 40 16Z" fill="#F2A922"/>
  </svg>`,
};

const TIER1_BANK = [
  {
    kind: 'cvc',
    art: 'cat',
    left: '?',
    right: 'at',
    answer: 'c',
    options: ['c', 'm', 'b', 'r'],
    fullWord: 'cat',
    clue: 'A furry pet that says meow!',
    tip: 'Say the picture name slowly: "c-c-cat". What letter makes the /k/ sound at the start?',
  },
  {
    kind: 'cvc',
    art: 'sun',
    left: '?',
    right: 'un',
    answer: 's',
    options: ['s', 'r', 'f', 'b'],
    fullWord: 'sun',
    clue: 'It shines bright in the sky!',
    tip: 'Listen to the very first sound in "s-s-sun"!',
  },
  {
    kind: 'cvc',
    art: 'bug',
    left: '?',
    right: 'ug',
    answer: 'b',
    options: ['b', 'h', 'm', 'r'],
    fullWord: 'bug',
    clue: 'A tiny spotted beetle!',
    tip: 'Say "b-b-bug" — which letter makes the /b/ sound?',
  },
  {
    kind: 'cvc',
    art: 'hat',
    left: '?',
    right: 'at',
    answer: 'h',
    options: ['h', 'p', 's', 'm'],
    fullWord: 'hat',
    clue: 'You wear this on your head!',
    tip: 'Whisper the start of "h-h-hat" — it sounds like a gentle puff of air!',
  },
  {
    kind: 'cvc',
    art: 'dog',
    left: '?',
    right: 'og',
    answer: 'd',
    options: ['d', 'f', 'l', 'j'],
    fullWord: 'dog',
    clue: 'A friendly pet that wags its tail!',
    tip: 'Listen to the opening sound in "d-d-dog"!',
  },
  {
    kind: 'rhyme',
    art: 'star',
    baseWord: 'star',
    answer: 'car',
    options: ['car', 'moon', 'fish', 'desk'],
    clue: 'Which word rhymes with STAR?',
    tip: 'Rhyming words end with the exact same sound: st-AR, c-AR!',
  },
  {
    kind: 'rhyme',
    art: 'bee',
    baseWord: 'bee',
    answer: 'tree',
    options: ['tree', 'bug', 'cup', 'frog'],
    clue: 'Which word rhymes with BEE?',
    tip: 'Listen to the ending sound: b-EE, tr-EE!',
  },
  {
    kind: 'rhyme',
    art: 'cake',
    baseWord: 'cake',
    answer: 'lake',
    options: ['lake', 'pie', 'book', 'hand'],
    clue: 'Which word rhymes with CAKE?',
    tip: 'Rhyming words share the ending sound: c-AKE, l-AKE!',
  },
];

const TIER2_BANK = [
  {
    left: 'sun',
    right: '?',
    answer: 'flower',
    options: ['flower', 'pillow', 'ladder', 'button'],
    fullWord: 'sunflower',
    clue: 'A tall yellow plant that faces the sun!',
    tip: 'Put two real words together to match the meaning: sun + flower = sunflower.',
  },
  {
    left: 'rain',
    right: '?',
    answer: 'bow',
    options: ['bow', 'shoe', 'fork', 'clock'],
    fullWord: 'rainbow',
    clue: 'A colorful arch in the sky after a storm!',
    tip: 'Combine rain + the word for a curved arch!',
  },
  {
    left: '?',
    right: 'happy',
    answer: 'un-',
    options: ['un-', 're-', 'pre-', 'sub-'],
    fullWord: 'unhappy',
    clue: 'Add a prefix to mean "NOT happy".',
    tip: 'The prefix "un-" means NOT (like unkind, unfair, unhappy)!',
  },
  {
    left: '?',
    right: 'read',
    answer: 're-',
    options: ['re-', 'un-', 'dis-', 'mis-'],
    fullWord: 'reread',
    clue: 'Add a prefix to mean "read AGAIN".',
    tip: 'The prefix "re-" means AGAIN (like replay, rebuild, reread)!',
  },
  {
    left: 'help',
    right: '?',
    answer: '-ful',
    options: ['-ful', '-less', '-er', '-est'],
    fullWord: 'helpful',
    clue: 'Add an ending to mean "FULL of help".',
    tip: 'The suffix "-ful" means full of (cheerful, careful, helpful)!',
  },
  {
    left: 'fear',
    right: '?',
    answer: '-less',
    options: ['-less', '-ful', '-ing', '-ly'],
    fullWord: 'fearless',
    clue: 'Add an ending to mean "WITHOUT fear" (super brave!).',
    tip: 'The suffix "-less" means WITHOUT (cloudless, endless, fearless)!',
  },
  {
    left: 'butter',
    right: '?',
    answer: 'fly',
    options: ['fly', 'cup', 'fish', 'tree'],
    fullWord: 'butterfly',
    clue: 'An insect with colorful wings!',
    tip: 'Say the two words together out loud to hear the real compound word.',
  },
  {
    left: '?',
    right: 'pack',
    answer: 'back',
    options: ['back', 'knee', 'hat', 'shoe'],
    fullWord: 'backpack',
    clue: 'A bag you carry on your shoulders for school!',
    tip: 'Where do you wear this pack? On your BACK!',
  },
];

const TIER3_BANK = [
  {
    left: 'tele',
    right: '?',
    answer: 'scope',
    options: ['scope', 'cycle', 'graph', 'pod'],
    fullWord: 'telescope',
    clue: 'tele (far) + ? (look/see) = an instrument to see faraway stars!',
    tip: 'Think of microscope and periscope — "scope" is the Greek root for looking/seeing!',
  },
  {
    left: 'bio',
    right: '?',
    answer: 'logy',
    options: ['logy', 'meter', 'phone', 'port'],
    fullWord: 'biology',
    clue: 'bio (life) + ? (study of) = the science of living things!',
    tip: '"-logy" means the study of (like geology, zoology, biology)!',
  },
  {
    left: '?',
    right: 'angle',
    answer: 'tri',
    options: ['tri', 'bi', 'uni', 'quad'],
    fullWord: 'triangle',
    clue: '? (three) + angle = a 3-sided shape with 3 angles!',
    tip: 'Think of tricycle and triceratops — "tri" means THREE!',
  },
  {
    left: '?',
    right: 'marine',
    answer: 'sub',
    options: ['sub', 'super', 'pre', 'anti'],
    fullWord: 'submarine',
    clue: '? (under) + marine (sea) = a ship that travels underwater!',
    tip: 'Think of subway and submerge — "sub-" means UNDER!',
  },
  {
    left: 'auto',
    right: '?',
    answer: 'graph',
    options: ['graph', 'scope', 'phone', 'therm'],
    fullWord: 'autograph',
    clue: 'auto (self) + ? (write) = a person’s own handwritten signature!',
    tip: 'Think of paragraph and biography — "graph" means WRITE!',
  },
  {
    left: '?',
    right: 'meter',
    answer: 'thermo',
    options: ['thermo', 'astro', 'aqua', 'chrono'],
    fullWord: 'thermometer',
    clue: '? (heat) + meter (measure) = a tool that measures temperature!',
    tip: 'Think of a thermos that keeps soup warm — "thermo" means HEAT!',
  },
  {
    left: 'micro',
    right: '?',
    answer: 'phone',
    options: ['phone', 'graph', 'port', 'cycle'],
    fullWord: 'microphone',
    clue: 'micro (small) + ? (sound) = makes quiet sounds louder!',
    tip: 'Think of telephone and symphony — "phone" is the Greek root for SOUND!',
  },
  {
    left: '?',
    right: 'view',
    answer: 'pre-',
    options: ['pre-', 'post-', 'dis-', 'non-'],
    fullWord: 'preview',
    clue: '? (before) + view (see) = a sneak peek BEFORE the full movie!',
    tip: 'Think of preschool and predict — "pre-" means BEFORE!',
  },
];

const TIER4_BANK = [
  {
    left: 'chrono',
    right: '?',
    answer: 'logy',
    options: ['logy', 'phobia', 'cracy', 'morph'],
    fullWord: 'chronology',
    clue: 'chrono (time) + ? (order/study) = arranging events in time order!',
    tip: '"chrono" means TIME (chronicle, synchronize) and "-logy" means study/order.',
  },
  {
    left: '?',
    right: 'struct',
    answer: 'con',
    options: ['con', 'de', 'ob', 'in'],
    fullWord: 'construct',
    clue: '? (together) + struct (build) = to build something together!',
    tip: '"con-" means with/together (connect, combine) and "struct" means build!',
  },
  {
    left: 'photo',
    right: '?',
    answer: 'synthesis',
    options: ['synthesis', 'sphere', 'logy', 'metric'],
    fullWord: 'photosynthesis',
    clue: 'photo (light) + ? (putting together) = how plants make food from sunlight!',
    tip: '"photo" = light, "synthesis" = putting together.',
  },
  {
    left: '?',
    right: 'dict',
    answer: 'pre',
    options: ['pre', 'contra', 'ver', 'inter'],
    fullWord: 'predict',
    clue: '? (before) + dict (say/speak) = to say what will happen ahead of time!',
    tip: '"dict" means speak/say (dictionary, dictate), and "pre-" means before.',
  },
  {
    left: '?',
    right: 'port',
    answer: 'trans',
    options: ['trans', 'im', 'ex', 're'],
    fullWord: 'transport',
    clue: '? (across) + port (carry) = to carry goods across from one place to another!',
    tip: '"trans-" means across (transatlantic, translate) and "port" means carry.',
  },
  {
    left: '?',
    right: 'spect',
    answer: 'in',
    options: ['in', 'retro', 'pro', 'circum'],
    fullWord: 'inspect',
    clue: '? (into) + spect (look) = to look closely into every detail!',
    tip: '"spect" means look (spectacles, spectator) — looking INto details = inspect!',
  },
  {
    left: 'geo',
    right: '?',
    answer: 'metry',
    options: ['metry', 'logy', 'thermal', 'centric'],
    fullWord: 'geometry',
    clue: 'geo (earth) + ? (measure) = the math of shapes, space, and measurement!',
    tip: '"geo" = earth, "metry" = measurement!',
  },
];

export function generateSession(tier = 1) {
  const bank = tier === 1 ? TIER1_BANK : tier === 2 ? TIER2_BANK : tier === 3 ? TIER3_BANK : TIER4_BANK;
  return pickMany(bank, 5).map((item) => ({
    ...item,
    tier,
    shuffledOptions: shuffle(item.options),
    prompt:
      item.kind === 'rhyme'
        ? item.clue
        : tier === 1
          ? 'Pick the starting letter to build the word!'
          : 'Snap the right word piece in place!',
    speakPrompt:
      item.kind === 'rhyme'
        ? `${item.clue} Options are: ${item.options.join(', ')}.`
        : `${item.clue} Which piece completes the word?`,
    strategyTip: item.tip,
  }));
}

export function renderRound(container, round, callbacks) {
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '18px';
  wrap.style.width = '100%';

  const stage = document.createElement('div');
  stage.className = 'word-stage-card';

  const artHtml = round.art && MINI_ART[round.art] ? MINI_ART[round.art] : '';

  if (round.kind === 'rhyme') {
    stage.innerHTML = `
      ${artHtml}
      <div class="morpheme-equation">
        <span class="morpheme-tile">${round.baseWord}</span>
        <span class="morpheme-plus">≈</span>
        <span class="morpheme-tile blank" id="wb-blank">?</span>
      </div>
      <p class="word-clue">${round.clue}</p>
    `;
  } else {
    stage.innerHTML = `
      ${artHtml}
      <div class="morpheme-equation">
        <span class="morpheme-tile ${round.left === '?' ? 'blank' : ''}" id="wb-left">${round.left}</span>
        <span class="morpheme-plus">+</span>
        <span class="morpheme-tile ${round.right === '?' ? 'blank' : ''}" id="wb-right">${round.right}</span>
      </div>
      <p class="word-clue">${round.clue}</p>
    `;
  }

  const grid = document.createElement('div');
  grid.className = 'choice-grid';

  round.shuffledOptions.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (solved) return;
      if (opt === round.answer) {
        solved = true;
        btn.classList.add('is-correct');
        const blank = stage.querySelector('.blank');
        if (blank) {
          blank.textContent = opt;
          blank.classList.remove('blank');
        }
        const celebrationMsg = round.fullWord
          ? `Awesome! You built "${round.fullWord}"! ${round.tip}`
          : `Yes! "${round.baseWord}" and "${round.answer}" rhyme!`;
        callbacks.onCorrect(!hadMistake, celebrationMsg);
      } else {
        hadMistake = true;
        btn.classList.add('is-wrong');
        btn.disabled = true;
        callbacks.onRetry(`Not "${opt}" — ${round.tip}`);
      }
    });
    grid.appendChild(btn);
  });

  wrap.appendChild(stage);
  wrap.appendChild(grid);
  container.appendChild(wrap);
}
