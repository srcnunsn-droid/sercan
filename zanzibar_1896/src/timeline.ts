// Gerçek seslendirme kaydından ölçülen zamanlar (work/timeline.json → src/data/timeline.json)
import tl from './data/timeline.json';
export const DURATION_S: number = tl.duration;
const byId: Record<string, {start: number; end: number; text: string; section: string}> = {};
for (const s of tl.segments) byId[s.id] = s;
/** segment başlangıcı (sn) */
export const S = (id: string) => byId[id].start;
/** segment bitişi (sn) */
export const E = (id: string) => byId[id].end;
export const SEGMENTS = tl.segments;
