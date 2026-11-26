/**
 * Story Detective (WordCraft Pillar — Contextual Reading Cloze, Grammar & Micro-Mystery Inference)
 * 32 original micro-stories per tier (128 total!) wired to persistent spaced-retrieval mastery:
 * - Tier 1 (Sprout): Playful 1–2 sentence read-aloud picture stories.
 * - Tier 2 (Explorer): 2-sentence adventure stories (context clues, verb tense, homophones).
 * - Tier 3 (Challenger): 2–3 sentence micro-mysteries & science vignettes (connectives & inference).
 * - Tier 4 (Trailblazer): Science/history/logic micro-passages (academic transitions & tone inference).
 */

import { shuffle } from './utils.js';
import { selectSpacedWords, recordWordAttempt, getRecentPuzzleSigs, recordRecentPuzzleSigs } from '../storage.js';

export const meta = {
  id: 'story-detective',
  title: 'Story Detective',
  pillar: 'wordcraft',
  pillarLabel: 'WordCraft',
  shortDesc: 'Read mini-stories and snap the clue word that unlocks the meaning.',
  scienceNote: 'Contextual cloze & inference directly strengthen reading comprehension across K–6.',
  timed: false,
};

const mStory = (id, title, before, after, answer, distractors, tip) => ({
  id,
  title,
  before,
  after,
  answer,
  options: [answer, ...distractors],
  tip,
});

