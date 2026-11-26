/**
 * Word Connections (WordCraft Pillar — Opposites, Categories, Visual Analogies,
 * Shades of Meaning Ladders, Homophones, Idioms & Precision Vocabulary)
 * - 44–46 curated items per tier (~180 total) wired to persistent spaced-retrieval mastery!
 * - Intuitive 2-row Visual Analogy Bridges (never cryptic ":" vs "::" notation).
 */

import { shuffle } from './utils.js';
import { selectSpacedWords, recordWordAttempt, getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

export const meta = {
  id: 'word-connections',
  title: 'Word Connections',
  pillar: 'wordcraft',
  pillarLabel: 'WordCraft',
  shortDesc: 'Spot categories, opposites, word pairs, idioms, and shades of meaning.',
  scienceNote: 'Semantic networks & spaced verbal analogies deepen vocabulary and reading comprehension.',
  timed: false,
};

// Compact builders keep 180 items readable & strictly consistent
const mOpp = (id, targetWord, answer, distractors, tip) => ({
  id,
  kind: 'choice',
  subkind: 'opposite',
  badge: 'Opposites',
  prompt: 'Find the opposite word!',
  targetWord,
  options: [answer, ...distractors],
  answer,
  tip,
});

const mSyn = (id, targetWord, answer, distractors, tip) => ({
  id,
  kind: 'choice',
  subkind: 'synonym',
  badge: 'Same Meaning',
  prompt: 'Find the word with almost the same meaning!',
  targetWord,
  options: [answer, ...distractors],
  answer,
  tip,
});

const mOdd = (id, answer, groupItems, tip) => ({
  id,
  kind: 'choice',
  subkind: 'odd',
  badge: 'Odd One Out',
  prompt: 'Spot the one that does NOT belong!',
  cardHint: '3 belong together · 1 does not',
  options: [answer, ...groupItems],
  answer,
  tip,
});

const mAnalogy = (id, a1, a2, b1, answer, distractors, tip) => ({
  id,
  kind: 'choice',
  subkind: 'analogy',
  badge: 'Word Pair',
  prompt: 'Complete the matching word pair!',
  pairA: [a1, a2],
  pairBLeft: b1,
  options: [answer, ...distractors],
  answer,
  tip,
});

const mLadder = (id, directionLabel, ordered, labels, tip) => ({
  id,
  kind: 'ladder',
  badge: 'Shades of Meaning',
  prompt: 'Arrange the words in order!',
  directionLabel,
  ordered,
  labels,
  tip,
});

const mSent = (id, badge, sentenceBefore, sentenceAfter, answer, distractors, tip) => ({
  id,
  kind: 'choice',
  subkind: 'sentence',
  badge,
  prompt: 'Choose the word that fits best!',
  sentenceBefore,
  sentenceAfter,
  options: [answer, ...distractors],
  answer,
  tip,
});

const mDef = (id, badge, prompt, definition, answer, distractors, tip) => ({
  id,
  kind: 'choice',
  subkind: 'definition',
  badge,
  prompt,
  definition,
  options: [answer, ...distractors],
  answer,
  tip,
});

// Tier 1 (Sprout, Ages 5–6): 44 items — Opposites (18), Odd One Out (16), Simple Word Pairs (10)
const TIER1_ITEMS = [
  // Opposites (18)
  mOpp('wc1-hot', 'HOT', 'Cold', ['Warm', 'Sunny', 'Red'], 'Hot like cocoa — the opposite is chilly like ice cream!'),
  mOpp('wc1-fast', 'FAST', 'Slow', ['Quick', 'Tall', 'Loud'], 'A cheetah is fast — a turtle is the opposite!'),
  mOpp('wc1-day', 'DAY', 'Night', ['Morning', 'Cloud', 'Play'], 'The sun shines in the day; stars shine at night!'),
  mOpp('wc1-full', 'FULL', 'Empty', ['Heavy', 'Big', 'Open'], 'When you finish your cup of juice, it is no longer full — it is empty!'),
  mOpp('wc1-big', 'BIG', 'Small', ['Giant', 'Round', 'Soft'], 'An elephant is big — a ladybug is small!'),
  mOpp('wc1-happy', 'HAPPY', 'Sad', ['Glad', 'Funny', 'Silly'], 'Smiling means happy; crying means the opposite!'),
  mOpp('wc1-up', 'UP', 'Down', ['High', 'Over', 'Jump'], 'Balloons float up; rain drops fall down!'),
  mOpp('wc1-open', 'OPEN', 'Closed', ['Wide', 'Door', 'Inside'], 'When you shut the door, it is closed!'),
  mOpp('wc1-wet', 'WET', 'Dry', ['Rainy', 'Splash', 'Cold'], 'A towel turns wet hands dry!'),
  mOpp('wc1-loud', 'LOUD', 'Quiet', ['Noisy', 'Boom', 'Drum'], 'A drum is loud; a whisper is quiet!'),
  mOpp('wc1-hard', 'HARD', 'Soft', ['Rock', 'Flat', 'Heavy'], 'A brick is hard; a fluffy pillow is soft!'),
  mOpp('wc1-light', 'LIGHT', 'Heavy', ['Feather', 'Bright', 'Fast'], 'A feather is light; a big boulder is heavy!'),
  mOpp('wc1-tall', 'TALL', 'Short', ['Long', 'High', 'Tree'], 'A giraffe is tall; a mouse is short!'),
  mOpp('wc1-old', 'OLD', 'New', ['Gray', 'Past', 'Slow'], 'A brand-new shiny bike is the opposite of an old one!'),
  mOpp('wc1-clean', 'CLEAN', 'Dirty', ['Soap', 'Bright', 'Neat'], 'Playing in mud puddles makes clean boots dirty!'),
  mOpp('wc1-sweet', 'SWEET', 'Sour', ['Candy', 'Warm', 'Yummy'], 'Strawberries are sweet; lemons are sour!'),
  mOpp('wc1-push', 'PUSH', 'Pull', ['Roll', 'Stop', 'Kick'], 'You push a swing forward and pull a wagon behind you!'),
  mOpp('wc1-awake', 'AWAKE', 'Asleep', ['Play', 'Sunny', 'Ready'], 'In the morning you are awake; at bedtime you fall asleep!'),

  // Odd One Out (16)
  mOdd('wc1-odd-fruit', 'School Bus', ['Apple', 'Banana', 'Strawberry'], 'Three are fruits you can eat — one is a vehicle!'),
  mOdd('wc1-odd-animal', 'Pillow', ['Lion', 'Elephant', 'Giraffe'], 'Three are animals — one goes on your bed!'),
  mOdd('wc1-odd-table', 'Snowman', ['Fork', 'Spoon', 'Plate'], 'Three belong on a dinner table!'),
  mOdd('wc1-odd-color', 'Shoe', ['Red', 'Blue', 'Yellow'], 'Three are colors — one goes on your foot!'),
  mOdd('wc1-odd-shape', 'Carrot', ['Circle', 'Square', 'Triangle'], 'Three are shapes — one is a crunchy vegetable!'),
  mOdd('wc1-odd-weather', 'Chair', ['Rain', 'Snow', 'Wind'], 'Three are kinds of weather — one is furniture!'),
  mOdd('wc1-odd-bird', 'Truck', ['Robin', 'Owl', 'Duck'], 'Three are birds with feathers — one has wheels!'),
  mOdd('wc1-odd-clothes', 'Hammer', ['Shirt', 'Pants', 'Socks'], 'Three are clothes you wear — one is a tool!'),
  mOdd('wc1-odd-farm', 'Pencil', ['Cow', 'Pig', 'Sheep'], 'Three are farm animals — one draws pictures!'),
  mOdd('wc1-odd-ocean', 'Toaster', ['Whale', 'Shark', 'Octopus'], 'Three live in the ocean — one sits in the kitchen!'),
  mOdd('wc1-odd-toy', 'Broccoli', ['Teddy Bear', 'Blocks', 'Ball'], 'Three are toys to play with — one is a green veggie!'),
  mOdd('wc1-odd-body', 'Spoon', ['Nose', 'Elbow', 'Knee'], 'Three are parts of your body!'),
  mOdd('wc1-odd-music', 'Broom', ['Drum', 'Piano', 'Guitar'], 'Three are musical instruments — one sweeps the floor!'),
  mOdd('wc1-odd-bug', 'Book', ['Ant', 'Bee', 'Ladybug'], 'Three are tiny insects — one has pages to read!'),
  mOdd('wc1-odd-sky', 'Sandwich', ['Sun', 'Moon', 'Cloud'], 'Three are up in the sky — one goes in a lunchbox!'),
  mOdd('wc1-odd-ride', 'Flower', ['Bike', 'Train', 'Boat'], 'Three are ways to travel — one grows in a garden!'),

  // Simple Concrete Word Pairs (10)
  mAnalogy('wc1-p-sound', 'Dog', 'Bark', 'Cat', 'Meow', ['Swim', 'Tail', 'Milk'], 'A dog says bark — what sound does a cat make?'),
  mAnalogy('wc1-p-home', 'Bird', 'Nest', 'Bee', 'Hive', ['Tree', 'Pond', 'Wing'], 'A bird lives in a nest — a bee lives in a hive!'),
  mAnalogy('wc1-p-where', 'Fish', 'Water', 'Bird', 'Sky', ['Sand', 'Bed', 'Bowl'], 'A fish swims in water — a bird flies in the sky!'),
  mAnalogy('wc1-p-wear', 'Shoe', 'Foot', 'Hat', 'Head', ['Hand', 'Knee', 'Coat'], 'You put a shoe on your foot — you put a hat on your head!'),
  mAnalogy('wc1-p-brush', 'Toothbrush', 'Teeth', 'Comb', 'Hair', ['Hands', 'Shoes', 'Ears'], 'A toothbrush cleans teeth — a comb tidies hair!'),
  mAnalogy('wc1-p-farm', 'Cow', 'Milk', 'Hen', 'Egg', ['Wool', 'Hay', 'Barn'], 'Milk comes from a cow — an egg comes from a hen!'),
  mAnalogy('wc1-p-sky', 'Sun', 'Day', 'Moon', 'Night', ['Rain', 'Hot', 'Cloud'], 'The sun shines in the day — the moon shines at night!'),
  mAnalogy('wc1-p-art', 'Crayon', 'Draw', 'Scissors', 'Cut', ['Glue', 'Paint', 'Read'], 'You draw with a crayon — you cut with scissors!'),
  mAnalogy('wc1-p-weather', 'Rain', 'Umbrella', 'Cold', 'Coat', ['Swimsuit', 'Sand', 'Ball'], 'In the rain you use an umbrella — in the cold you wear a coat!'),
  mAnalogy('wc1-p-ride', 'Car', 'Road', 'Boat', 'Water', ['Grass', 'Snow', 'Track'], 'A car drives on a road — a boat sails on water!'),
];

// Tier 2 (Explorer, Ages 7–8): 46 items — Analogies (18), Opp/Syn (12), Ladders (10), Homophones (6)
const TIER2_ITEMS = [
  // Analogies (18)
  mAnalogy('wc2-a-move', 'Bird', 'Fly', 'Fish', 'Swim', ['Bark', 'Climb', 'Nest'], 'How does a bird move? It flies! How does a fish move?'),
  mAnalogy('wc2-a-baby', 'Puppy', 'Dog', 'Kitten', 'Cat', ['Mouse', 'Barn', 'Milk'], 'A puppy grows into a dog — a kitten grows into a cat!'),
  mAnalogy('wc2-a-season', 'Winter', 'Cold', 'Summer', 'Hot', ['Snow', 'Coat', 'Leaf'], 'Winter weather is cold — summer weather is hot!'),
  mAnalogy('wc2-a-wear', 'Glove', 'Hand', 'Sock', 'Foot', ['Hat', 'Head', 'Coat'], 'A glove goes on your hand — a sock goes on your foot!'),
  mAnalogy('wc2-a-work', 'Chef', 'Kitchen', 'Teacher', 'Classroom', ['Hospital', 'Garage', 'Stage'], 'A chef works in a kitchen — a teacher works in a classroom!'),
  mAnalogy('wc2-a-sense', 'Book', 'Read', 'Song', 'Listen', ['Write', 'Bounce', 'Cook'], 'You read a book — you listen to a song!'),
  mAnalogy('wc2-a-tool', 'Hammer', 'Nail', 'Key', 'Lock', ['Wood', 'Door', 'Rope'], 'A hammer works on a nail — a key opens a lock!'),
  mAnalogy('wc2-a-part', 'Wheel', 'Bicycle', 'Wing', 'Airplane', ['Pilot', 'Cloud', 'Road'], 'A wheel is part of a bicycle — a wing is part of an airplane!'),
  mAnalogy('wc2-a-cover', 'Leaf', 'Tree', 'Feather', 'Bird', ['Nest', 'Sky', 'Branch'], 'Leaves grow on a tree — feathers grow on a bird!'),
  mAnalogy('wc2-a-maker', 'Baker', 'Bread', 'Painter', 'Picture', ['Brush', 'Oven', 'Wall'], 'A baker makes bread — a painter makes a picture!'),
  mAnalogy('wc2-a-grow', 'Seed', 'Plant', 'Egg', 'Chick', ['Nest', 'Shell', 'Soil'], 'A seed grows into a plant — an egg hatches into a chick!'),
  mAnalogy('wc2-a-body', 'Eye', 'See', 'Ear', 'Hear', ['Smell', 'Blink', 'Talk'], 'Your eye helps you see — your ear helps you hear!'),
  mAnalogy('wc2-a-shop', 'Library', 'Books', 'Bakery', 'Bread', ['Shoes', 'Toys', 'Cars'], 'You get books at a library — you get bread at a bakery!'),
  mAnalogy('wc2-a-measure', 'Ruler', 'Length', 'Clock', 'Time', ['Weight', 'Color', 'Sound'], 'A ruler measures length — a clock measures time!'),
  mAnalogy('wc2-a-desk', 'Pencil', 'Write', 'Eraser', 'Erase', ['Paper', 'Fold', 'Glue'], 'A pencil writes — an eraser erases!'),
  mAnalogy('wc2-a-temp', 'Ice', 'Freeze', 'Fire', 'Burn', ['Melt', 'Float', 'Glow'], 'Ice can freeze — fire can burn!'),
  mAnalogy('wc2-a-calf', 'Fawn', 'Deer', 'Calf', 'Cow', ['Barn', 'Sheep', 'Wool'], 'A fawn is a young deer — a calf is a young cow!'),
  mAnalogy('wc2-a-pilot', 'Doctor', 'Hospital', 'Pilot', 'Airplane', ['Boat', 'School', 'Farm'], 'A doctor works in a hospital — a pilot flies an airplane!'),

  // Synonyms & Opposites (12)
  mSyn('wc2-s-enormous', 'ENORMOUS', 'Gigantic', ['Tiny', 'Gentle', 'Bumpy'], 'An enormous whale is super, super big!'),
  mOpp('wc2-o-ancient', 'ANCIENT', 'Modern', ['Rusty', 'Golden', 'Quiet'], 'Ancient means very old; modern means brand-new or current!'),
  mSyn('wc2-s-brave', 'BRAVE', 'Courageous', ['Scared', 'Sleepy', 'Quiet'], 'Someone brave shows courage even when nervous!'),
  mSyn('wc2-s-tiny', 'TINY', 'Miniature', ['Giant', 'Loud', 'Heavy'], 'Miniature means super tiny, like a dollhouse cup!'),
  mOpp('wc2-o-generous', 'GENEROUS', 'Selfish', ['Kind', 'Happy', 'Cheerful'], 'Generous means loving to share — selfish keeps everything!'),
  mSyn('wc2-s-swift', 'SWIFT', 'Rapid', ['Slow', 'Heavy', 'Soft'], 'Swift and rapid both mean super quick!'),
  mOpp('wc2-o-fragile', 'FRAGILE', 'Sturdy', ['Glass', 'Thin', 'Breakable'], 'Fragile breaks easily — sturdy is strong and solid!'),
  mSyn('wc2-s-glad', 'GLAD', 'Cheerful', ['Grumpy', 'Tired', 'Shy'], 'Glad and cheerful both describe a bright, happy mood!'),
  mOpp('wc2-o-shallow', 'SHALLOW', 'Deep', ['Wet', 'Clear', 'Wide'], 'A puddle is shallow; the ocean is deep!'),
  mSyn('wc2-s-silent', 'SILENT', 'Quiet', ['Noisy', 'Bright', 'Fast'], 'Silent means completely quiet with zero sound!'),
  mOpp('wc2-o-expand', 'EXPAND', 'Shrink', ['Stretch', 'Grow', 'Rise'], 'A balloon expands when blown up and shrinks when air lets out!'),
  mSyn('wc2-s-famous', 'FAMOUS', 'Well-known', ['Hidden', 'Ordinary', 'Secret'], 'Famous means known by lots of people!'),

  // Shades of Meaning Ladders (10)
  mLadder('wc2-l-voice', 'Quietest → Loudest', ['Whisper', 'Speak', 'Shout'], ['1. Quietest', '2. Medium', '3. Loudest'], 'Start with the softest voice, then normal talking, then the biggest voice!'),
  mLadder('wc2-l-heat', 'Mildest → Hottest', ['Warm', 'Hot', 'Boiling'], ['1. Mild', '2. Stronger', '3. Hottest'], 'Warm cocoa → hot soup → bubbling boiling water!'),
  mLadder('wc2-l-rain', 'Lightest → Heaviest Rain', ['Drizzle', 'Rain', 'Downpour'], ['1. Light', '2. Steady', '3. Heavy'], 'A drizzle is tiny drops; a downpour is pouring rain!'),
  mLadder('wc2-l-move', 'Slowest → Fastest', ['Walk', 'Jog', 'Sprint'], ['1. Slowest', '2. Medium', '3. Fastest'], 'Walking is calm, jogging is steady, sprinting is top speed!'),
  mLadder('wc2-l-joy', 'Smallest → Biggest Laugh', ['Smile', 'Chuckle', 'Roar'], ['1. Quiet', '2. Medium', '3. Biggest'], 'A silent smile → a soft chuckle → roaring with laughter!'),
  mLadder('wc2-l-water', 'Smallest → Biggest Water', ['Puddle', 'Pond', 'Ocean'], ['1. Smallest', '2. Medium', '3. Huge'], 'Step over a puddle, duck-feed at a pond, sail across an ocean!'),
  mLadder('wc2-l-wet', 'Least → Most Wet', ['Damp', 'Wet', 'Soaking'], ['1. Slightly', '2. Clearly', '3. Dripping'], 'Damp is barely moist; soaking means dripping wet!'),
  mLadder('wc2-l-look', 'Quickest → Longest Look', ['Glance', 'Look', 'Stare'], ['1. Quick', '2. Normal', '3. Long'], 'A glance takes a split second; a stare doesn’t blink!'),
  mLadder('wc2-l-sleep', 'Shortest → Longest Rest', ['Nap', 'Sleep', 'Hibernate'], ['1. Short', '2. Overnight', '3. All Winter'], 'A quick afternoon nap → full night sleep → a bear hibernating all winter!'),
  mLadder('wc2-l-size', 'Smallest → Biggest', ['Tiny', 'Medium', 'Gigantic'], ['1. Smallest', '2. Middle', '3. Biggest'], 'From ant-sized tiny to whale-sized gigantic!'),

  // Homophones in Context (6)
  mSent('wc2-h-knight', 'Sound-Alike Word', 'The brave ', ' rode his horse to the castle.', 'knight', ['night', 'nite', 'knit'], 'A medieval warrior is spelled KNIGHT (with a silent K)!'),
  mSent('wc2-h-pear', 'Sound-Alike Word', 'Maya packed a juicy green ', ' in her lunchbox.', 'pear', ['pair', 'pare', 'peer'], 'The sweet fruit is PEAR; two matching shoes are a PAIR!'),
  mSent('wc2-h-flower', 'Sound-Alike Word', 'A bright yellow ', ' bloomed in the sunny garden.', 'flower', ['flour', 'floor', 'flow'], 'Plants bloom into a FLOWER; bakers scoop white FLOUR!'),
  mSent('wc2-h-sea', 'Sound-Alike Word', 'Dolphins leaped high above the blue ', '.', 'sea', ['see', 'seed', 'seat'], 'Ocean water is SEA; you look with your eyes to SEE!'),
  mSent('wc2-h-write', 'Sound-Alike Word', 'Please ', ' your name neatly at the top of the page.', 'write', ['right', 'ride', 'white'], 'Putting words on paper is WRITE (with a silent W)!'),
  mSent('wc2-h-there', 'Sound-Alike Word', 'Put the heavy library books right over ', ' on the table.', 'there', ['their', "they're", 'them'], 'THERE points to a place (notice "here" inside t-HERE)!'),
];

// Tier 3 (Challenger, Ages 9–10): 46 items — Analogies (16), Ladders (12), Context Sentences (12), Idioms (6)
const TIER3_ITEMS = [
  // Analogies (16)
  mAnalogy('wc3-a-author', 'Author', 'Book', 'Composer', 'Symphony', ['Library', 'Violin', 'Stage'], 'An author creates a book — a composer creates a symphony!'),
  mAnalogy('wc3-a-compass', 'Compass', 'Direction', 'Thermometer', 'Temperature', ['Weather', 'Mercury', 'Winter'], 'A compass tells direction — a thermometer measures temperature!'),
  mAnalogy('wc3-a-petal', 'Petal', 'Flower', 'Chapter', 'Book', ['Page', 'Storyteller', 'Cover'], 'Part-to-whole! A petal is part of a flower; a chapter is part of a book!'),
  mAnalogy('wc3-a-sculptor', 'Sculptor', 'Statue', 'Architect', 'Building', ['Hammer', 'City', 'Brick'], 'A sculptor creates a statue — an architect designs a building!'),
  mAnalogy('wc3-a-hive', 'Hive', 'Bee', 'Den', 'Bear', ['Forest', 'Honey', 'Cave'], 'A hive is a bee’s home — a den is a bear’s home!'),
  mAnalogy('wc3-a-diet', 'Herbivore', 'Plants', 'Carnivore', 'Meat', ['Forest', 'Teeth', 'Water'], 'Herbivores eat plants — carnivores eat meat!'),
  mAnalogy('wc3-a-nocturnal', 'Nocturnal', 'Night', 'Diurnal', 'Day', ['Sleep', 'Owl', 'Moon'], 'Nocturnal animals are active at night — diurnal animals are active by day!'),
  mAnalogy('wc3-a-geom', 'Radius', 'Circle', 'Side', 'Square', ['Ruler', 'Corner', 'Round'], 'A radius defines a circle — a side defines a square!'),
  mAnalogy('wc3-a-propel', 'Oar', 'Rowboat', 'Pedal', 'Bicycle', ['Helmet', 'Wheel', 'Path'], 'You push an oar to power a rowboat — you push a pedal to power a bicycle!'),
  mAnalogy('wc3-a-spark', 'Spark', 'Fire', 'Seed', 'Forest', ['Leaf', 'Rain', 'Smoke'], 'A tiny spark grows into a fire — a tiny seed grows into a forest!'),
  mAnalogy('wc3-a-map', 'Map', 'Geography', 'Timeline', 'History', ['Clock', 'Atlas', 'Future'], 'Maps organize geography — timelines organize history!'),
  mAnalogy('wc3-a-stanza', 'Stanza', 'Poem', 'Paragraph', 'Essay', ['Sentence', 'Title', 'Author'], 'A stanza is a section of a poem — a paragraph is a section of an essay!'),
  mAnalogy('wc3-a-group', 'Flock', 'Birds', 'School', 'Fish', ['Teacher', 'Ocean', 'Wings'], 'A group of birds is a flock — a group of fish is a school!'),
  mAnalogy('wc3-a-courage', 'Courage', 'Brave', 'Wisdom', 'Wise', ['Clever', 'Book', 'Kind'], 'Someone full of courage is brave — someone full of wisdom is wise!'),
  mAnalogy('wc3-a-scale', 'Clock', 'Seconds', 'Scale', 'Weight', ['Heavy', 'Balance', 'Height'], 'A clock measures seconds — a scale measures weight!'),
  mAnalogy('wc3-a-canyon', 'Canyon', 'Deep', 'Mountain', 'Tall', ['Rock', 'Snow', 'Wide'], 'A canyon is known for being deep — a mountain for being tall!'),

  // Shades of Meaning Ladders (12)
  mLadder('wc3-l-cold', 'Coolest → Coldest', ['Cool', 'Chilly', 'Freezing'], ['1. Mild', '2. Stronger', '3. Intense'], 'Crisp breeze → needing a jacket → turning water into ice!'),
  mLadder('wc3-l-speed', 'Slowest → Fastest', ['Stroll', 'Jog', 'Sprint'], ['1. Slowest', '2. Medium', '3. Fastest'], 'A stroll is a relaxed walk; a sprint is full racing speed!'),
  mLadder('wc3-l-size', 'Smallest → Biggest', ['Tiny', 'Average', 'Colossal'], ['1. Smallest', '2. Middle', '3. Biggest'], 'Colossal means giant-sized, like a blue whale!'),
  mLadder('wc3-l-anger', 'Mildest → Strongest Anger', ['Annoyed', 'Angry', 'Furious'], ['1. Mild', '2. Clear', '3. Extreme'], 'Slightly bothered (annoyed) → mad (angry) → boiling over (furious)!'),
  mLadder('wc3-l-happy', 'Calmest → Most Thrilled', ['Content', 'Happy', 'Ecstatic'], ['1. Peaceful', '2. Glad', '3. Overjoyed'], 'Content is peaceful satisfaction; ecstatic is bursting with joy!'),
  mLadder('wc3-l-light', 'Softest → Brightest Light', ['Dim', 'Bright', 'Blinding'], ['1. Faint', '2. Clear', '3. Intense'], 'A dim nightlight → a bright lamp → blinding noon sun!'),
  mLadder('wc3-l-flow', 'Smallest → Strongest Flow', ['Trickle', 'Stream', 'Torrent'], ['1. Tiny', '2. Steady', '3. Rushing'], 'A thin trickle → a steady stream → a powerful rushing torrent!'),
  mLadder('wc3-l-wind', 'Gentlest → Fiercest Wind', ['Breeze', 'Gale', 'Hurricane'], ['1. Gentle', '2. Strong', '3. Fierce'], 'A soft summer breeze → a strong gale → a massive hurricane!'),
  mLadder('wc3-l-hungry', 'Least → Most Hungry', ['Peckish', 'Hungry', 'Famished'], ['1. Slight', '2. Ready', '3. Starving'], 'Peckish wants a snack; famished feels completely starved!'),
  mLadder('wc3-l-good', 'Good → Amazing', ['Good', 'Impressive', 'Extraordinary'], ['1. Solid', '2. Great', '3. Rare'], 'Extraordinary literally means beyond ordinary!'),
  mLadder('wc3-l-fear', 'Mildest → Strongest Fear', ['Nervous', 'Scared', 'Terrified'], ['1. Mild', '2. Clear', '3. Intense'], 'Butterflies (nervous) → afraid (scared) → frozen in fear (terrified)!'),
  mLadder('wc3-l-sound', 'Softest → Loudest', ['Murmur', 'Announce', 'Bellow'], ['1. Soft', '2. Clear', '3. Booming'], 'A low murmur → a clear announcement → a booming bellow!'),

  // Context-Clue Sentences (12)
  mSent('wc3-c-meticulous', 'Precise Word', 'The scientist was ', ' to check every measurement twice.', 'Meticulous', ['Careless', 'Drowsy', 'Boastful'], 'Meticulous means paying super careful attention to every tiny detail!'),
  mSent('wc3-c-persevere', 'Precise Word', 'Even after her Lego bridge fell twice, Ava chose to ', ' until it held.', 'Persevere', ['Quit', 'Forget', 'Wander'], 'Persevere means keeping going even when something gets tough!'),
  mSent('wc3-c-camouflage', 'Precise Word', 'The green gecko used ', ' to blend right into the jungle leaves.', 'Camouflage', ['Applause', 'Gravity', 'Echoes'], 'Camouflage hides an animal by matching its surroundings!'),
  mSent('wc3-c-reluctant', 'Precise Word', 'At first, Leo was ', ' to jump off the high diving board, so he waited.', 'Reluctant', ['Eager', 'Certain', 'Reckless'], 'Reluctant means hesitant or not quite wanting to do something yet!'),
  mSent('wc3-c-abundant', 'Precise Word', 'After the spring rains, wildflowers were ', ' across the whole valley.', 'Abundant', ['Scarce', 'Invisible', 'Broken'], 'Abundant means plentiful — lots and lots of something!'),
  mSent('wc3-c-scarce', 'Precise Word', 'In the dry desert, fresh drinking water is ', ' and precious.', 'Scarce', ['Abundant', 'Noisy', 'Careless'], 'Scarce means rare or in very short supply!'),
  mSent('wc3-c-ingenious', 'Precise Word', 'Using a rubber band and two spoons, Sam built an ', ' mini-catapult.', 'Ingenious', ['Clumsy', 'Ordinary', 'Boring'], 'Ingenious means super clever and inventive!'),
  mSent('wc3-c-transparent', 'Precise Word', 'The mountain lake was so ', ' we could count pebbles on the bottom.', 'Transparent', ['Muddy', 'Solid', 'Opaque'], 'Transparent means completely see-through!'),
  mSent('wc3-c-cautious', 'Precise Word', 'Because the sidewalk was icy, we took slow, ', ' steps.', 'Cautious', ['Wild', 'Careless', 'Hurried'], 'Cautious means careful to avoid danger!'),
  mSent('wc3-c-adapt', 'Precise Word', 'Arctic foxes grow thick white fur to ', ' to snowy winters.', 'Adapt', ['Complain', 'Vanish', 'Freeze'], 'Adapt means changing to fit a new environment!'),
  mSent('wc3-c-enthusiastic', 'Precise Word', 'The crowd gave an ', ' cheer when the robotics team succeeded.', 'Enthusiastic', ['Bored', 'Silent', 'Grumpy'], 'Enthusiastic means full of lively excitement!'),
  mSent('wc3-c-fragile', 'Precise Word', 'Pack the glass ornament in bubble wrap because it is ', '.', 'Fragile', ['Sturdy', 'Flexible', 'Bouncy'], 'Fragile means delicate and easily broken!'),

  // Idioms & Figurative Meaning (6)
  mDef('wc3-i-ice', 'Idiom Detective', 'What does this saying really mean?', '“Playing a quick game helped everyone break the ice.”', 'Make people feel relaxed', ['Crack frozen water', 'Go ice skating', 'End the party'], 'Breaking the ice warms up a shy room so people start chatting!'),
  mDef('wc3-i-cake', 'Idiom Detective', 'What does this saying really mean?', '“After practicing all week, the spelling quiz was a piece of cake!”', 'Super easy to do', ['Time for dessert', 'Very messy', 'Impossible to finish'], 'A piece of cake is an idiom meaning something felt effortless!'),
  mDef('wc3-i-beans', 'Idiom Detective', 'What does this saying really mean?', '“Try not to spill the beans about Mom’s surprise party!”', 'Accidentally tell a secret', ['Drop dinner on the floor', 'Plant a garden', 'Speak too quietly'], 'Spilling the beans means accidentally revealing a secret!'),
  mDef('wc3-i-weather', 'Idiom Detective', 'What does this saying really mean?', '“Noah stayed home to rest because he felt under the weather.”', 'Feeling a little sick', ['Standing in the rain', 'Watching clouds', 'Feeling super energetic'], 'Under the weather is an idiom for feeling unwell!'),
  mDef('wc3-i-nail', 'Idiom Detective', 'What does this saying really mean?', '“Your explanation hit the nail on the head!”', 'Was completely accurate', ['Used a real hammer', 'Made a loud noise', 'Missed the target'], 'Hitting the nail on the head means getting an answer or idea 100% right!'),
  mDef('wc3-i-chew', 'Idiom Detective', 'What does this saying really mean?', '“Signing up for five clubs at once was biting off more than she could chew.”', 'Taking on too much at once', ['Eating lunch too fast', 'Loving spicy food', 'Having nothing to do'], 'Taking on more tasks than you can comfortably handle!'),
];

// Tier 4 (Trailblazer, Ages 11+): 44 items — Analogies (16), Ladders (10), Precision Definitions (10), Inference Sentences (8)
const TIER4_ITEMS = [
  // Analogies (16 — genuinely conceptual Grade 6–7 relationships with plausible distractors)
  mAnalogy('wc4-a-drought', 'Drought', 'Rain', 'Famine', 'Food', ['Harvest', 'Soil', 'Plague'], 'Lack-of link: drought = severe lack of rain; famine = severe lack of food!'),
  mAnalogy('wc4-a-erosion', 'Erosion', 'Canyon', 'Deposition', 'Delta', ['Trench', 'Glacier', 'Crater'], 'Geologic cause-to-landform: erosion carves a canyon; sediment deposition builds a delta!'),
  mAnalogy('wc4-a-plagiarism', 'Plagiarism', 'Writing', 'Forgery', 'Art', ['Critique', 'Archive', 'Copyright'], 'Plagiarism fakes original writing; forgery fakes original artwork or documents!'),
  mAnalogy('wc4-a-prologue', 'Prologue', 'Beginning', 'Epilogue', 'Ending', ['Climax', 'Interlude', 'Index'], 'Prologue opens a work before Chapter 1; epilogue closes it after the main action!'),
  mAnalogy('wc4-a-catalyst', 'Catalyst', 'Accelerate', 'Obstacle', 'Impede', ['Amplify', 'Preserve', 'Conclude'], 'A catalyst accelerates a process; an obstacle impedes or slows it down!'),
  mAnalogy('wc4-a-embargo', 'Embargo', 'Trade', 'Quarantine', 'Contagion', ['Diplomacy', 'Migration', 'Sanction'], 'An embargo halts trade; a quarantine halts the spread of contagion!'),
  mAnalogy('wc4-a-overture', 'Overture', 'Opera', 'Preamble', 'Constitution', ['Amendment', 'Ballot', 'Treaty'], 'An overture introduces an opera; a preamble introduces a constitution!'),
  mAnalogy('wc4-a-fossil', 'Fossil', 'Past', 'Prototype', 'Future', ['Artifact', 'Theory', 'Museum'], 'A fossil is physical evidence of the past; a prototype models an invention for the future!'),
  mAnalogy('wc4-a-archive', 'Archive', 'Documents', 'Arboretum', 'Trees', ['Fossils', 'Artifacts', 'Minerals'], 'An archive curates historical documents; an arboretum curates living trees!'),
  mAnalogy('wc4-a-apathy', 'Apathy', 'Interest', 'Anarchy', 'Order', ['Justice', 'Conflict', 'Debate'], 'Lack-of relationship: apathy is absence of interest; anarchy is absence of order!'),
  mAnalogy('wc4-a-friction', 'Friction', 'Motion', 'Insulation', 'Heat', ['Gravity', 'Current', 'Pressure'], 'Resistance pair: friction resists motion; insulation resists heat transfer!'),
  mAnalogy('wc4-a-hypo', 'Hypothesis', 'Experiment', 'Verdict', 'Trial', ['Evidence', 'Statute', 'Appeal'], 'A hypothesis is tested in an experiment; a verdict concludes a trial!'),
  mAnalogy('wc4-a-benev', 'Benevolent', 'Malicious', 'Generous', 'Miserly', ['Frugal', 'Prudent', 'Modest'], 'Antonym intensity pair: benevolent ↔ malicious; generous ↔ miserly!'),
  mAnalogy('wc4-a-trib', 'Tributary', 'River', 'Subsidiary', 'Corporation', ['Monopoly', 'Patent', 'Revenue'], 'A smaller stream feeding a river is a tributary; a smaller company under a parent is a subsidiary!'),
  mAnalogy('wc4-a-mono', 'Monologue', 'Solitary', 'Dialogue', 'Mutual', ['Eloquent', 'Brief', 'Unanimous'], 'A monologue is solitary speech; a dialogue is mutual exchange!'),
  mAnalogy('wc4-a-vaccine', 'Vaccine', 'Prevent', 'Antidote', 'Counteract', ['Diagnose', 'Isolate', 'Transmit'], 'A vaccine prevents infection ahead of time; an antidote counteracts poison!'),

  // Shades of Meaning Ladders (10 — nuanced, unambiguously ordered Grade 6–7 progressions)
  mLadder('wc4-l-worry', 'Calmest → Most Worried', ['Uneasy', 'Anxious', 'Frantic'], ['1. Mild', '2. Moderate', '3. Intense'], 'Uneasy is a slight flutter; frantic is overwhelmed panic!'),
  mLadder('wc4-l-interest', 'Least → Most Interested', ['Curious', 'Eager', 'Obsessed'], ['1. Mild', '2. Strong', '3. Extreme'], 'Curious asks a question; obsessed thinks of nothing else!'),
  mLadder('wc4-l-likely', 'Least → Most Certain', ['Plausible', 'Probable', 'Certain'], ['1. Possible', '2. Likely', '3. Sure'], 'Plausible means believable; probable means likely; certain means 100%!'),
  mLadder('wc4-l-ask', 'Softest → Strongest Request', ['Suggest', 'Urge', 'Demand'], ['1. Gentle', '2. Strong', '3. Command'], 'From polite suggestion to firm urging to insistent demand!'),
  mLadder('wc4-l-save', 'Balanced → Extreme Saving', ['Thrifty', 'Frugal', 'Miserly'], ['1. Careful', '2. Strict', '3. Extreme'], 'Thrifty spends wisely; miserly refuses to spend even when needed!'),
  mLadder('wc4-l-doubt', 'Mildest → Strongest Doubt', ['Uncertain', 'Skeptical', 'Incredulous'], ['1. Unsure', '2. Questioning', '3. Disbelieving'], 'Uncertain isn’t sure; incredulous can barely believe it!'),
  mLadder('wc4-l-resist', 'Mildest → Strongest Opposition', ['Reluctant', 'Averse', 'Hostile'], ['1. Hesitant', '2. Opposed', '3. Aggressive'], 'Reluctant hesitates; averse strongly dislikes; hostile actively opposes!'),
  mLadder('wc4-l-look', 'Quickest → Most Thorough Look', ['Notice', 'Examine', 'Scrutinize'], ['1. Brief', '2. Careful', '3. Intense'], 'You notice in passing, examine carefully, and scrutinize every flaw!'),
  mLadder('wc4-l-respect', 'Polite → Deepest Respect', ['Cordial', 'Gracious', 'Reverent'], ['1. Friendly', '2. Warm', '3. Deep Awe'], 'Cordial is polite; reverent shows profound awe and respect!'),
  mLadder('wc4-l-hint', 'Subtlest → Most Direct', ['Imply', 'State', 'Proclaim'], ['1. Hint', '2. Say Clearly', '3. Announce Boldly'], 'Imply hints indirectly; proclaim declares loudly to everyone!'),

  // Precision Academic Definitions (10 — ALL 4 options are same-register academic words!)
  mDef('wc4-d-resilient', 'Precise Word', 'Which word matches this meaning?', 'Able to recover quickly and adapt after setbacks or strain.', 'Resilient', ['Volatile', 'Complacent', 'Stagnant'], 'Resilient means bouncing back strong after adversity!'),
  mDef('wc4-d-pragmatic', 'Precise Word', 'Which word matches this meaning?', 'Focused on practical, realistic results rather than pure theory.', 'Pragmatic', ['Idealistic', 'Dogmatic', 'Erratic'], 'A pragmatic thinker prioritizes what actually works in practice!'),
  mDef('wc4-d-ambiguous', 'Precise Word', 'Which word matches this meaning?', 'Open to more than one competing interpretation; not crystal clear.', 'Ambiguous', ['Explicit', 'Unanimous', 'Redundant'], 'An ambiguous statement leaves multiple meanings possible!'),
  mDef('wc4-d-ephemeral', 'Precise Word', 'Which word matches this meaning?', 'Lasting for only a brief moment before fading away.', 'Ephemeral', ['Perpetual', 'Tangible', 'Dormant'], 'Ephemeral things vanish quickly, like cherry blossoms or morning dew!'),
  mDef('wc4-d-ubiquitous', 'Precise Word', 'Which word matches this meaning?', 'Present or appearing seemingly everywhere at once.', 'Ubiquitous', ['Sporadic', 'Obscure', 'Clandestine'], 'Ubiquitous describes something found virtually everywhere!'),
  mDef('wc4-d-candid', 'Precise Word', 'Which word matches this meaning?', 'Completely frank, truthful, and direct without hiding flaws.', 'Candid', ['Evasive', 'Cryptic', 'Stoic'], 'Candid feedback is refreshingly honest and straightforward!'),
  mDef('wc4-d-altruistic', 'Precise Word', 'Which word matches this meaning?', 'Motivated by selfless concern for the well-being of others.', 'Altruistic', ['Mercenary', 'Apathetic', 'Cynical'], 'Altruistic actions benefit others without expecting personal reward!'),
  mDef('wc4-d-tenacious', 'Precise Word', 'Which word matches this meaning?', 'Holding firmly to a course of action and refusing to yield easily.', 'Tenacious', ['Complacent', 'Capricious', 'Diffident'], 'Root "ten" = hold! Tenacious means holding on with grit!'),
  mDef('wc4-d-objective', 'Precise Word', 'Which word matches this meaning?', 'Guided strictly by verifiable facts rather than personal bias.', 'Objective', ['Partisan', 'Subjective', 'Anecdotal'], 'Objective reasoning relies on measurable evidence instead of opinion!'),
  mDef('wc4-d-redundant', 'Precise Word', 'Which word matches this meaning?', 'No longer needed because the same purpose is already covered elsewhere.', 'Redundant', ['Essential', 'Ambiguous', 'Plausible'], 'Redundant details repeat information you already have!'),

  // Contextual Inference Sentences (8 — ALL 4 options match academic register & part of speech!)
  mSent('wc4-s-corroborate', 'Academic Context', 'Independent satellite images helped ', ' the explorer’s surprising journal entry.', 'Corroborate', ['Refute', 'Fabricate', 'Speculate'], 'Corroborate means confirming a claim with independent evidence!'),
  mSent('wc4-s-mitigate', 'Academic Context', 'Restoring coastal wetlands helped ', ' storm-surge damage during hurricanes.', 'Mitigate', ['Exacerbate', 'Perpetuate', 'Instigate'], 'Mitigate means reducing how severe or harmful an impact is!'),
  mSent('wc4-s-inevitable', 'Academic Context', 'With fuel gauges reading zero miles from port, an emergency tow seemed ', '.', 'Inevitable', ['Arbitrary', 'Negotiable', 'Redundant'], 'Inevitable means unavoidable and certain to occur!'),
  mSent('wc4-s-scrutinize', 'Academic Context', 'Curators ', ' canvas fibers under ultraviolet lamps to detect skillful forgeries.', 'Scrutinize', ['Dismiss', 'Endorse', 'Paraphrase'], 'Scrutinize means inspecting closely and critically!'),
  mSent('wc4-s-unanimous', 'Academic Context', 'Without a single dissenting vote, the committee’s decision was ', '.', 'Unanimous', ['Polarized', 'Tentative', 'Ambiguous'], 'Roots "uni" (one) + "anim" (mind) = everyone in complete agreement!'),
  mSent('wc4-s-paradox', 'Academic Context', '“The faster you rush a tricky task, the longer it takes to fix” is a classic ', '.', 'Paradox', ['Euphemism', 'Hypothesis', 'Analogy'], 'A paradox seems self-contradictory at first yet captures a real truth!'),
  mSent('wc4-s-conjecture', 'Academic Context', 'Until fossils confirm the pattern, paleontologists classify the idea as ', '.', 'Conjecture', ['Consensus', 'Precedent', 'Axiom'], 'Conjecture is a reasoned hypothesis not yet definitively proven!'),
  mSent('wc4-s-catalyst', 'Academic Context', 'The invention of affordable printing acted as a ', ' for scientific collaboration.', 'Catalyst', ['Deterrent', 'Artifact', 'Postscript'], 'A catalyst triggers rapid change or accelerates progress!'),
];

function buildSpeakText(item, shuffledOptions) {
  if (item.kind === 'ladder') {
    return `Arrange the words from ${item.directionLabel.replace('→', 'to')}. The words to order are: ${shuffledOptions.join(', ')}.`;
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
  return `${item.prompt} ${item.definition} Choices: ${shuffledOptions.join(', ')}.`;
}

export function generateSession(tier = 1, profile = null) {
  const bank = tier === 1 ? TIER1_ITEMS : tier === 2 ? TIER2_ITEMS : tier === 3 ? TIER3_ITEMS : TIER4_ITEMS;
  const scopeKey = `word-connections:${tier}`;
  let chosen;

  if (profile) {
    chosen = selectSpacedWords(bank, profile, 5, (it) => `wc:${it.id}`);
  } else {
    const recent = getRecentPuzzleSigs(null, scopeKey);
    const fresh = bank.filter((it) => !recent.includes(it.id));
    const pool = fresh.length >= 5 ? fresh : bank;
    chosen = shuffle(pool).slice(0, 5);
    recordRecentPuzzleSigs(null, scopeKey, chosen.map((it) => it.id), 25);
  }

  return chosen.map((item) => {
    const wordKey = `wc:${item.id}`;
    if (item.kind === 'ladder') {
      // Guarantee shuffled order is NEVER identical to the winning order!
      let shuffledWords = shuffle(item.ordered);
      let guard = 0;
      while (shuffledWords.every((w, i) => w === item.ordered[i]) && guard < 12) {
        shuffledWords = shuffle(item.ordered);
        guard += 1;
      }
      if (shuffledWords.every((w, i) => w === item.ordered[i])) {
        shuffledWords = [item.ordered[2], item.ordered[0], item.ordered[1]];
      }
      return {
        ...item,
        wordKey,
        shuffledWords,
        speakPrompt: buildSpeakText(item, shuffledWords),
        strategyTip: item.tip,
      };
    }
    const shuffledOptions = shuffle(item.options);
    return {
      ...item,
      wordKey,
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
    return `<p class="word-sentence">${round.definition.startsWith('“') ? round.definition : `“${round.definition}”`}</p>`;
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
        if (callbacks.profile) {
          recordWordAttempt(callbacks.profile, round.wordKey, !hadMistake);
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
              <button type="button"
                      class="shade-slot ${picked[idx] ? 'filled' : ''}"
                      data-slot-idx="${idx}"
                      ${!picked[idx] || solved ? 'disabled' : ''}
                      title="${picked[idx] ? 'Tap to remove this word' : 'Empty slot'}">
                ${picked[idx] && !solved ? '<span class="shade-slot-x" aria-hidden="true">×</span>' : ''}
                <small>${lbl}</small>
                <span>${picked[idx] || '—'}</span>
              </button>
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

    wrap.querySelectorAll('[data-slot-idx]').forEach((slotBtn) => {
      slotBtn.addEventListener('click', () => {
        if (solved) return;
        const idx = Number(slotBtn.dataset.slotIdx);
        if (!picked[idx]) return;
        callbacks.playClick();
        picked.splice(idx, 1);
        render();
      });
    });

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
      if (solved) return;
      callbacks.playClick();
      picked = [];
      render();
    });

    wrap.querySelector('#btn-ladder-check').addEventListener('click', () => {
      if (solved) return;
      const isRight = round.ordered.every((w, i) => picked[i] === w);
      if (isRight) {
        solved = true;
        if (callbacks.profile) {
          recordWordAttempt(callbacks.profile, round.wordKey, !hadMistake);
        }
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
