// Ana zaman çizelgesi: tüm sahneler gerçek seslendirme zamanlarına bağlıdır (src/data/timeline.json).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {Fonts, Finish} from './components/Base';
import {Opening} from './scenes/Opening';
import {MapScenes} from './scenes/MapScenes';
import {SCENES_EXTRA} from './scenes/registry';

export const SCENES: {from: number; to: number; C: React.FC<{t: number}>}[] = [
  {from: 0, to: 26.05, C: Opening},
  {from: 26.0, to: 60.2, C: MapScenes},
  ...SCENES_EXTRA,
];

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{background: C.nightDeep}}>
      <Fonts />
      {SCENES.filter((s) => t >= s.from && t < s.to).map((s, i) => (
        <AbsoluteFill key={i}>
          <s.C t={t} />
        </AbsoluteFill>
      ))}
      <Finish />
    </AbsoluteFill>
  );
};