// Tier 1 (Sprout, Ages 5–6): 32 warm, decodable read-aloud micro-stories
const TIER1_STORIES = [
  mStory('s1-01', 'Rainy Walk', 'Dark clouds rolled in and raindrops began to fall. Mia opened her bright red ', ' to stay dry.', 'umbrella', ['pillow', 'spoon', 'bicycle'], 'An umbrella keeps rain off your head!'),
  mStory('s1-02', 'Sleepy Bear', 'Winter snow covered the forest floor. Little Bear curled up in his cozy cave for a long ', '.', 'nap', ['race', 'splash', 'jump'], 'Curling up in a cozy cave means it is time for a nap!'),
  mStory('s1-03', 'Garden Helper', 'The flower pots looked dry and thirsty. Leo filled the green watering can with cool ', '.', 'water', ['sand', 'buttons', 'crayons'], 'Plants drink cool water to grow tall!'),
  mStory('s1-04', 'Snowy Hands', 'Snowflakes fell on Ben’s hands while he built a snowman. One hand felt freezing because he lost his ', '.', 'mitten', ['hat', 'boot', 'scarf'], 'Mittens keep hands warm in the snow!'),
  mStory('s1-05', 'Bakery Smell', 'A sweet warm smell floated out of the kitchen oven. Mom pulled out a tray of chocolate chip ', '.', 'cookies', ['rocks', 'boots', 'pencils'], 'Sweet treats baked on an oven tray are cookies!'),
  mStory('s1-06', 'Tall Reach', 'The red apple hung on the very highest branch. Giraffe stretched out his long ', ' to take a bite.', 'neck', ['tail', 'shoe', 'wing'], 'A giraffe uses its long neck to reach high branches!'),
  mStory('s1-07', 'Pond Splash', 'Green Frog sat on a wide lily pad and spotted a buzzing fly. He gave a giant ', ' into the air!', 'leap', ['whisper', 'yawn', 'nap'], 'Frogs leap high to catch flies!'),
  mStory('s1-08', 'Dark Tent', 'The stars came out and it got dark inside the camping tent. Zoe clicked on her bright ', '.', 'flashlight', ['broom', 'plate', 'comb'], 'A flashlight shines light in the dark!'),
  mStory('s1-09', 'Maple Breakfast', 'After eating pancakes with lots of maple syrup, Sam’s fingers felt very ', '.', 'sticky', ['sleepy', 'windy', 'loud'], 'Sweet syrup makes fingers sticky!'),
  mStory('s1-10', 'Sunny Beach', 'Waves rolled onto the warm sand. Eli used his plastic shovel and bucket to build a sand ', '.', 'castle', ['cloud', 'bicycle', 'chair'], 'Buckets and shovels build sand castles at the beach!'),
  mStory('s1-11', 'Quiet Library', 'Everyone in the library was reading books. Ava spoke in a soft ', ' so she would not disturb anyone.', 'whisper', ['shout', 'roar', 'drum'], 'A whisper is the quietest voice for a library!'),
  mStory('s1-12', 'Splashy Sidewalk', 'After the storm, huge puddles covered the sidewalk. Kai put on his yellow rubber ', ' to splash!', 'boots', ['mittens', 'glasses', 'scarves'], 'Rubber boots keep feet dry in puddles!'),
  mStory('s1-13', 'Bird Song', 'Early in the morning, Robin sat on a twig outside the window and began to ', ' a cheerful tune.', 'sing', ['dig', 'swim', 'drive'], 'Birds sing cheerful songs in the morning!'),
  mStory('s1-14', 'Birthday Wish', 'Five glowing candles sat on top of the frosted cake. Maya took a deep breath to ', ' them out!', 'blow', ['paint', 'fold', 'carry'], 'You blow out candles to make a birthday wish!'),
  mStory('s1-15', 'Happy Puppy', 'As soon as Dad walked through the front door, Puppy ran over and wagged his ', ' back and forth.', 'tail', ['book', 'cup', 'hat'], 'Happy puppies wag their tails!'),
  mStory('s1-16', 'Snowy Hill', 'The hill at the park was covered in smooth white snow. Nora zoomed down fast on her red ', '.', 'sled', ['boat', 'lamp', 'bed'], 'A sled zooms down a snowy hill!'),
  mStory('s1-17', 'Hungry Squirrel', 'Autumn leaves fell around the oak tree. Busy Squirrel gathered a big pile of crunchy ', ' for winter.', 'acorns', ['pillows', 'trucks', 'marbles'], 'Squirrels collect acorns from oak trees!'),
  mStory('s1-18', 'Paper Boat', 'Toby folded a crisp piece of paper into a little boat and floated it in the ', '.', 'bathtub', ['closet', 'oven', 'pocket'], 'A boat needs water, like a bathtub!'),
  mStory('s1-19', 'Crunchy Snack', 'Rabbit twitched his nose in the garden and nibbled a bright orange ', '.', 'carrot', ['cloud', 'blanket', 'bell'], 'Rabbits love crunchy orange carrots!'),
  mStory('s1-20', 'Paint Mess', 'Lila dipped her brush into yellow and blue paint. When she mixed them on paper, they turned ', '!', 'green', ['pink', 'black', 'loud'], 'Yellow plus blue makes green!'),
  mStory('s1-21', 'Night Sky', 'The sun went down behind the hills. One by one, tiny twinkling ', ' appeared in the dark sky.', 'stars', ['apples', 'boats', 'chairs'], 'Stars twinkle in the dark night sky!'),
  mStory('s1-22', 'Rubber Toy', 'Omar dropped the rubber ball on the sidewalk and watched it ', ' right back up to his hands.', 'bounce', ['melt', 'sleep', 'cook'], 'Rubber balls bounce right back up!'),
  mStory('s1-23', 'Cold Treat', 'On a hot July afternoon, the ice cream cone began to ', ' down Leo’s hand.', 'melt', ['freeze', 'fly', 'bark'], 'Hot weather makes ice cream melt!'),
  mStory('s1-24', 'Cozy Cat', 'When Clara gently petted her orange kitten, it closed its eyes and began to ', ' softly.', 'purr', ['moo', 'quack', 'roar'], 'Happy cats purr when petted!'),
  mStory('s1-25', 'Windy Park', 'A strong breeze blew across the grassy park. Max ran forward and his colorful ', ' soared high!', 'kite', ['rock', 'shoe', 'desk'], 'Wind lifts a kite high into the sky!'),
  mStory('s1-26', 'Bedtime Book', 'Pajamas were on and teeth were brushed. Dad turned on the lamp to read a bedtime ', '.', 'story', ['hammer', 'puddle', 'wagon'], 'Reading a bedtime story comes right after brushing teeth!'),
  mStory('s1-27', 'Fast Turtle', 'Hare ran super fast down the path, while little Turtle walked along very ', '.', 'slowly', ['loudly', 'brightly', 'sharply'], 'Turtles move slowly!'),
  mStory('s1-28', 'Silly Clown', 'At the circus, the clown balanced three rubber ducks on his nose and made the whole crowd ', '.', 'laugh', ['nap', 'freeze', 'hide'], 'Funny circus tricks make people laugh!'),
  mStory('s1-29', 'Busy Bee', 'Yellow Bee buzzed from blossom to blossom collecting sweet nectar to make golden ', '.', 'honey', ['snow', 'soup', 'paper'], 'Bees turn flower nectar into honey!'),
  mStory('s1-30', 'Almost Done', 'Only one tiny corner spot was empty on the table. Mia snapped in the last puzzle ', '!', 'piece', ['shoe', 'grape', 'leaf'], 'Puzzles are finished with the last puzzle piece!'),
  mStory('s1-31', 'Tall Tower', 'Ben stacked ten wooden blocks higher and higher until the wobbly tower began to ', '.', 'tumble', ['swim', 'bloom', 'sing'], 'A too-tall wobbly tower tumbles down!'),
  mStory('s1-32', 'Snow Day Mug', 'Coming inside with rosy cheeks from the snow, Zoe sipped a steaming mug of hot ', '.', 'cocoa', ['ice', 'sand', 'soap'], 'Steaming hot cocoa warms you up after playing in snow!'),
];

