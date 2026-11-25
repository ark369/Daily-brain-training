/**
 * Word Connections (WordCraft Pillar — Categories, Opposites, Shades of Meaning & Analogies)
 * - Tier 1 (Sprout): Opposites & "Which one doesn't belong?" with audio read-aloud.
 * - Tier 2 (Explorer): Synonyms/Antonyms & classic analogies (Bird : Fly :: Fish : Swim).
 * - Tier 3 (Challenger): Interactive "Shades of Meaning" intensity ladder + rich analogies.
 * - Tier 4 (Trailblazer): Nuanced academic vocabulary ladders & multi-relation analogies.
 */

import { pickMany, shuffle } from './utils.js';

export const meta = {
  id: 'word-connections',
  title: 'Word Connections',
  pillar: 'wordcraft',
  pillarLabel: 'WordCraft',
  shortDesc: 'Spot categories, opposites, analogies, and order words by shades of meaning.',
  scienceNote: 'Semantic networks & verbal analogies deepen vocabulary and reading comprehension.',
  timed: false,
};

const TIER1_ITEMS = [
  {
    kind: 'choice',
    badge: 'Opposites',
    clue: 'What is the opposite of HOT?',
    options: ['Cold', 'Warm', 'Sunny', 'Red'],
    answer: 'Cold',
    tip: 'Hot like cocoa — the opposite is chilly like ice cream!',
  },
  {
    kind: 'choice',
    badge: 'Opposites',
    clue: 'What is the opposite of FAST?',
    options: ['Slow', 'Quick', 'Tall', 'Loud'],
    answer: 'Slow',
    tip: 'A cheetah is fast — a turtle is the opposite!',
  },
  {
    kind: 'choice',
    badge: 'Opposites',
    clue: 'What is the opposite of DAY?',
    options: ['Night', 'Morning', 'Cloud', 'Play'],
    answer: 'Night',
    tip: 'The sun shines in the day; stars shine at ___!',
  },
  {
    kind: 'choice',
    badge: 'Opposites',
    clue: 'What is the opposite of FULL?',
    options: ['Empty', 'Heavy', 'Big', 'Open'],
    answer: 'Empty',
    tip: 'When you finish your cup of juice, it is no longer full — it is ___!',
  },
  {
    kind: 'choice',
    badge: 'Odd One Out',
    clue: 'Which one does NOT belong with the others?',
    options: ['School Bus', 'Apple', 'Banana', 'Strawberry'],
    answer: 'School Bus',
    tip: 'Three of these are fruits you can eat — one is a vehicle!',
  },
  {
    kind: 'choice',
    badge: 'Odd One Out',
    clue: 'Which one does NOT belong with the others?',
    options: ['Pillow', 'Lion', 'Elephant', 'Giraffe'],
    answer: 'Pillow',
    tip: 'Three of these are animals — one goes on your bed!',
  },
  {
    kind: 'choice',
    badge: 'Odd One Out',
    clue: 'Which one does NOT belong with the others?',
    options: ['Snowman', 'Fork', 'Spoon', 'Plate'],
    answer: 'Snowman',
    tip: 'Three of these belong on a dinner table!',
  },
];

const TIER2_ITEMS = [
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Bird is to FLY as Fish is to ___',
    options: ['Swim', 'Bark', 'Climb', 'Nest'],
    answer: 'Swim',
    tip: 'Ask: how does a bird move? It flies! How does a fish move?',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Puppy is to DOG as Kitten is to ___',
    options: ['Cat', 'Mouse', 'Barn', 'Milk'],
    answer: 'Cat',
    tip: 'A puppy grows up into a dog — what does a kitten grow up into?',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Winter is to COLD as Summer is to ___',
    options: ['Hot', 'Snow', 'Coat', 'Leaf'],
    answer: 'Hot',
    tip: 'Winter weather is cold — what is summer weather like?',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Glove is to HAND as Sock is to ___',
    options: ['Foot', 'Hat', 'Head', 'Coat'],
    answer: 'Foot',
    tip: 'You put a glove on your hand; where do you put a sock?',
  },
  {
    kind: 'choice',
    badge: 'Synonym',
    clue: 'Which word means almost the same as ENORMOUS?',
    options: ['Gigantic', 'Tiny', 'Gentle', 'Bumpy'],
    answer: 'Gigantic',
    tip: 'An enormous whale is super, super big!',
  },
  {
    kind: 'choice',
    badge: 'Antonym',
    clue: 'Which word is the opposite of ANCIENT?',
    options: ['Modern', 'Rusty', 'Golden', 'Quiet'],
    answer: 'Modern',
    tip: 'Ancient means very old (like pyramids); the opposite means brand-new or current!',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    clue: 'Tap the words in order from QUIETEST to LOUDEST:',
    ordered: ['Whisper', 'Speak', 'Shout'],
    labels: ['1. Quietest', '2. Medium', '3. Loudest'],
    tip: 'Start with the softest voice, then normal talking, then the biggest voice!',
  },
];

