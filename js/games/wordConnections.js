/**
 * Word Connections (WordCraft Pillar — Categories, Opposites, Shades of Meaning & Analogies)
 * - Distinct action headers (zero title/card text duplication!).
 * - Intuitive 2-row Visual Analogy Bridge cards ([Author] -> [Book] / just like / [Composer] -> [?])
 *   instead of cryptic ":" vs "::" notation.
 */

import { pickMany, shuffle } from './utils.js';

export const meta = {
  id: 'word-connections',
  title: 'Word Connections',
  pillar: 'wordcraft',
  pillarLabel: 'WordCraft',
  shortDesc: 'Spot categories, opposites, word pairs, and order words by shades of meaning.',
  scienceNote: 'Semantic networks & verbal analogies deepen vocabulary and reading comprehension.',
  timed: false,
};

const TIER1_ITEMS = [
  {
    kind: 'choice',
    subkind: 'opposite',
    badge: 'Opposites',
    prompt: 'Find the opposite word!',
    targetWord: 'HOT',
    options: ['Cold', 'Warm', 'Sunny', 'Red'],
    answer: 'Cold',
    tip: 'Hot like cocoa — the opposite is chilly like ice cream!',
  },
  {
    kind: 'choice',
    subkind: 'opposite',
    badge: 'Opposites',
    prompt: 'Find the opposite word!',
    targetWord: 'FAST',
    options: ['Slow', 'Quick', 'Tall', 'Loud'],
    answer: 'Slow',
    tip: 'A cheetah is fast — a turtle is the opposite!',
  },
  {
    kind: 'choice',
    subkind: 'opposite',
    badge: 'Opposites',
    prompt: 'Find the opposite word!',
    targetWord: 'DAY',
    options: ['Night', 'Morning', 'Cloud', 'Play'],
    answer: 'Night',
    tip: 'The sun shines in the day; stars shine at ___!',
  },
  {
    kind: 'choice',
    subkind: 'opposite',
    badge: 'Opposites',
    prompt: 'Find the opposite word!',
    targetWord: 'FULL',
    options: ['Empty', 'Heavy', 'Big', 'Open'],
    answer: 'Empty',
    tip: 'When you finish your cup of juice, it is no longer full — it is ___!',
  },
  {
    kind: 'choice',
    subkind: 'odd',
    badge: 'Odd One Out',
    prompt: 'Spot the one that does NOT belong!',
    cardHint: '3 belong together · 1 does not',
    options: ['School Bus', 'Apple', 'Banana', 'Strawberry'],
    answer: 'School Bus',
    tip: 'Three of these are fruits you can eat — one is a vehicle!',
  },
  {
    kind: 'choice',
    subkind: 'odd',
    badge: 'Odd One Out',
    prompt: 'Spot the one that does NOT belong!',
    cardHint: '3 belong together · 1 does not',
    options: ['Pillow', 'Lion', 'Elephant', 'Giraffe'],
    answer: 'Pillow',
    tip: 'Three of these are animals — one goes on your bed!',
  },
  {
    kind: 'choice',
    subkind: 'odd',
    badge: 'Odd One Out',
    prompt: 'Spot the one that does NOT belong!',
    cardHint: '3 belong together · 1 does not',
    options: ['Snowman', 'Fork', 'Spoon', 'Plate'],
    answer: 'Snowman',
    tip: 'Three of these belong on a dinner table!',
  },
];

const TIER2_ITEMS = [
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Bird', 'Fly'],
    pairBLeft: 'Fish',
    options: ['Swim', 'Bark', 'Climb', 'Nest'],
    answer: 'Swim',
    tip: 'Ask: how does a bird move? It flies! How does a fish move?',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Puppy', 'Dog'],
    pairBLeft: 'Kitten',
    options: ['Cat', 'Mouse', 'Barn', 'Milk'],
    answer: 'Cat',
    tip: 'A puppy grows up into a dog — what does a kitten grow up into?',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Winter', 'Cold'],
    pairBLeft: 'Summer',
    options: ['Hot', 'Snow', 'Coat', 'Leaf'],
    answer: 'Hot',
    tip: 'Winter weather is cold — what is summer weather like?',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Glove', 'Hand'],
    pairBLeft: 'Sock',
    options: ['Foot', 'Hat', 'Head', 'Coat'],
    answer: 'Foot',
    tip: 'You put a glove on your hand; where do you put a sock?',
  },
  {
    kind: 'choice',
    subkind: 'synonym',
    badge: 'Same Meaning',
    prompt: 'Find the word with almost the same meaning!',
    targetWord: 'ENORMOUS',
    options: ['Gigantic', 'Tiny', 'Gentle', 'Bumpy'],
    answer: 'Gigantic',
    tip: 'An enormous whale is super, super big!',
  },
  {
    kind: 'choice',
    subkind: 'opposite',
    badge: 'Opposite',
    prompt: 'Find the opposite word!',
    targetWord: 'ANCIENT',
    options: ['Modern', 'Rusty', 'Golden', 'Quiet'],
    answer: 'Modern',
    tip: 'Ancient means very old (like pyramids); the opposite means brand-new or current!',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    prompt: 'Arrange the words in order!',
    directionLabel: 'Quietest → Loudest',
    ordered: ['Whisper', 'Speak', 'Shout'],
    labels: ['1. Quietest', '2. Medium', '3. Loudest'],
    tip: 'Start with the softest voice, then normal talking, then the biggest voice!',
  },
];