// Tier 2 (Explorer, Ages 7–8): 32 adventure micro-stories (context clues, grammar & homophones)
const TIER2_STORIES = [
  mStory('s2-01', 'Lighthouse Beam', 'Thick gray fog rolled across the rocky bay at dusk. The lighthouse keeper switched on the giant spinning lamp to ', ' ships safely home.', 'guide', ['hide', 'sink', 'ignore'], 'Lighthouses shine beams to guide ships safely around rocks!'),
  mStory('s2-02', 'Treehouse Plan', 'Before hammering a single board, Maya drew a neat ', ' of where the window and rope ladder would go.', 'sketch', ['sandwich', 'whisper', 'puddle'], 'A sketch is a quick plan drawing made before building!'),
  mStory('s2-03', 'Tide Pool Find', 'At low tide, Noah peered into a clear rock pool. A tiny purple sea star clung tightly to a smooth ', '.', 'boulder', ['cloud', 'bicycle', 'balloon'], 'Sea stars cling to rocky boulders in tide pools!'),
  mStory('s2-04', 'Yesterday’s Race', 'Every Tuesday Elena runs around the track. Yesterday she ', ' faster than she ever had before!', 'ran', ['runned', 'running', 'runs'], 'The past tense of run is RAN!'),
  mStory('s2-05', 'Camping Owl', 'Everyone zipped into their sleeping bags as night fell. Suddenly a soft "hoo-hoo" ', ' through the pine trees.', 'echoed', ['melted', 'folded', 'baked'], 'Sounds bounce and echo through quiet woods!'),
  mStory('s2-06', 'Paper Airplane', 'Leo folded the wings unevenly, so his paper glider spiraled straight down. He carefully ', ' the crease to make both sides match.', 'fixed', ['ate', 'slept', 'sailed'], 'Adjusting uneven wings fixes the glider’s flight!'),
  mStory('s2-07', 'Butterfly Secret', 'For two whole weeks the chrysalis hung quietly on the milkweed leaf. This morning a monarch finally ', '!', 'emerged', ['vanished', 'sank', 'barked'], 'Emerged means came out into view!'),
  mStory('s2-08', 'Bike Ride', 'Sam wanted to ride his bike, and his little sister wanted to come ', '.', 'too', ['two', 'to', 'toe'], 'TOO (with two O’s) means "also"!'),
  mStory('s2-09', 'Fossil Hunt', 'Brushing dust off a flat limestone slab, Clara gasped. Right in the rock was the crisp spiral ', ' of an ancient sea shell!', 'imprint', ['recipe', 'ticket', 'melody'], 'Fossils leave an imprint pressed into rock!'),
  mStory('s2-10', 'Brave Squirrel', 'The acorn sat on the thinnest tip of the swaying branch. Squirrel crept forward ', ' so he would not slip.', 'cautiously', ['loudly', 'sleepily', 'brightly'], 'Cautiously means moving carefully to stay safe!'),
  mStory('s2-11', 'Kitchen Chemistry', 'When Ava poured vinegar into the baking soda cup, foamy white bubbles immediately began to ', ' over the rim!', 'fizz', ['freeze', 'nap', 'whisper'], 'Baking soda + vinegar fizzes with gas bubbles!'),
  mStory('s2-12', 'Forgotten Umbrella', 'The morning sky was clear, so Ben left his raincoat home. By afternoon, dark storm clouds made him ', ' his choice.', 'regret', ['celebrate', 'invent', 'paint'], 'Regret means wishing you had made a different choice!'),
  mStory('s2-13', 'Library Mystery', 'Only the final chapter remained in the detective book. Eli flipped the page ', ' to find out who took the golden key!', 'eagerly', ['boredly', 'slowly', 'coldly'], 'Eagerly means excited and unable to wait!'),
  mStory('s2-14', 'Teamwork Win', 'The wooden log was way too heavy for one camper to lift alone. Together, all four kids ', ' it off the trail.', 'carried', ['forgot', 'whispered', 'dropped'], 'Working together lets a team carry something heavy!'),
  mStory('s2-15', 'Desert Cactus', 'Rain rarely falls in the blazing desert, yet a saguaro cactus survives because its thick stem ', ' water inside.', 'stores', ['spills', 'melts', 'throws'], 'Cacti store water inside their stems for dry months!'),
  mStory('s2-16', 'Wind Chimes', 'Whenever a gentle breeze blew across the porch, the silver tubes clinked together in a peaceful ', '.', 'melody', ['storm', 'shadow', 'ladder'], 'Wind chimes play a gentle musical melody!'),
  mStory('s2-17', 'Soccer Twins', 'The twin brothers packed ', ' soccer cleats and water bottles before heading to the field.', 'their', ['there', "they're", 'them'], 'THEIR shows ownership (the cleats belong to them)!'),
  mStory('s2-18', 'Giant Pumpkin', 'All summer long, Grandma watered and tended the garden vine. By October, the pumpkin had grown truly ', '!', 'enormous', ['invisible', 'silent', 'narrow'], 'A pumpkin growing all summer becomes enormous!'),
  mStory('s2-19', 'Night Telescope', 'Using the backyard telescope, Zoe spotted four tiny moons orbiting around ', ' Jupiter.', 'distant', ['nearby', 'noisy', 'wooden'], 'Jupiter is millions of miles away — distant!'),
  mStory('s2-20', 'Bridge Test', 'Max stacked heavy hardcover books onto his popsicle-stick bridge one by one. Even with six books, it stayed ', '!', 'sturdy', ['fragile', 'melted', 'sleepy'], 'Sturdy means strong enough to hold heavy weight!'),
  mStory('s2-21', 'Fishing Trip', 'Every summer Kai fishes at the lake; last July he ', ' three shiny trout in the same pond!', 'caught', ['catched', 'catching', 'catch'], 'The past tense of catch is CAUGHT!'),
  mStory('s2-22', 'Secret Map', 'Following the dotted line on the pirate map led right past the hollow oak tree to a buried wooden ', '.', 'chest', ['cloud', 'whisper', 'hour'], 'Treasure maps lead to a buried wooden chest!'),
  mStory('s2-23', 'Snowy Tracks', 'Fresh snow covered the backyard overnight. In the morning, tiny four-toed ', ' led straight to the bird feeder.', 'footprints', ['rainbows', 'echoes', 'blankets'], 'Animals leave footprints in fresh snow!'),
  mStory('s2-24', 'Patient Painter', 'Rushing made the watercolors bleed together. Taking a breath, Lila waited for the blue layer to ', ' before adding yellow stars.', 'dry', ['boil', 'bounce', 'shrink'], 'Letting watercolor dry prevents colors from bleeding!'),
  mStory('s2-25', 'Compass Trick', 'Even when we spun around in a circle on the hiking trail, the red needle of the compass kept pointing ', '.', 'north', ['purple', 'sweet', 'loud'], 'A magnetic compass needle always points north!'),
  mStory('s2-26', 'Busy Ant', 'Though the breadcrumb was twice its own size, the determined ant ', ' it all the way back to the anthill.', 'hauled', ['sang', 'dreamed', 'poured'], 'Hauled means pulled or carried something heavy!'),
  mStory('s2-27', 'Mirror Lake', 'There was not a single ripple of wind on the mountain lake. The water was so still it ', ' the snowy peaks like glass.', 'reflected', ['melted', 'folded', 'chased'], 'Still water reflects mountains like a mirror!'),
  mStory('s2-28', 'Loose Tooth', 'Every time Sam bit into a crisp apple, his front tooth wiggled a bit more. At dinner, it finally ', ' out!', 'popped', ['swam', 'grew', 'flew'], 'A loose baby tooth pops out!'),
  mStory('s2-29', 'Glowing Fireflies', 'As twilight darkened the meadow, dozens of tiny golden lights began to ', ' above the tall grass.', 'flicker', ['roar', 'sink', 'freeze'], 'Fireflies flicker on and off in the dusk!'),
  mStory('s2-30', 'Sharing Snacks', 'Nora noticed her friend had forgotten lunch. Without hesitating, she ', ' her turkey sandwich right in half.', 'split', ['hid', 'painted', 'forgot'], 'Splitting a sandwich in half is a kind way to share!'),
  mStory('s2-31', 'Magnifying Glass', 'Holding the glass lens close to the maple leaf, Toby could suddenly see hundreds of tiny ', ' running through it.', 'veins', ['wheels', 'clouds', 'bells'], 'Leaves have intricate veins carrying water!'),
  mStory('s2-32', 'Sunlit Greenhouse', 'Outside, frost coated the lawn. Inside the glass greenhouse, the air felt warm and ', ' for the tropical ferns.', 'humid', ['icy', 'brittle', 'loud'], 'Greenhouses stay warm and humid for plants!'),
];