const TIER3_ITEMS = [
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    clue: 'Order from COOLEST to COLDEST:',
    ordered: ['Cool', 'Chilly', 'Freezing'],
    labels: ['1. Mild', '2. Stronger', '3. Most Intense'],
    tip: 'Think of a crisp autumn breeze → needing a jacket → turning water into ice!',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    clue: 'Order from SLOWEST to FASTEST:',
    ordered: ['Stroll', 'Jog', 'Sprint'],
    labels: ['1. Slowest', '2. Medium', '3. Fastest'],
    tip: 'A stroll is a relaxed walk; a sprint is full racing speed!',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    clue: 'Order from SMALLEST to BIGGEST:',
    ordered: ['Tiny', 'Average', 'Colossal'],
    labels: ['1. Smallest', '2. Middle', '3. Biggest'],
    tip: 'Colossal means giant-sized, like a skyscraper or blue whale!',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Author : Book :: Composer : ___',
    options: ['Symphony', 'Library', 'Violin', 'Stage'],
    answer: 'Symphony',
    tip: 'An author creates a book — what finished work does a composer create?',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Compass : Direction :: Thermometer : ___',
    options: ['Temperature', 'Weather', 'Mercury', 'Winter'],
    answer: 'Temperature',
    tip: 'A compass tells you direction — what exact thing does a thermometer measure?',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Petal : Flower :: Chapter : ___',
    options: ['Book', 'Page', 'Storyteller', 'Cover'],
    answer: 'Book',
    tip: 'Part-to-whole relationship! A petal is one part of a flower; a chapter is one part of a ___!',
  },
  {
    kind: 'choice',
    badge: 'Precise Word',
    clue: 'Which word best fits: "The scientist was ___ to check every measurement twice"?',
    options: ['Meticulous', 'Careless', 'Drowsy', 'Boastful'],
    answer: 'Meticulous',
    tip: 'Meticulous means paying super careful attention to every tiny detail!',
  },
];

const TIER4_ITEMS = [
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    clue: 'Order from CALMEST to MOST WORRIED:',
    ordered: ['Uneasy', 'Anxious', 'Frantic'],
    labels: ['1. Mild', '2. Moderate', '3. Intense'],
    tip: 'Uneasy is a slight flutter; frantic means overwhelmed in panic.',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    clue: 'Order from LEAST to MOST INTERESTED:',
    ordered: ['Curious', 'Eager', 'Obsessed'],
    labels: ['1. Mild', '2. Strong', '3. Extreme'],
    tip: 'Curious asks a question; eager cannot wait; obsessed thinks of nothing else.',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Drought : Rain :: Famine : ___',
    options: ['Food', 'Desert', 'Harvest', 'Storm'],
    answer: 'Food',
    tip: 'Relationship = lack of! A drought is a severe lack of rain; a famine is a severe lack of ___.',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Blueprint : Building :: Recipe : ___',
    options: ['Dish', 'Kitchen', 'Oven', 'Chef'],
    answer: 'Dish',
    tip: 'A blueprint is the plan for making a building; a recipe is the plan for making a ___.',
  },
  {
    kind: 'choice',
    badge: 'Precise Word',
    clue: 'Which word means "able to recover quickly from setbacks"?',
    options: ['Resilient', 'Fragile', 'Reluctant', 'Indifferent'],
    answer: 'Resilient',
    tip: 'Think of a spring bouncing back — resilient means bouncing back strong!',
  },
  {
    kind: 'choice',
    badge: 'Analogy',
    clue: 'Telescope : Distant :: Microscope : ___',
    options: ['Tiny', 'Bright', 'Heavy', 'Ancient'],
    answer: 'Tiny',
    tip: 'A telescope helps us see distant things; a microscope helps us see ___ things.',
  },
];

