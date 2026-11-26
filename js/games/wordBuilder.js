/**
 * Word Builder (WordCraft Pillar — Phonics, Digraphs, Compounds, Affixes & Greek/Latin Roots)
 * - 44–46 curated items per tier (~184 total) paired with persistent spaced-retrieval mastery!
 * - Tier 1 (Sprout): Initial CVC, medial short vowels, digraphs (sh/ch/th/ck) & rhymes + mini SVGs.
 * - Tier 2 (Explorer): Compound words & everyday prefixes/suffixes (un-, re-, dis-, mis-, -ful, -less, -ly, -able).
 * - Tier 3 (Challenger): Grade 4–5 Greek & Latin roots (tele, bio, geo, rupt, port, dict, struct, aqua, photo...).
 * - Tier 4 (Trailblazer): Grade 6+ academic morphology & root synthesis.
 */

import { shuffle } from './utils.js';
import { selectSpacedWords, recordWordAttempt, getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

export const meta = {
  id: 'word-builder',
  title: 'Word Builder',
  pillar: 'wordcraft',
  pillarLabel: 'WordCraft',
  shortDesc: 'Build phonics, rhymes, compounds, prefixes, and Greek & Latin word roots.',
  scienceNote: 'Morphological awareness & spaced word-building directly accelerate reading comprehension.',
  timed: false,
};

// Crisp kid-friendly inline SVG illustrations for Tier 1 early readers
const MINI_ART = {
  cat: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#FDEBD7"/>
    <polygon points="20,24 30,34 19,40" fill="#E48844"/><polygon points="60,24 50,34 61,40" fill="#E48844"/>
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
    <ellipse cx="21" cy="42" rx="7" ry="15" fill="#7D5A44"/><ellipse cx="59" cy="42" rx="7" ry="15" fill="#7D5A44"/>
    <circle cx="40" cy="42" r="18" fill="#B68661"/><ellipse cx="40" cy="49" rx="9" ry="7" fill="#F3E2CE"/>
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
  fish: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#DFF2F6"/>
    <polygon points="56,40 68,29 68,51" fill="#2E9690" stroke="#1E6863" stroke-width="2"/>
    <ellipse cx="38" cy="40" rx="20" ry="13" fill="#3AB0A8" stroke="#1E6863" stroke-width="2.2"/>
    <circle cx="28" cy="37" r="2.6" fill="#232733"/>
  </svg>`,
  ship: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#E3F2FA"/>
    <polygon points="39,18 39,45 58,45" fill="#FFFDF8" stroke="#232733" stroke-width="2"/>
    <polygon points="37,24 37,45 23,45" fill="#F2B430" stroke="#232733" stroke-width="2"/>
    <path d="M18 48 L62 48 L54 60 L26 60 Z" fill="#C9522B" stroke="#232733" stroke-width="2"/>
  </svg>`,
  cup: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#FDEBD7"/>
    <path d="M52 33 Q64 33 64 43 Q64 52 52 52" fill="none" stroke="#2E9690" stroke-width="4.5"/>
    <rect x="24" y="28" width="28" height="30" rx="6" fill="#3AB0A8" stroke="#1E6863" stroke-width="2.2"/>
  </svg>`,
  moon: `<svg class="word-illustration" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill="#2A354B"/>
    <path d="M48 20 A20 20 0 1 0 58 54 A15 15 0 1 1 48 20 Z" fill="#F6C84C"/>
  </svg>`,
};

// Compact constructors keep 180+ curated items clean, readable, and strictly verified
const mPart = (id, parts, answer, options, fullWord, clue, tip, art = null, kind = 'part') => ({
  id,
  kind,
  art,
  parts, // array of tile strings, one of which is '?'
  answer,
  options,
  fullWord,
  clue,
  tip,
});

const mRhyme = (id, baseWord, answer, options, tip, art = null) => ({
  id,
  kind: 'rhyme',
  art,
  baseWord,
  answer,
  options,
  clue: `Which word rhymes with ${baseWord.toUpperCase()}?`,
  tip,
});

// Tier 1 (Sprout, Ages 5–6): 44 items — Initial CVC, Medial Short Vowels, Digraphs & Rhymes
const TIER1_BANK = [
  // Initial CVC sounds (14)
  mPart('t1-cat', ['?', 'at'], 'c', ['c', 'm', 'b', 'r'], 'cat', 'A furry pet that says meow!', 'Say "c-c-cat" slowly — which letter makes the /k/ sound?', 'cat', 'cvc'),
  mPart('t1-sun', ['?', 'un'], 's', ['s', 'r', 'f', 'b'], 'sun', 'It shines bright in the sky!', 'Listen to the opening sound in "s-s-sun"!', 'sun', 'cvc'),
  mPart('t1-bug', ['?', 'ug'], 'b', ['b', 'h', 'm', 'r'], 'bug', 'A tiny spotted beetle!', 'Say "b-b-bug" — which letter makes the /b/ sound?', 'bug', 'cvc'),
  mPart('t1-hat', ['?', 'at'], 'h', ['h', 'p', 's', 'm'], 'hat', 'You wear this on your head!', 'Whisper "h-h-hat" — it starts with a soft puff of air!', 'hat', 'cvc'),
  mPart('t1-dog', ['?', 'og'], 'd', ['d', 'f', 'l', 'j'], 'dog', 'A friendly pet that wags its tail!', 'Listen to the first sound in "d-d-dog"!', 'dog', 'cvc'),
  mPart('t1-cup', ['?', 'up'], 'c', ['c', 'p', 't', 'm'], 'cup', 'You drink milk or cocoa from this!', 'Say "c-c-cup" — starts with /k/!', 'cup', 'cvc'),
  mPart('t1-pig', ['?', 'ig'], 'p', ['p', 'w', 'd', 'f'], 'pig', 'A pink farm animal that says oink!', 'Pop your lips on "p-p-pig"!', null, 'cvc'),
  mPart('t1-bus', ['?', 'us'], 'b', ['b', 'g', 't', 'l'], 'bus', 'A big yellow ride to school!', 'Say "b-b-bus" — starts with /b/!', null, 'cvc'),
  mPart('t1-bed', ['?', 'ed'], 'b', ['b', 'r', 'f', 'l'], 'bed', 'A cozy spot where you sleep at night!', 'Listen to the start of "b-b-bed"!', null, 'cvc'),
  mPart('t1-fox', ['?', 'ox'], 'f', ['f', 'b', 'p', 'm'], 'fox', 'A clever orange woodland animal!', 'Say "f-f-fox" — gentle air through your teeth!', null, 'cvc'),
  mPart('t1-net', ['?', 'et'], 'n', ['n', 'p', 'j', 'w'], 'net', 'You catch butterflies or goals with this!', 'Listen to the start of "n-n-net"!', null, 'cvc'),
  mPart('t1-pot', ['?', 'ot'], 'p', ['p', 'h', 'd', 'c'], 'pot', 'You cook warm soup inside this!', 'Say "p-p-pot" — starts with /p/!', null, 'cvc'),
  mPart('t1-web', ['?', 'eb'], 'w', ['w', 't', 'd', 'm'], 'web', 'A spider spins this silky home!', 'Round your lips on "w-w-web"!', null, 'cvc'),
  mPart('t1-map', ['?', 'ap'], 'm', ['m', 'c', 't', 'n'], 'map', 'Shows roads, islands, and treasure!', 'Hum at the start of "m-m-map"!', null, 'cvc'),

  // Middle short vowels (10)
  mPart('t1-v-bat', ['b', '?', 't'], 'a', ['a', 'i', 'o', 'u'], 'bat', 'A flying animal that comes out at night!', 'Stretch the middle sound: b-aaa-t — short A!', null, 'vowel'),
  mPart('t1-v-pen', ['p', '?', 'n'], 'e', ['e', 'a', 'o', 'u'], 'pen', 'You write with ink using this!', 'Stretch the middle sound: p-eee-n — short E!', null, 'vowel'),
  mPart('t1-v-sit', ['s', '?', 't'], 'i', ['i', 'a', 'o', 'u'], 'sit', 'Take a seat in a chair!', 'Stretch the middle sound: s-iii-t — short I!', null, 'vowel'),
  mPart('t1-v-box', ['b', '?', 'x'], 'o', ['o', 'a', 'e', 'i'], 'box', 'A square cardboard container for toys!', 'Stretch the middle sound: b-ooo-x — short O!', null, 'vowel'),
  mPart('t1-v-rug', ['r', '?', 'g'], 'u', ['u', 'a', 'e', 'i'], 'rug', 'A soft carpet you step on!', 'Stretch the middle sound: r-uuu-g — short U!', null, 'vowel'),
  mPart('t1-v-red', ['r', '?', 'd'], 'e', ['e', 'a', 'i', 'o'], 'red', 'The color of a shiny fire truck!', 'Stretch the middle sound: r-eee-d — short E!', null, 'vowel'),
  mPart('t1-v-fin', ['f', '?', 'n'], 'i', ['i', 'a', 'o', 'u'], 'fin', 'Helps a fish steer through water!', 'Stretch the middle sound: f-iii-n — short I!', 'fish', 'vowel'),
  mPart('t1-v-hop', ['h', '?', 'p'], 'o', ['o', 'a', 'e', 'u'], 'hop', 'How a frog or bunny jumps!', 'Stretch the middle sound: h-ooo-p — short O!', null, 'vowel'),
  mPart('t1-v-mug', ['m', '?', 'g'], 'u', ['u', 'a', 'e', 'i'], 'mug', 'A big warm cup for hot cocoa!', 'Stretch the middle sound: m-uuu-g — short U!', 'cup', 'vowel'),
  mPart('t1-v-pan', ['p', '?', 'n'], 'a', ['a', 'i', 'o', 'u'], 'pan', 'You flip pancakes in this!', 'Stretch the middle sound: p-aaa-n — short A!', null, 'vowel'),

  // Common Digraphs: sh, ch, th, ck (8)
  mPart('t1-d-ship', ['?', 'ip'], 'sh', ['sh', 'ch', 'th', 'wh'], 'ship', 'A big sailing boat on the ocean!', 'Listen for the quiet "shhh" sound at the start of SHip!', 'ship', 'digraph'),
  mPart('t1-d-fish', ['fi', '?'], 'sh', ['sh', 'ch', 'ck', 'th'], 'fish', 'Swims underwater with fins!', 'Hear the "shhh" sound at the end of fi-SH!', 'fish', 'digraph'),
  mPart('t1-d-chin', ['?', 'in'], 'ch', ['ch', 'sh', 'th', 'ck'], 'chin', 'The part of your face right below your mouth!', 'Hear the choo-choo /ch/ sound at the start of CHin!', null, 'digraph'),
  mPart('t1-d-chick', ['?', 'ick'], 'ch', ['ch', 'sh', 'th', 'wh'], 'chick', 'A fluffy yellow baby bird!', 'Starts with the /ch/ sound: CH-ick!', null, 'digraph'),
  mPart('t1-d-thumb', ['?', 'umb'], 'th', ['th', 'sh', 'ch', 'ck'], 'thumb', 'Your short helper finger for thumbs-up!', 'Put your tongue gently between your teeth for TH-umb!', null, 'digraph'),
  mPart('t1-d-duck', ['du', '?'], 'ck', ['ck', 'sh', 'ch', 'th'], 'duck', 'A pond bird that says quack!', 'CK together makes a crisp /k/ sound at the end of du-CK!', null, 'digraph'),
  mPart('t1-d-shell', ['?', 'ell'], 'sh', ['sh', 'ch', 'th', 'wh'], 'shell', 'You find these pretty treasures on the beach!', 'Starts with the soft "shhh" sound: SH-ell!', null, 'digraph'),
  mPart('t1-d-sock', ['so', '?'], 'ck', ['ck', 'sh', 'ch', 'th'], 'sock', 'Keeps your foot cozy inside a shoe!', 'Ends with the crisp /k/ sound spelled CK: so-CK!', null, 'digraph'),

  // Rhyming Pairs (12)
  mRhyme('t1-r-star', 'star', 'car', ['car', 'moon', 'fish', 'desk'], 'Rhyming words share the exact ending sound: st-AR, c-AR!', 'star'),
  mRhyme('t1-r-bee', 'bee', 'tree', ['tree', 'bug', 'cup', 'frog'], 'Listen to the ending sound: b-EE, tr-EE!', 'bee'),
  mRhyme('t1-r-cake', 'cake', 'lake', ['lake', 'pie', 'book', 'hand'], 'Rhyming words share the ending sound: c-AKE, l-AKE!', 'cake'),
  mRhyme('t1-r-frog', 'frog', 'dog', ['dog', 'bird', 'jump', 'pond'], 'Say them together: fr-OG, d-OG!', 'dog'),
  mRhyme('t1-r-boat', 'boat', 'goat', ['goat', 'ship', 'wave', 'duck'], 'Both end with the -OAT sound: b-OAT, g-OAT!', 'ship'),
  mRhyme('t1-r-moon', 'moon', 'spoon', ['spoon', 'night', 'star', 'bed'], 'Both end with the -OON sound: m-OON, sp-OON!', 'moon'),
  mRhyme('t1-r-rain', 'rain', 'train', ['train', 'cloud', 'wet', 'coat'], 'Listen to the ending: r-AIN, tr-AIN!'),
  mRhyme('t1-r-king', 'king', 'ring', ['ring', 'crown', 'gold', 'bear'], 'Both end with -ING: k-ING, r-ING!'),
  mRhyme('t1-r-duck', 'duck', 'truck', ['truck', 'pond', 'quack', 'bird'], 'Both end with -UCK: d-UCK, tr-UCK!'),
  mRhyme('t1-r-cat', 'cat', 'hat', ['hat', 'dog', 'tail', 'milk'], 'Listen to the ending: c-AT, h-AT!', 'cat'),
  mRhyme('t1-r-sun', 'sun', 'run', ['run', 'hot', 'sky', 'day'], 'Both end with -UN: s-UN, r-UN!', 'sun'),
  mRhyme('t1-r-bug', 'bug', 'rug', ['rug', 'ant', 'leaf', 'fly'], 'Both end with -UG: b-UG, r-UG!', 'bug'),
];

// Tier 2 (Explorer, Ages 7–8): 46 items — Compound Words & Everyday Prefixes/Suffixes
const TIER2_BANK = [
  // Compounds (22)
  mPart('t2-sunflower', ['sun', '?'], 'flower', ['flower', 'pillow', 'ladder', 'button'], 'sunflower', 'A tall yellow plant that faces the sun!', 'sun + flower = sunflower.'),
  mPart('t2-rainbow', ['rain', '?'], 'bow', ['bow', 'shoe', 'fork', 'clock'], 'rainbow', 'A colorful arch in the sky after a storm!', 'Combine rain + the word for a curved arch!'),
  mPart('t2-butterfly', ['butter', '?'], 'fly', ['fly', 'cup', 'fish', 'tree'], 'butterfly', 'An insect with colorful wings!', 'butter + fly = butterfly.'),
  mPart('t2-backpack', ['?', 'pack'], 'back', ['back', 'knee', 'hat', 'shoe'], 'backpack', 'A bag you carry on your shoulders for school!', 'Where do you wear this pack? On your BACK!'),
  mPart('t2-snowman', ['snow', '?'], 'man', ['man', 'cup', 'bell', 'car'], 'snowman', 'A winter sculpture with a carrot nose!', 'snow + man = snowman!'),
  mPart('t2-starfish', ['star', '?'], 'fish', ['fish', 'bird', 'frog', 'bear'], 'starfish', 'A five-armed ocean creature!', 'star + fish = starfish!'),
  mPart('t2-cupcake', ['cup', '?'], 'cake', ['cake', 'soup', 'rice', 'milk'], 'cupcake', 'A personal-sized frosted birthday treat!', 'cup + cake = cupcake!'),
  mPart('t2-lighthouse', ['light', '?'], 'house', ['house', 'train', 'spoon', 'coat'], 'lighthouse', 'A tall seaside tower that guides ships at night!', 'light + house = lighthouse!'),
  mPart('t2-pancake', ['pan', '?'], 'cake', ['cake', 'leaf', 'sock', 'bell'], 'pancake', 'A flat breakfast treat topped with maple syrup!', 'Cooked in a pan: pan + cake = pancake!'),
  mPart('t2-popcorn', ['pop', '?'], 'corn', ['corn', 'pea', 'bean', 'nut'], 'popcorn', 'A crunchy movie-night snack that puffs up when heated!', 'pop + corn = popcorn!'),
  mPart('t2-jellyfish', ['jelly', '?'], 'fish', ['fish', 'duck', 'bug', 'cat'], 'jellyfish', 'A glowing sea animal that floats like an umbrella!', 'jelly + fish = jellyfish!'),
  mPart('t2-bookshelf', ['book', '?'], 'shelf', ['shelf', 'shoe', 'lamp', 'door'], 'bookshelf', 'A piece of furniture that holds your stories!', 'book + shelf = bookshelf!'),
  mPart('t2-waterfall', ['water', '?'], 'fall', ['fall', 'jump', 'climb', 'walk'], 'waterfall', 'A river tumbling straight down a cliff!', 'water + fall = waterfall!'),
  mPart('t2-treehouse', ['tree', '?'], 'house', ['house', 'boat', 'pond', 'rock'], 'treehouse', 'A cozy fort built up in the branches!', 'tree + house = treehouse!'),
  mPart('t2-firefly', ['fire', '?'], 'fly', ['fly', 'frog', 'worm', 'ant'], 'firefly', 'A summer beetle that lights up in the dark!', 'fire + fly = firefly!'),
  mPart('t2-sandbox', ['sand', '?'], 'box', ['box', 'cup', 'hat', 'bag'], 'sandbox', 'A playground frame filled with sand for building castles!', 'sand + box = sandbox!'),
  mPart('t2-toothbrush', ['tooth', '?'], 'brush', ['brush', 'comb', 'fork', 'pen'], 'toothbrush', 'You use this every morning and night to clean teeth!', 'tooth + brush = toothbrush!'),
  mPart('t2-notebook', ['note', '?'], 'book', ['book', 'shoe', 'coat', 'ball'], 'notebook', 'Lined pages bound together for writing ideas!', 'note + book = notebook!'),
  mPart('t2-dragonfly', ['dragon', '?'], 'fly', ['fly', 'dog', 'fish', 'owl'], 'dragonfly', 'A zippy pond insect with four shimmering wings!', 'dragon + fly = dragonfly!'),
  mPart('t2-footprint', ['foot', '?'], 'print', ['print', 'hat', 'cup', 'ring'], 'footprint', 'A mark your shoe leaves behind in mud or snow!', 'foot + print = footprint!'),
  mPart('t2-earring', ['ear', '?'], 'ring', ['ring', 'boot', 'hat', 'bag'], 'earring', 'A shiny piece of jewelry worn on your ear!', 'ear + ring = earring!'),
  mPart('t2-bedtime', ['bed', '?'], 'time', ['time', 'food', 'rain', 'song'], 'bedtime', 'The hour in the evening when it is time to sleep!', 'bed + time = bedtime!'),

  // Everyday Prefixes & Suffixes (24)
  mPart('t2-unhappy', ['?', 'happy'], 'un-', ['un-', 're-', 'pre-', 'sub-'], 'unhappy', 'Add a prefix to mean "NOT happy".', '"un-" means NOT (unkind, unfair, unhappy)!'),
  mPart('t2-unlock', ['?', 'lock'], 'un-', ['un-', 're-', 'pre-', 'mis-'], 'unlock', 'Add a prefix to undo a lock and open a door!', '"un-" reverses an action (untie, unwrap, unlock)!'),
  mPart('t2-unkind', ['?', 'kind'], 'un-', ['un-', 're-', 'pre-', 'bi-'], 'unkind', 'Add a prefix to mean "NOT kind".', '"un-" flips an adjective to its opposite!'),
  mPart('t2-reread', ['?', 'read'], 're-', ['re-', 'un-', 'dis-', 'mis-'], 'reread', 'Add a prefix to mean "read AGAIN".', '"re-" means AGAIN (replay, rebuild, reread)!'),
  mPart('t2-rebuild', ['?', 'build'], 're-', ['re-', 'un-', 'pre-', 'dis-'], 'rebuild', 'Add a prefix to mean "build AGAIN" after blocks fall!', '"re-" means doing it one more time!'),
  mPart('t2-refill', ['?', 'fill'], 're-', ['re-', 'un-', 'mis-', 'non-'], 'refill', 'Add a prefix to mean "fill AGAIN" when your glass is empty!', '"re-" = again: refill!'),
  mPart('t2-preheat', ['?', 'heat'], 'pre-', ['pre-', 're-', 'un-', 'dis-'], 'preheat', 'Add a prefix to mean "warm the oven BEFORE baking"!', '"pre-" means BEFORE (preschool, preheat)!'),
  mPart('t2-disagree', ['?', 'agree'], 'dis-', ['dis-', 're-', 'pre-', 'over-'], 'disagree', 'Add a prefix to mean "NOT agree" with someone!', '"dis-" means NOT or opposite (dislike, disappear, disagree)!'),
  mPart('t2-disappear', ['?', 'appear'], 'dis-', ['dis-', 're-', 'pre-', 'mis-'], 'disappear', 'Add a prefix to mean "vanish out of sight"!', '"dis-" reverses appear → disappear!'),
  mPart('t2-misspell', ['?', 'spell'], 'mis-', ['mis-', 're-', 'pre-', 'un-'], 'misspell', 'Add a prefix to mean "spell WRONGLY"!', '"mis-" means wrongly or badly (misplace, mistake, misspell)!'),
  mPart('t2-misplace', ['?', 'place'], 'mis-', ['mis-', 're-', 'un-', 'pre-'], 'misplace', 'Add a prefix to mean "put in the WRONG spot and lose it"!', '"mis-" means wrongly: misplace!'),
  mPart('t2-helpful', ['help', '?'], '-ful', ['-ful', '-less', '-er', '-est'], 'helpful', 'Add an ending to mean "FULL of help".', '"-ful" means full of (cheerful, careful, helpful)!'),
  mPart('t2-careful', ['care', '?'], '-ful', ['-ful', '-less', '-er', '-ing'], 'careful', 'Add an ending to mean "FULL of care".', '"-ful" means full of!'),
  mPart('t2-fearless', ['fear', '?'], '-less', ['-less', '-ful', '-ing', '-ly'], 'fearless', 'Add an ending to mean "WITHOUT fear" (super brave!).', '"-less" means WITHOUT (cloudless, endless, fearless)!'),
  mPart('t2-cloudless', ['cloud', '?'], '-less', ['-less', '-ful', '-er', '-est'], 'cloudless', 'Add an ending to mean "a bright sky WITHOUT clouds"!', '"-less" means without!'),
  mPart('t2-endless', ['end', '?'], '-less', ['-less', '-ful', '-ly', '-er'], 'endless', 'Add an ending to mean "going on WITHOUT an end"!', '"-less" means without!'),
  mPart('t2-quickly', ['quick', '?'], '-ly', ['-ly', '-ful', '-less', '-er'], 'quickly', 'Add an ending to describe HOW someone ran ("in a quick way")!', '"-ly" tells how an action is done (bravely, softly, quickly)!'),
  mPart('t2-bravely', ['brave', '?'], '-ly', ['-ly', '-less', '-ful', '-est'], 'bravely', 'Add an ending to mean "in a brave way"!', '"-ly" turns an adjective into a how-word!'),
  mPart('t2-teacher', ['teach', '?'], '-er', ['-er', '-less', '-ful', '-est'], 'teacher', 'Add an ending to mean "a person who teaches"!', '"-er" at the end of an action word means a person who does it (baker, painter, teacher)!'),
  mPart('t2-painter', ['paint', '?'], '-er', ['-er', '-less', '-ly', '-est'], 'painter', 'Add an ending to mean "a person who paints"!', '"-er" means someone who does the action!'),
  mPart('t2-fastest', ['fast', '?'], '-est', ['-est', '-er', '-ly', '-less'], 'fastest', 'Add an ending to mean "the MOST fast of all"!', '"-est" means the most (tallest, loudest, fastest)!'),
  mPart('t2-tallest', ['tall', '?'], '-est', ['-est', '-er', '-ful', '-ly'], 'tallest', 'Add an ending to mean "the MOST tall in the room"!', '"-est" compares 3 or more to find the top one!'),
  mPart('t2-readable', ['read', '?'], '-able', ['-able', '-less', '-est', '-ly'], 'readable', 'Add an ending to mean "CAN BE read easily"!', '"-able" means able to be (washable, playable, readable)!'),
  mPart('t2-washable', ['wash', '?'], '-able', ['-able', '-less', '-ful', '-er'], 'washable', 'Add an ending to mean "markers that CAN BE washed off"!', '"-able" means able to be!'),
];

// Tier 3 (Challenger, Ages 9–10): 46 items — Grade 4–5 Greek & Latin Roots
const TIER3_BANK = [
  mPart('t3-telescope', ['tele', '?'], 'scope', ['scope', 'cycle', 'graph', 'pod'], 'telescope', 'tele (far) + ? (look/see) = an instrument to see faraway stars!', '"scope" is the Greek root for looking/seeing (microscope, periscope)!'),
  mPart('t3-biology', ['bio', '?'], 'logy', ['logy', 'meter', 'phone', 'port'], 'biology', 'bio (life) + ? (study of) = the science of living things!', '"-logy" means the study of (geology, zoology, biology)!'),
  mPart('t3-triangle', ['?', 'angle'], 'tri', ['tri', 'bi', 'uni', 'quad'], 'triangle', '? (three) + angle = a 3-sided shape with 3 angles!', '"tri" means THREE (tricycle, triceratops)!'),
  mPart('t3-submarine', ['?', 'marine'], 'sub', ['sub', 'super', 'pre', 'anti'], 'submarine', '? (under) + marine (sea) = a ship that travels underwater!', '"sub-" means UNDER (subway, submerge)!'),
  mPart('t3-autograph', ['auto', '?'], 'graph', ['graph', 'scope', 'phone', 'therm'], 'autograph', 'auto (self) + ? (write) = a person’s own handwritten signature!', '"graph" means WRITE (paragraph, biography)!'),
  mPart('t3-thermometer', ['?', 'meter'], 'thermo', ['thermo', 'astro', 'aqua', 'chrono'], 'thermometer', '? (heat) + meter (measure) = a tool that measures temperature!', '"thermo" means HEAT (thermos, thermal)!'),
  mPart('t3-microphone', ['micro', '?'], 'phone', ['phone', 'graph', 'port', 'cycle'], 'microphone', 'micro (small) + ? (sound) = makes quiet sounds louder!', '"phone" is the Greek root for SOUND (telephone, symphony)!'),
  mPart('t3-preview', ['?', 'view'], 'pre-', ['pre-', 'post-', 'dis-', 'non-'], 'preview', '? (before) + view (see) = a sneak peek BEFORE the full movie!', '"pre-" means BEFORE (preschool, predict)!'),
  mPart('t3-aquarium', ['?', 'rium'], 'aqua', ['aqua', 'terra', 'aero', 'luna'], 'aquarium', '? (water) + place = a tank full of water for fish and sea life!', '"aqua" is the Latin root for WATER (aquatic, aqueduct)!'),
  mPart('t3-photograph', ['?', 'graph'], 'photo', ['photo', 'tele', 'bio', 'auto'], 'photograph', '? (light) + graph (draw/write) = a picture captured with light!', '"photo" means LIGHT (photosynthesis, photon)!'),
  mPart('t3-astronaut', ['?', 'naut'], 'astro', ['astro', 'aqua', 'geo', 'bio'], 'astronaut', '? (star) + naut (sailor) = a sailor who explores outer space!', '"astro" means STAR (astronomy, asteroid)!'),
  mPart('t3-geography', ['?', 'graphy'], 'geo', ['geo', 'bio', 'chrono', 'micro'], 'geography', '? (earth) + graphy (writing/mapping) = the study of Earth’s lands!', '"geo" means EARTH (geology, geometry)!'),
  mPart('t3-erupt', ['e', '?'], 'rupt', ['rupt', 'port', 'dict', 'vis'], 'erupt', 'e- (out) + ? (break/burst) = when a volcano bursts outward!', '"rupt" means BREAK or BURST (interrupt, disrupt, bankrupt)!'),
  mPart('t3-portable', ['?', 'able'], 'port', ['port', 'dict', 'scrib', 'aud'], 'portable', '? (carry) + able = light enough to carry easily!', '"port" means CARRY (transport, export, porter)!'),
  mPart('t3-bicycle', ['?', 'cycle'], 'bi', ['bi', 'tri', 'uni', 'oct'], 'bicycle', '? (two) + cycle (wheel) = a pedal vehicle with 2 wheels!', '"bi-" means TWO (binoculars, bilingual)!'),
  mPart('t3-unicycle', ['?', 'cycle'], 'uni', ['uni', 'bi', 'tri', 'quad'], 'unicycle', '? (one) + cycle (wheel) = a circus bike with just 1 wheel!', '"uni-" means ONE (unicorn, uniform, unite)!'),
  mPart('t3-octagon', ['?', 'gon'], 'octa', ['octa', 'penta', 'hexa', 'tri'], 'octagon', '? (eight) + gon (angle) = an 8-sided stop-sign shape!', '"oct-" means EIGHT (octopus, octave, October)!'),
  mPart('t3-pentagon', ['?', 'gon'], 'penta', ['penta', 'octa', 'tri', 'deca'], 'pentagon', '? (five) + gon (angle) = a 5-sided polygon!', '"penta-" means FIVE (pentathlon, pentagon)!'),
  mPart('t3-century', ['?', 'ury'], 'cent', ['cent', 'dec', 'milli', 'semi'], 'century', '? (hundred) + years = a span of 100 years!', '"cent" means HUNDRED (centimeter, percent, centipede)!'),
  mPart('t3-decade', ['?', 'ade'], 'dec', ['dec', 'cent', 'tri', 'bi'], 'decade', '? (ten) + years = a span of 10 years!', '"dec-" means TEN (decimal, decagon, decade)!'),
  mPart('t3-semicircle', ['?', 'circle'], 'semi', ['semi', 'multi', 'super', 'inter'], 'semicircle', '? (half) + circle = exactly half of a circle!', '"semi-" means HALF (semifinal, semicolon)!'),
  mPart('t3-multicolor', ['?', 'color'], 'multi', ['multi', 'mono', 'semi', 'sub'], 'multicolor', '? (many) + color = made of lots of different colors!', '"multi-" means MANY (multiply, multitude)!'),
  mPart('t3-international', ['?', 'national'], 'inter', ['inter', 'intra', 'sub', 'anti'], 'international', '? (between) + national = connecting between different countries!', '"inter-" means BETWEEN (internet, interact, interstate)!'),
  mPart('t3-antifreeze', ['?', 'freeze'], 'anti', ['anti', 'pro', 'pre', 'auto'], 'antifreeze', '? (against) + freeze = liquid that works AGAINST freezing!', '"anti-" means AGAINST (antibiotic, antisocial)!'),
  mPart('t3-audible', ['?', 'ible'], 'aud', ['aud', 'vis', 'port', 'rupt'], 'audible', '? (hear) + ible = loud enough to be heard!', '"aud" means HEAR (audio, audience, auditorium)!'),
  mPart('t3-visible', ['?', 'ible'], 'vis', ['vis', 'aud', 'dict', 'tract'], 'visible', '? (see) + ible = clear enough to be seen!', '"vis" means SEE (vision, invisible, television)!'),
  mPart('t3-tractor', ['?', 'or'], 'tract', ['tract', 'port', 'struct', 'scrib'], 'tractor', '? (pull/drag) + or = a farm machine that pulls heavy plows!', '"tract" means PULL (attract, subtract, extract)!'),
  mPart('t3-biography', ['bio', '?'], 'graphy', ['graphy', 'scope', 'phone', 'meter'], 'biography', 'bio (life) + ? (writing) = the written story of someone’s life!', '"bio" = life, "graphy" = writing!'),
  mPart('t3-geology', ['geo', '?'], 'logy', ['logy', 'naut', 'phone', 'port'], 'geology', 'geo (earth) + ? (study of) = the study of rocks and Earth’s crust!', '"geo" = earth, "-logy" = study of!'),
  mPart('t3-perimeter', ['peri', '?'], 'meter', ['meter', 'graph', 'scope', 'logy'], 'perimeter', 'peri (around) + ? (measure) = the distance measured all around a shape!', '"peri" = around, "meter" = measure!'),
  mPart('t3-megaphone', ['mega', '?'], 'phone', ['phone', 'scope', 'meter', 'cycle'], 'megaphone', 'mega (huge) + ? (sound) = a cone that makes your voice giant!', '"mega" = large, "phone" = sound!'),
  mPart('t3-microscope', ['?', 'scope'], 'micro', ['micro', 'macro', 'tele', 'auto'], 'microscope', '? (tiny) + scope (look) = lets scientists see tiny cells!', '"micro" means TINY (microchip, microbe)!'),
  mPart('t3-tripod', ['tri', '?'], 'pod', ['pod', 'graph', 'meter', 'phone'], 'tripod', 'tri (three) + ? (foot) = a 3-legged stand for a camera!', '"pod/ped" means FOOT (pedal, octopus, centipede)!'),
  mPart('t3-pedestrian', ['?', 'estrian'], 'ped', ['ped', 'man', 'aud', 'vis'], 'pedestrian', '? (foot) + person = someone traveling on foot along a sidewalk!', '"ped" means FOOT (pedal, biped)!'),
  mPart('t3-manual', ['?', 'ual'], 'man', ['man', 'ped', 'vis', 'geo'], 'manual', '? (hand) + done by = operated by hand rather than a motor!', '"man" means HAND (manicure, manuscript, manufacture)!'),
  mPart('t3-scribble', ['?', 'ble'], 'scrib', ['scrib', 'dict', 'rupt', 'port'], 'scribble', '? (write) + quickly = to write or doodle in a hurry!', '"scrib/script" means WRITE (describe, prescription, script)!'),
  mPart('t3-lunar', ['?', 'ar'], 'lun', ['lun', 'sol', 'terr', 'aqu'], 'lunar', '? (moon) + relating to = relating to the Moon (like a lunar eclipse)!', '"lun" means MOON (lunar)!'),
  mPart('t3-solar', ['?', 'ar'], 'sol', ['sol', 'lun', 'terr', 'aer'], 'solar', '? (sun) + relating to = powered by the Sun (solar panels)!', '"sol" means SUN (solar, solstice)!'),
  mPart('t3-terrain', ['?', 'ain'], 'terr', ['terr', 'aqu', 'aer', 'lun'], 'terrain', '? (land/earth) = the physical stretch of ground or hills!', '"terr" means EARTH/LAND (territory, subterranean)!'),
  mPart('t3-dehydrate', ['de', '?'], 'hydrate', ['hydrate', 'thermal', 'graph', 'metric'], 'dehydrate', 'de- (remove) + ? (water) = to lose too much water!', '"hydr" means WATER (hydrant, hydroelectric, hydrate)!'),
  mPart('t3-export', ['ex', '?'], 'port', ['port', 'rupt', 'dict', 'vis'], 'export', 'ex- (out) + ? (carry) = to ship goods OUT to another country!', '"ex-" = out, "port" = carry!'),
  mPart('t3-import', ['im', '?'], 'port', ['port', 'tract', 'struct', 'graph'], 'import', 'im- (in) + ? (carry) = to bring goods IN from another country!', '"im-" = in, "port" = carry!'),
  mPart('t3-interrupt', ['inter', '?'], 'rupt', ['rupt', 'port', 'spect', 'dict'], 'interrupt', 'inter- (between) + ? (break) = to break in while someone is speaking!', '"inter" = between, "rupt" = break!'),
  mPart('t3-subtract', ['sub', '?'], 'tract', ['tract', 'struct', 'port', 'dict'], 'subtract', 'sub- (under/away) + ? (pull) = to pull one number away from another!', '"tract" means PULL (extract, attract, subtract)!'),
  mPart('t3-spectator', ['?', 'ator'], 'spect', ['spect', 'aud', 'dict', 'port'], 'spectator', '? (look/watch) + person = someone watching a game in the stands!', '"spect" means LOOK (inspect, spectacles, respect)!'),
  mPart('t3-dictionary', ['?', 'ionary'], 'dict', ['dict', 'scrib', 'vis', 'port'], 'dictionary', '? (say/word) + book = a book explaining words and how to say them!', '"dict" means SAY/SPEAK (predict, dictate, verdict)!'),
];

// Tier 4 (Trailblazer, Ages 11+): 46 items — Competing-Word Academic Morphology (every distractor builds a real word!)
const TIER4_BANK = [
  mPart('t4-chronology', ['?', 'logy'], 'chrono', ['chrono', 'etymo', 'morpho', 'archaeo'], 'chronology', 'The science of arranging historical events in exact time sequence.', '"chrono" = time, "-logy" = study/order (chronicle, synchronize).'),
  mPart('t4-etymology', ['?', 'logy'], 'etymo', ['etymo', 'chrono', 'eco', 'geo'], 'etymology', 'The study of where words come from and how their meanings evolved.', '"etymo" = true origin of a word; "-logy" = study of.'),
  mPart('t4-obstruct', ['?', 'struct'], 'ob', ['ob', 'de', 'in', 'con'], 'obstruct', 'To block or get directly in the way of a path or view.', '"ob-" = against/in the way; "struct" = build.'),
  mPart('t4-contradict', ['?', 'dict'], 'contra', ['contra', 'pre', 'ver', 'inter'], 'contradict', 'To state the exact opposite of a claim or challenge its truth.', '"contra-" = against, "dict" = speak.'),
  mPart('t4-verdict', ['?', 'dict'], 'ver', ['ver', 'pre', 'contra', 'e'], 'verdict', 'A formal decision or finding announced by a jury at the end of a trial.', '"ver" = truth (verify, veracity), "dict" = speak.'),
  mPart('t4-deport', ['?', 'port'], 'de', ['de', 'im', 'ex', 'trans'], 'deport', 'To officially send or expel someone out of a country.', '"de-" = away from, "port" = carry.'),
  mPart('t4-retrospect', ['?', 'spect'], 'retro', ['retro', 'intro', 'pro', 'in'], 'retrospect', 'Looking back thoughtfully at past events after they have happened.', '"retro-" = backward, "spect" = look.'),
  mPart('t4-introspect', ['?', 'spect'], 'intro', ['intro', 'retro', 'pro', 'circum'], 'introspect', 'Looking inward to examine your own thoughts and feelings.', '"intro-" = inward, "spect" = look.'),
  mPart('t4-circumspect', ['?', 'spect'], 'circum', ['circum', 'retro', 'intro', 'pro'], 'circumspect', 'Carefully looking all around at every risk before acting.', '"circum-" = around, "spect" = look.'),
  mPart('t4-autocracy', ['?', 'cracy'], 'auto', ['auto', 'demo', 'aristo', 'bureau'], 'autocracy', 'A system of government in which one single ruler holds total power.', '"auto-" = self/one, "-cracy" = rule (democracy = people rule).'),
  mPart('t4-aristocracy', ['?', 'cracy'], 'aristo', ['aristo', 'demo', 'auto', 'theo'], 'aristocracy', 'Government led by a hereditary nobility or privileged upper class.', '"aristo-" = best/noble, "-cracy" = rule.'),
  mPart('t4-empathy', ['?', 'pathy'], 'em', ['em', 'sym', 'a', 'anti'], 'empathy', 'Deeply stepping into someone else’s perspective to understand their feelings.', '"em-" = inside, "path" = feeling (compare apathy = no feeling).'),
  mPart('t4-apathy', ['?', 'pathy'], 'a', ['a', 'em', 'sym', 'tele'], 'apathy', 'A complete lack of interest, concern, or emotional engagement.', '"a-" = without, "path" = feeling.'),
  mPart('t4-antipathy', ['?', 'pathy'], 'anti', ['anti', 'sym', 'em', 'a'], 'antipathy', 'A strong, deep-seated feeling of dislike or opposition.', '"anti-" = against, "path" = feeling.'),
  mPart('t4-omnivore', ['?', 'vore'], 'omni', ['omni', 'carni', 'herbi', 'insecti'], 'omnivore', 'An organism whose diet includes both plants and animals.', '"omni-" = all, "vore" = devour/eat.'),
  mPart('t4-preclude', ['?', 'clude'], 'pre', ['pre', 'ex', 'in', 'con'], 'preclude', 'To prevent something from happening or rule it out in advance.', '"pre-" = before, "clude" = close/shut (exclude = shut out).'),
  mPart('t4-seclude', ['?', 'clude'], 'se', ['se', 'ex', 'con', 'pre'], 'seclude', 'To keep someone or something apart in a quiet, isolated place.', '"se-" = apart/aside, "clude" = shut/close.'),
  mPart('t4-deduct', ['?', 'duct'], 'de', ['de', 'con', 'ab', 'in'], 'deduct', 'To subtract an amount or draw a logical conclusion from clues.', '"de-" = down/away, "duct" = lead.'),
  mPart('t4-aqueduct', ['?', 'duct'], 'aque', ['aque', 'con', 'de', 'ab'], 'aqueduct', 'An engineered bridge or channel built to carry water across valleys.', '"aque" = water, "duct" = lead/channel.'),
  mPart('t4-abrupt', ['?', 'rupt'], 'ab', ['ab', 'dis', 'cor', 'e'], 'abrupt', 'Sudden and unexpected, breaking off sharply without warning.', '"ab-" = off/away, "rupt" = break.'),
  mPart('t4-disrupt', ['?', 'rupt'], 'dis', ['dis', 'ab', 'cor', 'e'], 'disrupt', 'To break apart or throw an organized activity into disorder.', '"dis-" = apart, "rupt" = break.'),
  mPart('t4-eject', ['?', 'ject'], 'e', ['e', 're', 'in', 'pro'], 'eject', 'To launch or force something outward from inside a machine.', '"e-" = out, "ject" = throw.'),
  mPart('t4-project', ['?', 'ject'], 'pro', ['pro', 're', 'in', 'e'], 'project', 'To throw an image, voice, or estimate forward into space or the future.', '"pro-" = forward, "ject" = throw.'),
  mPart('t4-omit', ['?', 'mit'], 'o', ['o', 'e', 'sub', 'trans'], 'omit', 'To intentionally or accidentally leave a detail out.', '"o-/ob-" = away/aside, "mit" = send.'),
  mPart('t4-emit', ['?', 'mit'], 'e', ['e', 'o', 'sub', 'trans'], 'emit', 'To send out light, heat, sound, or gas from a source.', '"e-" = out, "mit" = send.'),
  mPart('t4-compel', ['?', 'pel'], 'com', ['com', 'pro', 're', 'ex'], 'compel', 'To forcefully drive or strongly urge someone to take action.', '"com-" = together/strongly, "pel" = drive/push.'),
  mPart('t4-repel', ['?', 'pel'], 're', ['re', 'pro', 'ex', 'com'], 'repel', 'To push back or drive away (like matching magnet poles).', '"re-" = back, "pel" = push/drive.'),
  mPart('t4-suspend', ['?', 'pend'], 'sus', ['sus', 'de', 'ap', 'im'], 'suspend', 'To hang in midair or pause an activity temporarily.', '"sus-" = under/up, "pend" = hang.'),
  mPart('t4-transcript', ['?', 'script'], 'tran', ['tran', 'manu', 'post', 'sub'], 'transcript', 'A written or typed copy recorded across from spoken words.', '"trans-" = across, "script" = written.'),
  mPart('t4-postscript', ['?', 'script'], 'post', ['post', 'manu', 'sub', 'tran'], 'postscript', 'An extra note added at the very end AFTER a letter is signed (P.S.).', '"post-" = after, "script" = written.'),
  mPart('t4-bisect', ['?', 'sect'], 'bi', ['bi', 'dis', 'inter', 'tran'], 'bisect', 'To cut a line segment or angle cleanly into two equal halves.', '"bi-" = two, "sect" = cut.'),
  mPart('t4-dissect', ['?', 'sect'], 'dis', ['dis', 'bi', 'inter', 'tran'], 'dissect', 'To cut apart methodically in order to study internal structure.', '"dis-" = apart, "sect" = cut.'),
  mPart('t4-pseudonym', ['?', 'nym'], 'pseudo', ['pseudo', 'syno', 'anto', 'homo'], 'pseudonym', 'A fictional pen name an author adopts instead of their real name.', '"pseudo-" = false, "nym" = name.'),
  mPart('t4-homonym', ['?', 'nym'], 'homo', ['homo', 'pseudo', 'syno', 'anto'], 'homonym', 'A word that shares the same sound or spelling as another with a different meaning.', '"homo-" = same, "nym" = name.'),
  mPart('t4-heliocentric', ['?', 'centric'], 'helio', ['helio', 'geo', 'ego', 'ethno'], 'heliocentric', 'Astronomical model placing the Sun at the center of planetary orbits.', '"helio-" = sun, "centr" = center.'),
  mPart('t4-geocentric', ['?', 'centric'], 'geo', ['geo', 'helio', 'ego', 'ethno'], 'geocentric', 'The ancient model that mistakenly placed Earth at the center of the universe.', '"geo-" = earth, "centr" = center.'),
  mPart('t4-barometer', ['?', 'meter'], 'baro', ['baro', 'chrono', 'peri', 'thermo'], 'barometer', 'A weather instrument that measures atmospheric air pressure.', '"baro-" = weight/pressure, "meter" = measure.'),
  mPart('t4-chronometer', ['?', 'meter'], 'chrono', ['chrono', 'baro', 'peri', 'thermo'], 'chronometer', 'An ultra-precise timepiece built for ocean navigation.', '"chrono-" = time, "meter" = measure.'),
  mPart('t4-digress', ['?', 'gress'], 'di', ['di', 'pro', 're', 'trans'], 'digress', 'To wander off the main topic temporarily during a speech or essay.', '"di-" = aside/apart, "gress" = step.'),
  mPart('t4-regress', ['?', 'gress'], 're', ['re', 'pro', 'di', 'trans'], 'regress', 'To slip backward to an earlier or less developed stage.', '"re-" = back, "gress" = step.'),
  mPart('t4-recede', ['?', 'cede'], 're', ['re', 'pre', 'con', 'se'], 'recede', 'To gradually pull back or move further away, like ocean waves at low tide.', '"re-" = back, "cede" = go/yield.'),
  mPart('t4-concede', ['?', 'cede'], 'con', ['con', 'pre', 're', 'se'], 'concede', 'To admit that an opponent’s point is true or yield after a contest.', '"con-" = completely, "cede" = yield/give way.'),
  mPart('t4-circumvent', ['?', 'vent'], 'circum', ['circum', 'in', 'pre', 'con'], 'circumvent', 'To cleverly find a way around an obstacle or rule.', '"circum-" = around, "vent" = come/go.'),
  mPart('t4-infer', ['?', 'fer'], 'in', ['in', 'con', 'de', 'trans'], 'infer', 'To draw a reasoned conclusion from clues rather than direct statements.', '"in-" = in, "fer" = bring/carry.'),
  mPart('t4-revoke', ['?', 'voke'], 're', ['re', 'pro', 'e', 'in'], 'revoke', 'To officially cancel or take back a permit, privilege, or law.', '"re-" = back, "vok" = call.'),
  mPart('t4-symbiotic', ['?', 'biotic'], 'sym', ['sym', 'anti', 'pro', 'a'], 'symbiotic', 'Describing two different species living closely together in mutual interaction.', '"sym-" = together, "bio" = life.'),
];

function buildPromptForItem(item, tier) {
  if (item.kind === 'rhyme') return 'Find the rhyming word!';
  if (item.kind === 'vowel') return 'Pick the missing middle vowel!';
  if (item.kind === 'digraph') return 'Pick the two-letter sound team!';
  if (tier === 1) return 'Pick the starting letter to build the word!';
  return 'Snap the right word piece in place!';
}

export function generateSession(tier = 1, profile = null) {
  const bank = tier === 1 ? TIER1_BANK : tier === 2 ? TIER2_BANK : tier === 3 ? TIER3_BANK : TIER4_BANK;
  const scopeKey = `word-builder:${tier}`;
  let chosen;

  if (profile) {
    chosen = selectSpacedWords(bank, profile, 5, (it) => `wb:${it.id}`);
  } else {
    const recent = getRecentPuzzleSigs(null, scopeKey);
    const fresh = bank.filter((it) => !recent.includes(it.id));
    const pool = fresh.length >= 5 ? fresh : bank;
    chosen = shuffle(pool).slice(0, 5);
    recordRecentPuzzleSigs(null, scopeKey, chosen.map((it) => it.id), 25);
  }

  return chosen.map((item) => {
    const shuffledOptions = shuffle(item.options);
    return {
      ...item,
      tier,
      wordKey: `wb:${item.id}`,
      shuffledOptions,
      prompt: buildPromptForItem(item, tier),
      speakPrompt:
        item.kind === 'rhyme'
          ? `${item.clue} Options are: ${shuffledOptions.join(', ')}.`
          : `${item.clue} Which piece completes the word?`,
      strategyTip: item.tip,
    };
  });
}

function getWordFamilyCousins(round) {
  if (!round || round.tier < 3 || round.kind !== 'part') return [];
  const fullLow = (round.fullWord || '').toLowerCase();
  const seen = new Set([fullLow]);
  const cousins = [];

  // Extract parenthetical cousin examples from strategy tip (e.g., "(chronicle, synchronize)")
  const parenMatches = (round.tip || '').match(/\(([^)]+)\)/g) || [];
  for (const grp of parenMatches) {
    const inner = grp.slice(1, -1);
    if (/[=→+]/.test(inner)) continue;
    for (const raw of inner.split(/[,;]/)) {
      const clean = raw.trim().replace(/[^a-zA-Z-]/g, '');
      if (clean.length >= 4 && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        cousins.push(clean);
      }
    }
  }

  // For Tier 4 competing-word items, all 3 distractor prefixes also form real sibling words on the same root!
  if (round.tier === 4 && Array.isArray(round.parts) && round.parts.length === 2 && round.parts[0] === '?') {
    const stem = round.parts[1].replace(/^-/, '');
    for (const opt of round.options || []) {
      const built = opt.replace(/-$/, '') + stem;
      if (built.length >= 4 && !seen.has(built.toLowerCase())) {
        seen.add(built.toLowerCase());
        cousins.push(built);
      }
    }
  }

  return cousins.slice(0, 4);
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
        <span class="analogy-link-label">rhymes with</span>
        <span class="morpheme-tile blank" id="wb-blank">?</span>
      </div>
      <p class="word-clue">${round.clue}</p>
    `;
  } else {
    const tilesHtml = round.parts
      .map((part, idx) => {
        const tile = `<span class="morpheme-tile ${part === '?' ? 'blank' : ''}">${part}</span>`;
        const sep = idx < round.parts.length - 1 ? '<span class="morpheme-plus">+</span>' : '';
        return tile + sep;
      })
      .join('');
    stage.innerHTML = `
      ${artHtml}
      <div class="morpheme-equation">${tilesHtml}</div>
      <p class="word-clue">${round.clue}</p>
      <div id="wb-family-slot"></div>
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
          blank.classList.add('filled-answer');
        }
        const cousins = getWordFamilyCousins(round);
        const famSlot = stage.querySelector('#wb-family-slot');
        if (famSlot && cousins.length >= 2) {
          famSlot.innerHTML = `
            <div class="word-family-bar animate-pop">
              <span class="word-family-label">Word Cousins:</span>
              ${cousins.map((w) => `<span class="word-family-chip">${w}</span>`).join('')}
            </div>
          `;
        }
        if (callbacks.profile) {
          recordWordAttempt(callbacks.profile, round.wordKey, !hadMistake);
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
