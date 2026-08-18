import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

// Anton = heavy condensed display (numbers, titles). Inter = clean body.
export const ANTON = loadAnton().fontFamily;
export const INTER = loadInter('normal', { weights: ['400', '600', '700', '900'] }).fontFamily;
