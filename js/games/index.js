/**
 * Central Registry of the 4 Evidence-Backed Pillars and 8 Mini-Games.
 */

import * as cubeArchitect from './cubeArchitect.js';
import * as shapeShifter from './shapeShifter.js';
import * as numberLine from './numberLine.js';
import * as factStudio from './factStudio.js';
import * as balanceLab from './balanceLab.js';
import * as ruleSwitcher from './ruleSwitcher.js';
import * as wordBuilder from './wordBuilder.js';
import * as wordConnections from './wordConnections.js';

export const PILLARS = [
  {
    id: 'visualize',
    name: 'Visualize',
    tagline: '3D blocks, symmetry & rotation (proven transfer to math!)',
  },
  {
    id: 'compute',
    name: 'Compute',
    tagline: 'Linear number sense, fractions & strategy-first math fluency',
  },
  {
    id: 'analyze',
    name: 'Analyze',
    tagline: 'Pre-algebraic balance scales, rule switching & logic patterns',
  },
  {
    id: 'wordcraft',
    name: 'WordCraft',
    tagline: 'Phonics, compounds, Greek/Latin roots & rich word connections',
  },
];

export const GAMES = [
  cubeArchitect,
  shapeShifter,
  numberLine,
  factStudio,
  balanceLab,
  ruleSwitcher,
  wordBuilder,
  wordConnections,
];

export function getGameById(gameId) {
  return GAMES.find((g) => g.meta.id === gameId) || GAMES[0];
}