const TIER3_ITEMS = [
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    prompt: 'Arrange the words in order!',
    directionLabel: 'Coolest → Coldest',
    ordered: ['Cool', 'Chilly', 'Freezing'],
    labels: ['1. Mild', '2. Stronger', '3. Most Intense'],
    tip: 'Think of a crisp autumn breeze → needing a jacket → turning water into ice!',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    prompt: 'Arrange the words in order!',
    directionLabel: 'Slowest → Fastest',
    ordered: ['Stroll', 'Jog', 'Sprint'],
    labels: ['1. Slowest', '2. Medium', '3. Fastest'],
    tip: 'A stroll is a relaxed walk; a sprint is full racing speed!',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    prompt: 'Arrange the words in order!',
    directionLabel: 'Smallest → Biggest',
    ordered: ['Tiny', 'Average', 'Colossal'],
    labels: ['1. Smallest', '2. Middle', '3. Biggest'],
    tip: 'Colossal means giant-sized, like a skyscraper or blue whale!',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Author', 'Book'],
    pairBLeft: 'Composer',
    options: ['Symphony', 'Library', 'Violin', 'Stage'],
    answer: 'Symphony',
    tip: 'An author creates a book — what finished work does a composer create?',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Compass', 'Direction'],
    pairBLeft: 'Thermometer',
    options: ['Temperature', 'Weather', 'Mercury', 'Winter'],
    answer: 'Temperature',
    tip: 'A compass tells you direction — what exact thing does a thermometer measure?',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Petal', 'Flower'],
    pairBLeft: 'Chapter',
    options: ['Book', 'Page', 'Storyteller', 'Cover'],
    answer: 'Book',
    tip: 'Part-to-whole relationship! A petal is one part of a flower; a chapter is one part of a ___!',
  },
  {
    kind: 'choice',
    subkind: 'sentence',
    badge: 'Precise Word',
    prompt: 'Choose the word that fits best!',
    sentenceBefore: 'The scientist was ',
    sentenceAfter: ' to check every measurement twice.',
    options: ['Meticulous', 'Careless', 'Drowsy', 'Boastful'],
    answer: 'Meticulous',
    tip: 'Meticulous means paying super careful attention to every tiny detail!',
  },
];

const TIER4_ITEMS = [
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    prompt: 'Arrange the words in order!',
    directionLabel: 'Calmest → Most Worried',
    ordered: ['Uneasy', 'Anxious', 'Frantic'],
    labels: ['1. Mild', '2. Moderate', '3. Intense'],
    tip: 'Uneasy is a slight flutter; frantic means overwhelmed in panic.',
  },
  {
    kind: 'ladder',
    badge: 'Shades of Meaning',
    prompt: 'Arrange the words in order!',
    directionLabel: 'Least → Most Interested',
    ordered: ['Curious', 'Eager', 'Obsessed'],
    labels: ['1. Mild', '2. Strong', '3. Extreme'],
    tip: 'Curious asks a question; eager cannot wait; obsessed thinks of nothing else.',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Drought', 'Rain'],
    pairBLeft: 'Famine',
    options: ['Food', 'Desert', 'Harvest', 'Storm'],
    answer: 'Food',
    tip: 'Relationship = lack of! A drought is a severe lack of rain; a famine is a severe lack of ___.',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Blueprint', 'Building'],
    pairBLeft: 'Recipe',
    options: ['Dish', 'Kitchen', 'Oven', 'Chef'],
    answer: 'Dish',
    tip: 'A blueprint is the plan for making a building; a recipe is the plan for making a ___.',
  },
  {
    kind: 'choice',
    subkind: 'definition',
    badge: 'Precise Word',
    prompt: 'Which word matches this meaning?',
    definition: 'Able to recover quickly from setbacks or tough moments.',
    options: ['Resilient', 'Fragile', 'Reluctant', 'Indifferent'],
    answer: 'Resilient',
    tip: 'Think of a spring bouncing back — resilient means bouncing back strong!',
  },
  {
    kind: 'choice',
    subkind: 'analogy',
    badge: 'Word Pair',
    prompt: 'Complete the matching word pair!',
    pairA: ['Telescope', 'Distant'],
    pairBLeft: 'Microscope',
    options: ['Tiny', 'Bright', 'Heavy', 'Ancient'],
    answer: 'Tiny',
    tip: 'A telescope helps us see distant things; a microscope helps us see ___ things.',
  },
];

