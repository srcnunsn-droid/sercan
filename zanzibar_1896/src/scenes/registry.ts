import React from 'react';
import {Etki, Taht} from './PalaceScenes';
import {Power, Ultimatum} from './Ultimatum';
import {Bombard, Losses} from './Bombard';
import {Final, Rule} from './Final';
import {S} from '../timeline';
export const SCENES_EXTRA: {from: number; to: number; C: React.FC<{t: number}>}[] = [
  {from: S('s12') - 1.2, to: 82.3, C: Etki},
  {from: 82.0, to: 132.7, C: Taht},
  {from: 132.0, to: 188.7, C: Ultimatum},
  {from: 188.5, to: 232.4, C: Power},
  {from: 232.27, to: 265.9, C: Bombard},
  {from: 265.6, to: 291.3, C: Losses},
  {from: 290.5, to: 345.1, C: Rule},
  {from: 344.4, to: 9999, C: Final},
];