// Tier 3 (Challenger, Ages 9–10): 32 micro-mysteries & science vignettes (connectives & inference)
const TIER3_STORIES = [
  mStory('s3-01', 'The Wet Doormat', 'The hallway window was locked tight, yet muddy pawprints led from the back porch to the kitchen. ', ', the dog must have slipped in when the back door opened!', 'Therefore', ['Although', 'Unless', 'Meanwhile'], '"Therefore" connects clues to a logical conclusion!'),
  mStory('s3-02', 'Solar Eclipse', 'At noon, the sky suddenly dimmed like twilight and crickets began to chirp. ', ' the Moon had moved directly in front of the Sun, daylight returned minutes later.', 'Although', ['Because', 'So', 'Finally'], '"Although" introduces a surprising contrast between two facts!'),
  mStory('s3-03', 'Hollow Log Clue', 'The hikers heard rapid tapping high up in the dead pine tree. Looking up with binoculars, they spotted a red-headed woodpecker ', ' for beetles beneath the bark.', 'foraging', ['hibernating', 'evaporating', 'orbiting'], 'Foraging means searching for wild food!'),
  mStory('s3-04', 'The Extra Step', 'Amina’s robot kept turning left whenever it hit a wall instead of stopping. She read every line of code carefully to ', ' the bug.', 'isolate', ['decorate', 'multiply', 'applaud'], 'Isolate means pinpointing the exact cause of a problem!'),
  mStory('s3-05', 'Rain Shadow', 'Moist ocean winds climb the western side of the mountain and drop heavy rain. ', ', the eastern valley on the far side stays dry and desert-like.', 'Consequently', ['Meanwhile', 'Otherwise', 'Instead'], '"Consequently" shows a direct cause-and-effect result!'),
  mStory('s3-06', 'Museum Mystery', 'The ancient clay bowl was missing its handle, yet faint paint lines remained around the rim. Archaeologists studied those marks to ', ' what the whole pattern once looked like.', 'reconstruct', ['erase', 'abandon', 'disguise'], 'Re- (again) + construct (build) = piece back together!'),
  mStory('s3-07', 'Deep Ocean Glow', 'Sunlight cannot reach two miles below the ocean surface. Many deep-sea creatures survive in total darkness by creating their own ', ' glow.', 'bioluminescent', ['transparent', 'magnetic', 'evaporated'], 'Bio (life) + lumen (light) = living light!'),
  mStory('s3-08', 'Bridge Tension', 'A triangle holds its shape firmly when pushed, ', ' a plain square frame easily leans sideways into a diamond.', 'whereas', ['because', 'therefore', 'after'], '"Whereas" highlights a crisp contrast between two shapes!'),
  mStory('s3-09', 'The Silent Violin', 'Everyone expected the tiny violin to sound weak in the giant concert hall. ', ', its clear notes floated all the way to the back balcony!', 'However', ['Therefore', 'Because', 'Similarly'], '"However" signals an unexpected twist!'),
  mStory('s3-10', 'Seed Travelers', 'Dandelion seeds have feathery white parachutes attached to them. This clever design helps the wind ', ' them miles away from the parent plant.', 'disperse', ['anchor', 'freeze', 'compress'], 'Disperse means scattering widely in different directions!'),
  mStory('s3-11', 'Clockwork Puzzle', 'Turning the small gear clockwise forced the bigger gear next to it to spin in the ', ' direction.', 'opposite', ['identical', 'vertical', 'random'], 'Meshed gears always turn in opposite directions!'),
  mStory('s3-12', 'Migrating Geese', 'Flying in a V-formation lets each goose ride the upward lift of air from the bird ahead. This smart teamwork helps the flock ', ' energy over thousands of miles.', 'conserve', ['waste', 'ignite', 'ignore'], 'Conserve means saving a resource carefully!'),
  mStory('s3-13', 'Ice Float', 'Most solids sink in their own liquid, yet ice cubes float right on top of water. That happens because water actually ', ' slightly when it freezes!', 'expands', ['shrinks', 'evaporates', 'dissolves'], 'Water expands as it freezes, making ice less dense so it floats!'),
  mStory('s3-14', 'Compass vs. Magnet', 'When Devon accidentally set a strong bar magnet right next to his compass, the needle swung wildly off course. The magnet had ', ' with Earth’s weaker magnetic pull.', 'interfered', ['cooperated', 'vanished', 'balanced'], 'Interfered means disrupting or getting in the way!'),
  mStory('s3-15', 'Patient Chess', 'Instead of grabbing the first pawn he saw, Marcus paused to look three moves ahead. His ', ' saved his queen from a sneaky trap.', 'foresight', ['haste', 'forgetfulness', 'noise'], 'Fore (before) + sight = looking ahead before acting!'),
  mStory('s3-16', 'Saltwater Experiment', 'The raw egg sank straight to the bottom of fresh tap water. After stirring in four spoonfuls of salt, the egg ', ' right up to the surface!', 'floated', ['vanished', 'hardened', 'cracked'], 'Salt makes water denser, boosting buoyancy so the egg floats!'),
  mStory('s3-17', 'Echo Canyon', 'Sound waves travel quickly through air, yet it still took two full seconds to hear our shout bounce back from the cliff. The canyon wall must have been quite ', '.', 'distant', ['hollow', 'narrow', 'silent'], 'A 2-second echo delay proves the cliff is far away!'),
  mStory('s3-18', 'Moonlit Shoreline', 'In the morning our beach towel sat far from the waves, yet by 3 PM water lapped at our shoes. The Moon’s gravity was pulling the ocean into high ', '.', 'tide', ['orbit', 'friction', 'altitude'], 'The Moon’s gravity drives daily ocean tides!'),
  mStory('s3-19', 'Fossil Leaves', 'Scientists discovered fossilized palm leaves buried in icy Antarctica. This surprising evidence proves Antarctica once had a much ', ' climate millions of years ago.', 'warmer', ['stormier', 'darker', 'drier'], 'Palm trees only thrive in warm climates!'),
  mStory('s3-20', 'Paper Bridge', 'A flat sheet of paper sagged under a single coin. Once Priya folded it back and forth like an accordion, the ridges made it strong enough to ', ' twenty coins!', 'support', ['dissolve', 'bend', 'scatter'], 'Corrugated folds dramatically increase load support!'),
  mStory('s3-21', 'Obsidian Mirror', 'When fiery lava cools almost instantly in cold air or water, crystals do not have time to form. The result is obsidian — a rock as smooth and shiny as dark ', '.', 'glass', ['sponge', 'chalk', 'cotton'], 'Rapidly cooled lava forms natural volcanic glass (obsidian)!'),
  mStory('s3-22', 'Secret Cipher', 'In the spy note, every letter had been shifted forward by one spot ("CAT" became "DBU"). Once Elena spotted the rule, she quickly ', ' the whole message.', 'decoded', ['erased', 'scrambled', 'invented'], 'Decoded means turning a secret code back into plain text!'),
  mStory('s3-23', 'Nocturnal Owls', 'Owls have fringed wing feathers that break up rushing air. This special design makes their flight almost completely ', ' as they glide through the dark.', 'silent', ['colorful', 'clumsy', 'heavy'], 'Fringed feathers muffle air noise for silent flight!'),
  mStory('s3-24', 'Rotting Log', 'A fallen oak log might look lifeless, yet mushrooms, moss, and beetles slowly break the wood down into rich soil. In a forest, even decay helps ', ' new life.', 'nourish', ['freeze', 'block', 'flatten'], 'Decomposers recycle nutrients that nourish new plants!'),
  mStory('s3-25', 'Scale Model', 'A real blue whale is nearly 100 feet long — way too huge for the classroom! So the students built a 1-to-20 scale ', ' that was 5 feet long.', 'replica', ['fossil', 'shadow', 'diagram'], 'A replica is a faithful scaled model of a real object!'),
  mStory('s3-26', 'Storm Barometer', 'Even before dark clouds appeared on the horizon, the captain noticed air pressure dropping fast on the gauge. He ordered the crew to ', ' the sails ahead of the storm.', 'secure', ['unfold', 'paint', 'ignore'], 'Dropping air pressure warns of storms, so crews secure sails!'),
  mStory('s3-27', 'Tree Rings', 'Counting the rings inside a fallen tree trunk tells its age. Extra-wide rings show years with plenty of rain, while super-thin rings reveal years of ', '.', 'drought', ['flooding', 'sunshine', 'wind'], 'Thin tree rings mean slow growth during dry drought years!'),
  mStory('s3-28', 'Prism Surprise', 'Plain white sunlight looks colorless at first glance. Passing a narrow beam through a glass prism ', ' it into every color of the rainbow!', 'splits', ['erases', 'darkens', 'freezes'], 'A prism bends each wavelength differently, splitting white light!'),
  mStory('s3-29', 'Chameleon Myth', 'Many people think chameleons only change color to hide. Scientists discovered they also shift hues to regulate body heat and ', ' their moods to other chameleons.', 'signal', ['forget', 'measure', 'hide'], 'Color shifts act as visual signals between chameleons!'),
  mStory('s3-30', 'Pendulum Rhythm', 'Adding a heavier marble to the string did not change how fast the pendulum swung back and forth. Only shortening the string made each swing noticeably ', '.', 'quicker', ['heavier', 'quieter', 'crooked'], 'A pendulum’s period depends on string length, not weight!'),
  mStory('s3-31', 'Beekeeper Dance', 'When a scout honeybee discovers a patch of clover, she performs a figure-eight waggle dance inside the hive. The angle of her dance ', ' the exact direction of the flowers!', 'communicates', ['conceals', 'cancels', 'forgets'], 'The waggle dance communicates distance and direction!'),
  mStory('s3-32', 'Arch Strength', 'Ancient Roman stone bridges still stand after two thousand years. Their curved arches push downward weight outward into thick stone pillars, making them remarkably ', '.', 'durable', ['delicate', 'temporary', 'hollow'], 'Durable means built to last a very long time!'),
];