function buildSpeakText(item, shuffledOptions) {
  if (item.kind === 'ladder') {
    return `Arrange the words from ${item.directionLabel.replace('→', 'to')}. The words are: ${item.ordered.join(', ')}.`;
  }
  if (item.subkind === 'analogy') {
    return `${item.pairA[0]} goes with ${item.pairA[1]}, just like ${item.pairBLeft} goes with what? Choices: ${shuffledOptions.join(', ')}.`;
  }
  if (item.subkind === 'opposite') {
    return `What is the opposite of ${item.targetWord}? Choices: ${shuffledOptions.join(', ')}.`;
  }
  if (item.subkind === 'synonym') {
    return `Which word means almost the same as ${item.targetWord}? Choices: ${shuffledOptions.join(', ')}.`;
  }
  if (item.subkind === 'odd') {
    return `Which word does not belong with the others? Choices: ${shuffledOptions.join(', ')}.`;
  }
  if (item.subkind === 'sentence') {
    return `Choose the word that fits best: ${item.sentenceBefore} blank ${item.sentenceAfter}. Choices: ${shuffledOptions.join(', ')}.`;
  }
  return `Which word means: ${item.definition} Choices: ${shuffledOptions.join(', ')}.`;
}

export function generateSession(tier = 1) {
  const bank = tier === 1 ? TIER1_ITEMS : tier === 2 ? TIER2_ITEMS : tier === 3 ? TIER3_ITEMS : TIER4_ITEMS;
  return pickMany(bank, 5).map((item) => {
    if (item.kind === 'ladder') {
      return {
        ...item,
        shuffledWords: shuffle(item.ordered),
        speakPrompt: buildSpeakText(item, []),
        strategyTip: item.tip,
      };
    }
    const shuffledOptions = shuffle(item.options);
    return {
      ...item,
      shuffledOptions,
      speakPrompt: buildSpeakText(item, shuffledOptions),
      strategyTip: item.tip,
    };
  });
}

function renderChoiceCardBody(round) {
  if (round.subkind === 'analogy') {
    return `
      <div class="analogy-bridge" aria-label="${round.pairA[0]} goes with ${round.pairA[1]}, just like ${round.pairBLeft} goes with mystery word">
        <div class="analogy-row">
          <span class="analogy-word">${round.pairA[0]}</span>
          <span class="analogy-arrow" aria-hidden="true">→</span>
          <span class="analogy-word pair-mate">${round.pairA[1]}</span>
        </div>
        <div class="analogy-link-label">just like</div>
        <div class="analogy-row">
          <span class="analogy-word">${round.pairBLeft}</span>
          <span class="analogy-arrow" aria-hidden="true">→</span>
          <span class="analogy-word blank" id="wc-blank">?</span>
        </div>
      </div>
    `;
  }

  if (round.subkind === 'opposite' || round.subkind === 'synonym') {
    const sym = round.subkind === 'opposite' ? '⇄' : '≈';
    return `
      <div class="analogy-row">
        <span class="analogy-word">${round.targetWord}</span>
        <span class="analogy-arrow" aria-hidden="true">${sym}</span>
        <span class="analogy-word blank" id="wc-blank">?</span>
      </div>
    `;
  }

  if (round.subkind === 'sentence') {
    return `
      <p class="word-sentence">
        ${round.sentenceBefore}<span class="inline-blank" id="wc-blank">______</span>${round.sentenceAfter}
      </p>
    `;
  }

  if (round.subkind === 'definition') {
    return `<p class="word-sentence">“${round.definition}”</p>`;
  }

  return `<p class="word-clue">${round.cardHint}</p>`;
}

function buildSolvedMessage(round) {
  if (round.subkind === 'analogy') {
    return `Great connection! ${round.pairA[0]} → ${round.pairA[1]}, just like ${round.pairBLeft} → ${round.answer}!`;
  }
  if (round.subkind === 'opposite') {
    return `Yes! ${round.answer} is the opposite of ${round.targetWord.toLowerCase()}!`;
  }
  if (round.subkind === 'synonym') {
    return `Spot on! ${round.answer} means almost the same as ${round.targetWord.toLowerCase()}!`;
  }
  if (round.subkind === 'sentence') {
    return `Great word choice! ${round.tip}`;
  }
  if (round.subkind === 'odd') {
    return `Nice catch! ${round.answer} is the odd one out — ${round.tip}`;
  }
  return `Spot on! ${round.answer} — ${round.tip}`;
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
    ${renderChoiceCardBody(round)}
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
        const blank = card.querySelector('#wc-blank');
        if (blank) {
          blank.textContent = opt;
          blank.classList.remove('blank');
          blank.classList.add('filled-answer');
        }
        callbacks.onCorrect(!hadMistake, buildSolvedMessage(round));
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
        <div class="ladder-direction">${round.directionLabel}</div>
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
