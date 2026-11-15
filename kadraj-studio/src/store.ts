import { create } from 'zustand';
import { produce, type Draft } from 'immer';
import type { Brush, Panel, Project, Tool } from './types';
import { newProject } from './util';
import { saveProject, kvSet } from './db';

interface UI {
  panel: Panel; graph: boolean; tool: Tool; maskId: string | null; maskPt: number; brush: Brush; selected: string[]; time: number; playing: boolean; pxPerSec: number; snap: boolean; toast: string; loop: boolean;
}
interface S extends UI {
  project: Project;
  past: Project[]; future: Project[];
  set: (fn: (d: Draft<Project>) => void, merge?: boolean) => void;
  replace: (p: Project) => void;
  undo: () => void; redo: () => void;
  ui: (u: Partial<UI>) => void;
  notify: (m: string) => void;
}

export const historyHooks: { after: (from: Project, to: Project) => void } = { after: () => {} };
let lastMergeAt = 0;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
function autosave(p: Project) { clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveProject(p); kvSet('lastProject', p.id); }, 600); }

export const useS = create<S>((setS, get) => ({
  project: newProject(), past: [], future: [],
  panel: 'idea', graph: false, tool: 'select', maskId: null, maskPt: -1, brush: { color: '#ff4d6d', size: 40, hardness: 0.7, opacity: 1 }, selected: [], time: 0, playing: false, pxPerSec: 60, snap: true, toast: '', loop: false,
  set: (fn, merge = false) => {
    const prev = get().project;
    const next = produce(prev, d => { fn(d); d.updated = Date.now(); });
    if (next === prev) return;
    const now = Date.now();
    const doMerge = merge && now - lastMergeAt < 800; lastMergeAt = merge ? now : 0;
    setS(s => ({ project: next, past: doMerge ? s.past : [...s.past.slice(-120), prev], future: [] }));
    autosave(next);
  },
  replace: p => { setS({ project: p, past: [], future: [], selected: [], time: 0 }); autosave(p); },
  undo: () => { const { past, project, future } = get(); if (!past.length) return; const p = past[past.length - 1]; setS({ project: p, past: past.slice(0, -1), future: [project, ...future] }); historyHooks.after(project, p); autosave(p); },
  redo: () => { const { past, project, future } = get(); if (!future.length) return; const p = future[0]; setS({ project: p, past: [...past, project], future: future.slice(1) }); historyHooks.after(project, p); autosave(p); },
  ui: u => setS(u),
  notify: m => { setS({ toast: m }); setTimeout(() => get().toast === m && setS({ toast: '' }), 2600); },
}));

export const S = () => useS.getState();
