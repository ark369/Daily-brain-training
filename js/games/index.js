/**
 * Central Registry of the 4 Evidence-Backed Pillars and 12 Mini-Games (3 per pillar).
 */

import * as cubeArchitect from './cubeArchitect.js';
import * as shapeShifter from './shapeShifter.js';
import * as shapeComposer from './shapeComposer.js';
import * as numberLine from './numberLine.js';
import * as factStudio from './factStudio.js';
import * as targetForge from './targetForge.js';
import * as balanceLab from './balanceLab.js';
import * as ruleSwitcher from './ruleSwitcher.js';
import * as clueGrid from './clueGrid.js';
import * as wordBuilder from './wordBuilder.js';
import * as wordConnections from './wordConnections.js';
import * as storyDetective from './storyDetective.js';

export const PILLARS = [
  {
    id: 'visualize',
    name: 'Visualize',
    tagline: '3D blocks, symmetry, rotation, mosaic tiling & cube nets',
  },
  {
    id: 'compute',
    name: 'Compute',
    tagline: 'Linear number sense, fractions, strategy fluency & target equations',
  },
  {
    id: 'analyze',
    name: 'Analyze',
    tagline: 'Balance algebra, function machines, rule switching & deduction grids',
  },
  {
    id: 'wordcraft',
    name: 'WordCraft',
    tagline: 'Phonics, roots, analogies, shades of meaning & story inference',
  },
];

export const GAMES = [
  cubeArchitect,
  shapeShifter,
  shapeComposer,
  numberLine,
  factStudio,
  targetForge,
  balanceLab,
  ruleSwitcher,
  clueGrid,
  wordBuilder,
  wordConnections,
  storyDetective,
];

export function getGameById(gameId) {
  return GAMES.find((g) => g.meta.id === gameId) || GAMES[0];
}