// Tier 4 (Trailblazer, Ages 11+): 32 science, history & logic micro-passages (zero title spoilers, same-register choices!)
const TIER4_STORIES = [
  mStory('s4-01', 'July Ice Cream', 'Ice cream sales and sunburn cases both spike sharply in July. ', ', eating ice cream does not cause sunburn — hot summer weather drives both!', 'Nevertheless', ['Therefore', 'Consequently', 'Similarly'], '"Nevertheless" introduces a vital logical counterpoint!'),
  mStory('s4-02', 'Double-Blind Trial', 'When researchers know which volunteers received real medicine, subtle cues can skew observations. To preserve objectivity, trials keep both doctors and patients ', ' of group assignments.', 'uninformed', ['convinced', 'skeptical', 'partial'], 'Double-blind trials keep both sides uninformed to prevent unconscious bias!'),
  mStory('s4-03', 'Pollinator Ripple', 'When wild bee numbers dipped in the valley, apple yields fell sharply the very next autumn. The ecosystem proved far more ', ' than farmers had realized.', 'interdependent', ['autonomous', 'immutable', 'redundant'], 'Inter- (between) + dependent = species relying on one another!'),
  mStory('s4-04', 'Three Scripts in Stone', 'For centuries, Egyptian hieroglyphs remained unreadable. Because the Rosetta Stone carved the exact same royal decree in three scripts, scholars could finally ', ' the ancient symbols.', 'decipher', ['fabricate', 'obscure', 'amend'], 'Decipher means cracking an unknown writing system!'),
  mStory('s4-05', 'Adobe Walls', 'Thick earthen walls absorb intense desert heat all afternoon and release it slowly overnight. ', ', the rooms inside stay surprisingly cool by day and mild after sunset.', 'Consequently', ['Conversely', 'Nevertheless', 'Otherwise'], '"Consequently" links cause (thermal mass) to effect (stable indoor temp)!'),
  mStory('s4-06', 'The Sugar Tonic', 'Half the tired athletes reported feeling energized after drinking plain sugar water they believed was a recovery elixir. Expectation alone produced a measurable ', ' effect.', 'placebo', ['doppler', 'catalyst', 'kinetic'], 'The placebo effect happens when belief itself creates real perceived improvement!'),
  mStory('s4-07', 'Riverbank Revival', 'Reintroducing wolves to Yellowstone kept grazing elk moving away from riverbanks. Soon willows regrew, beavers returned, and rivers narrowed — proving wolves acted as a ', ' species.', 'keystone', ['invasive', 'dormant', 'nomadic'], 'A keystone species holds an entire ecosystem’s balance together!'),
  mStory('s4-08', 'Occam’s Razor', 'Two theories explained the flickering sensor readings: one required three rare coincidences, while the other blamed a single loose wire. Scientists tested the wire first because the simpler explanation was more ', '.', 'plausible', ['elaborate', 'obscure', 'arbitrary'], 'Plausible means reasonable and likely given the evidence!'),
  mStory('s4-09', 'Map Distortion', 'Flattening a round globe onto a rectangular map always stretches shapes near the poles. On a Mercator map, Greenland looks as huge as Africa, ', ' Africa is actually fourteen times larger!', 'whereas', ['therefore', 'because', 'moreover'], '"Whereas" highlights a stark factual contrast!'),
  mStory('s4-10', 'Hardy Microbes', 'If a patient stops taking antibiotics early, the toughest bacteria survive and multiply. Over decades, this evolutionary pressure makes once-routine infections harder to ', '.', 'eradicate', ['propagate', 'emulate', 'induce'], 'Eradicate means completely eliminating a disease or pest!'),
  mStory('s4-11', 'Movable Type', 'Before Gutenberg’s press, copying a single book by hand took months. Affordable printing made books widely available, rapidly ', ' the spread of science and literacy across Europe.', 'accelerating', ['curtailing', 'stifling', 'deferring'], 'Accelerating means dramatically speeding up!'),
  mStory('s4-12', 'Three-Friend Poll', 'Asking only three friends their favorite book tells you little about a whole school of 600 students. A tiny sample is rarely ', ' of the entire population.', 'representative', ['exclusive', 'conclusive', 'unanimous'], 'A representative sample fairly reflects the larger group!'),
  mStory('s4-13', 'Sudden Brakes', 'When a bus brakes sharply, passengers lurch forward even though nothing pushed them from behind. Their bodies simply maintained their forward motion due to ', '.', 'inertia', ['friction', 'refraction', 'buoyancy'], 'Inertia is an object’s tendency to keep its current state of motion!'),
  mStory('s4-14', 'Firsthand Flight Log', 'A modern textbook summarizes the 1969 Moon landing, whereas Neil Armstrong’s own flight log is a ', ' source recorded at the moment history unfolded.', 'primary', ['secondary', 'derivative', 'speculative'], 'Primary sources are firsthand records from the time itself!'),
  mStory('s4-15', 'Kingfisher Express', 'Early bullet trains caused loud sonic booms exiting tunnels. Engineers reshaped the nose after a kingfisher’s sleek beak, which dives with almost zero splash — a triumph of ', '.', 'biomimicry', ['cartography', 'metallurgy', 'taxonomy'], 'Bio (life) + mimicry = engineering inspired by nature!'),
  mStory('s4-16', 'Echo Chamber', 'If a feed only recommends videos matching views you already hold, you rarely encounter fresh perspectives. Over time, this narrows curiosity inside an informational ', '.', 'filter bubble', ['open forum', 'peer review', 'case study'], 'A filter bubble limits exposure to diverse viewpoints!'),
  mStory('s4-17', 'Matching Coastlines', 'The coastlines of South America and Africa fit like puzzle pieces, and matching fossils span both shores. Together, these independent lines of evidence ', ' continental drift.', 'corroborate', ['contradict', 'invalidate', 'obstruct'], 'Corroborate means multiple independent clues supporting a theory!'),
  mStory('s4-18', 'Scratchpad Advantage', 'Memorizing twelve random digits while solving an equation overwhelms short-term memory. Offloading intermediate steps onto paper prevents cognitive ', '.', 'overload', ['retention', 'synthesis', 'fluency'], 'Offloading steps frees working memory from overload!'),
  mStory('s4-19', 'The Silent Tray', 'Maya tested whether classical music helped bean sprouts grow faster. To be sure sunlight or water wasn’t the real cause, she kept an identical silent tray as her ', ' group.', 'control', ['variable', 'experimental', 'hypothesis'], 'A control group provides the baseline for fair comparison!'),
  mStory('s4-20', 'The Two-Hour Trap', 'Leo disliked the video game after ten minutes, yet kept playing for two hours solely because he had already spent his allowance on it. Economists call that trap the ', ' fallacy.', 'sunk-cost', ['compound', 'opportunity', 'equilibrium'], 'The sunk-cost fallacy clings to a bad choice because of past cost!'),
  mStory('s4-21', 'Midnight Glow', 'Blue light from screens late at night tricks the brain into thinking it is still midday, suppressing melatonin and ', ' the onset of restful sleep.', 'impeding', ['inducing', 'sustaining', 'regulating'], 'Late blue light impedes (delays/blocks) the body’s sleep signal!'),
  mStory('s4-22', 'Forty-Two Folds', 'Folding a sheet of paper in half doubles its thickness each time. Because doubling compounds so fast, 42 imaginary folds would grow ', ' enough to reach the Moon!', 'exponentially', ['gradually', 'linearly', 'uniformly'], 'Doubling at every step creates explosive exponential growth!'),
  mStory('s4-23', 'Missing Data', 'Looking only at planes that landed safely showed bullet holes in the wings, not the engines. Statistician Abraham Wald realized armor belonged on the engines — planes struck there had never ', ' to be counted!', 'returned', ['attempted', 'maneuvered', 'ascended'], 'Missing data from unseen failures is classic survivorship bias!'),
  mStory('s4-24', 'Coral Partners', 'Microscopic algae live inside coral polyps, converting sunlight into sugars for the coral while the coral shelters the algae. Both organisms thrive in a ', ' relationship.', 'mutualistic', ['parasitic', 'predatory', 'commensal'], 'Mutualistic symbiosis actively benefits BOTH partners!'),
  mStory('s4-25', 'Interest on Interest', 'Even modest savings grow dramatically over thirty years when interest earns interest on itself. Time transforms steady deposits into ', ' growth.', 'exponential', ['linear', 'static', 'cyclical'], 'Compounding creates curved exponential growth!'),
  mStory('s4-26', 'Frame of Reference', 'Seen from the sidelines, a runner’s tossed ball traces a graceful parabolic arc; ', ', from the runner’s own hands it simply rises straight up and drops straight back down.', 'conversely', ['therefore', 'consequently', 'furthermore'], '"Conversely" switches to the opposite frame of reference!'),
  mStory('s4-27', 'Invisible Dragons', 'A claim like "invisible dragons live in my garage and leave zero detectable traces" cannot be tested by any observation. True scientific hypotheses must be ', '.', 'falsifiable', ['unanimous', 'perpetual', 'plausible'], 'Science requires predictions that could in principle be proven wrong!'),
  mStory('s4-28', 'Playground Swing', 'Pushing someone on a swing works best when each push matches the swing’s natural rhythm. Timing energy to that exact natural frequency builds ', '.', 'resonance', ['resistance', 'turbulence', 'inertia'], 'Resonance amplifies motion when pushes match natural frequency!'),
  mStory('s4-29', 'Unlucky Tuesdays', 'After deciding Tuesday is always unlucky, Sam remembered every spilled drink on Tuesdays while effortlessly forgetting smooth Tuesdays. His mind was falling for ', ' bias.', 'confirmation', ['measurement', 'anchoring', 'hindsight'], 'Confirmation bias selectively notices evidence that agrees with an existing belief!'),
  mStory('s4-30', 'The Placeholder Breakthrough', 'Roman numerals lacked a symbol for zero, making multi-digit arithmetic painfully cumbersome. Indian mathematicians’ place-value zero ', ' calculation worldwide.', 'revolutionized', ['perpetuated', 'impeded', 'standardized'], 'Place-value zero revolutionized arithmetic and modern computing!'),
  mStory('s4-31', 'Arctic Ice Loop', 'Bright white Arctic ice reflects most sunlight back into space, keeping polar regions cool. As ice melts into dark ocean water, the sea absorbs more heat, ', ' further warming.', 'amplifying', ['mitigating', 'stabilizing', 'neutralizing'], 'Positive feedback loops amplify an initial change!'),
  mStory('s4-32', 'Twenty-Four Jams', 'Shoppers offered six jam flavors were far more likely to buy a jar happily than shoppers faced with twenty-four nearly identical options. Too many choices can trigger decision ', '.', 'paralysis', ['precision', 'momentum', 'consensus'], 'Too many competing choices can freeze decision-making (paralysis)!'),
];