export function generateSession(tier = 1) {
  const bank = tier === 1 ? TIER1_ITEMS : tier === 2 ? TIER2_ITEMS : tier === 3 ? TIER3_ITEMS : TIER4_ITEMS;
  return pickMany(bank, 5).map((item) => {
    if (item.kind === 'ladder') {
      return {
        ...item,
        shuffledWords: shuffle(item.ordered),
        prompt: item.clue,
        speakPrompt: `${item.clue} The words are ${item.ordered.join(', ')}.`,
        strategyTip: item.tip,
      };
    }
    const shuffledOptions = shuffle(item.options);
    return {
      ...item,
      shuffledOptions,
      prompt: item.clue,
      speakPrompt: `${item.clue.replaceAll('___', 'blank').replaceAll('::', 'as').replaceAll(':', 'is to')}. Choices: ${shuffledOptions.join(', ')}.`,
      strategyTip: item.tip,
    };
  });
}

export function renderRound(container, round, callbacks) {
  if (round.kind === 'ladder') {
    renderLadderRound(container, round, callbacks);
    return;
  }

  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '18px';
  wrap.style.width = '100%';

  const card = document.createElement('div');
  card.className = 'word-stage-card';
  card.innerHTML = `
    <span class="game-pillar-tag wordcraft">${round.badge}</span>
    <div style="font-family:var(--font-display);font-size:1.35rem;font-weight:600;">${round.clue}</div>
  `;

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
        callbacks.onCorrect(!hadMistake, `Great connection! ${round.tip}`);
      } else {
        hadMistake = true;
        btn.classList.add('is-wrong');
        btn.disabled = true;
        callbacks.onRetry(`Think about the link: ${round.tip}`);
      }
    });
    grid.appendChild(btn);
  });

  wrap.appendChild(card);
  wrap.appendChild(grid);
  container.appendChild(wrap);
}

function renderLadderRound(container, round, callbacks) {
  let picked = [];
  let solved = false;
  let hadMistake = false;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '18px';
  wrap.style.width = '100%';
  container.appendChild(wrap);

  function render() {
    wrap.innerHTML = `
      <div class="word-stage-card">
        <span class="game-pillar-tag wordcraft">${round.badge}</span>
        <div class="shade-ladder">
          ${round.labels
            .map(
              (lbl, idx) => `
              <div class="shade-slot ${picked[idx] ? 'filled' : ''}">
                <small>${lbl}</small>
                <span>${picked[idx] || '—'}</span>
              </div>
              ${idx < round.labels.length - 1 ? '<span class="morpheme-plus">→</span>' : ''}
            `
            )
            .join('')}
        </div>
      </div>
      <div class="choice-grid cols-3" id="ladder-words"></div>
      <div class="rotate-controls">
        <button type="button" class="btn btn-secondary" id="btn-ladder-clear" ${picked.length === 0 || solved ? 'disabled' : ''}>Reset Order</button>
        <button type="button" class="btn btn-primary" id="btn-ladder-check" ${picked.length < round.ordered.length || solved ? 'disabled' : ''}>Check Ladder!</button>
      </div>
    `;

    const wordsBox = wrap.querySelector('#ladder-words');
    round.shuffledWords.forEach((word) => {
      const used = picked.includes(word);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = word;
      btn.disabled = used || solved;
      btn.style.opacity = used ? '0.42' : '1';
      btn.addEventListener('click', () => {
        if (solved || used) return;
        callbacks.playClick();
        picked.push(word);
        render();
      });
      wordsBox.appendChild(btn);
    });

    wrap.querySelector('#btn-ladder-clear').addEventListener('click', () => {
      callbacks.playClick();
      picked = [];
      render();
    });

    wrap.querySelector('#btn-ladder-check').addEventListener('click', () => {
      if (solved) return;
      const isRight = round.ordered.every((w, i) => picked[i] === w);
      if (isRight) {
        solved = true;
        render();
        callbacks.onCorrect(
          !hadMistake,
          `Spot on! ${round.ordered.join(' → ')} climbs smoothly in strength.`
        );
      } else {
        hadMistake = true;
        picked = [];
        render();
        callbacks.onRetry(`Almost! Resetting the ladder so you can try again — ${round.tip}`);
      }
    });
  }

  render();
}
