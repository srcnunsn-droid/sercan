import React from 'react';
import {Composition, Still} from 'remotion';
import {StyleClock, StyleHarbor} from './StyleFrames';
import {Main} from './Main';
import {DURATION_S} from './timeline';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main} width={1920} height={1080} fps={30} durationInFrames={Math.round(DURATION_S * 30)} />
    <Still id="StyleHarbor" component={StyleHarbor} width={1920} height={1080} defaultProps={{variant: 'dawn' as const}} />
    <Still id="StyleClock" component={StyleClock} width={1920} height={1080} />
  </>
);