export function generateSession(tier = 1, profile = null) {
  const bank = tier === 1 ? TIER1_STORIES : tier === 2 ? TIER2_STORIES : tier === 3 ? TIER3_STORIES : TIER4_STORIES;
  const scopeKey = `story-detective:${tier}`;
  let chosen;

  if (profile) {
    chosen = selectSpacedWords(bank, profile, 5, (it) => `sd:${it.id}`);
  } else {
    const recent = getRecentPuzzleSigs(null, scopeKey);
    const fresh = bank.filter((it) => !recent.includes(it.id));
    const pool = fresh.length >= 5 ? fresh : bank;
    chosen = shuffle(pool).slice(0, 5);
    recordRecentPuzzleSigs(null, scopeKey, chosen.map((it) => it.id), 20);
  }

  return chosen.map((item) => {
    const shuffledOptions = shuffle(item.options);
    return {
      ...item,
      tier,
      wordKey: `sd:${item.id}`,
      shuffledOptions,
      prompt: 'Read the mini-story and pick the missing word!',
      speakPrompt: `${item.title}. ${item.before} blank ${item.after}. Choices: ${shuffledOptions.join(', ')}.`,
      strategyTip: item.tip,
    };
  });
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

  const card = document.createElement('div');
  card.className = 'story-page-card';
  card.innerHTML = `
    <span class="game-pillar-tag wordcraft">${round.title}</span>
    <p class="story-body">
      ${round.before}<span class="inline-blank" id="sd-blank">______</span>${round.after}
    </p>
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
        const blank = card.querySelector('#sd-blank');
        if (blank) {
          blank.textContent = opt;
          blank.classList.add('filled-answer');
        }
        if (callbacks.profile) {
          recordWordAttempt(callbacks.profile, round.wordKey, !hadMistake);
        }
        callbacks.onCorrect(!hadMistake, `Case solved! ${round.tip}`);
      } else {
        hadMistake = true;
        btn.classList.add('is-wrong');
        btn.disabled = true;
        callbacks.onRetry(`Re-read the clue in the story: ${round.tip}`);
      }
    });
    grid.appendChild(btn);
  });

  wrap.appendChild(card);
  wrap.appendChild(grid);
  container.appendChild(wrap);
}
