import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts, Finish, Title} from './components/Base';
import {Harbor} from './components/Harbor';
import {Clock, R_DIAL} from './components/Clock';
import {C} from './theme';

export const StyleHarbor: React.FC<{variant: 'dawn' | 'bombard' | 'final' | 'line'}> = ({variant}) => (
  <AbsoluteFill style={{background: C.night}}>
    <Fonts />
    {variant === 'dawn' && <Harbor t={3} />}
    {variant === 'line' && <AbsoluteFill style={{background: C.night}}><Harbor t={3} lineArt={1} /></AbsoluteFill>}
    {variant === 'bombard' && <Harbor t={14} damage={1.1} sky="smoke" burnSmoke={1} burnStart={0} fire={0.5} />}
    {variant === 'final' && <Harbor t={20} damage={2} flag={0} sky="calm" burnSmoke={0.3} burnStart={0} glasgowSink={1} />}
    <Finish />
  </AbsoluteFill>
);

export const StyleClock: React.FC = () => (
  <AbsoluteFill style={{background: C.nightDeep}}>
    <Fonts />
    <Clock t={2} minutes={8 * 60 + 40} dateRot={-40} dialChildren={
      <div style={{position: 'absolute', left: R_DIAL - 960, top: R_DIAL - 540, width: 1920, height: 1080, transform: 'scale(0.62)', transformOrigin: '960px 540px'}}>
        <Harbor t={2} cam={{x: 1150, y: 600, z: 1}} />
      </div>
    } />
    <Finish />
  </AbsoluteFill>
);
