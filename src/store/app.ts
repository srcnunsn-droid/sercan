import { create } from 'zustand';
import type { GraphFix, Part, Progress, Project } from '../model/types';
import { defaultProgress, sampleProject, emptyProject } from '../model/factory';
import { migrateProject } from '../model/migrate';
import { cloud, local, makeSaver, type CloudStatus } from '../lib/storage';
import { today } from '../lib/text';
import { ALL_LESSONS } from '../content';
import { PROVIDERS } from '../ai/providers';
import type { AIProvider } from '../ai/types';

export type Route = 'home' | 'academy' | 'studio' | 'factory' | 'library' | 'settings';
export const ROUTES: Route[] = ['home', 'academy', 'studio', 'factory', 'library', 'settings'];
export type Theme = 'dark' | 'light' | 'system';
// claude.ai reserves some hash names (e.g. #settings), so routes use their own ASCII Turkish slugs.
export const ROUTE_HASH: Record<Route, string> = { home: 'ana-sayfa', academy: 'akademi', studio: 'studyo', factory: 'fabrika', library: 'kutuphane', settings: 'ayarlar' };
export const routeFromHash = (h: string): Route | null => (Object.entries(ROUTE_HASH).find(([, v]) => v === h)?.[0] as Route) ?? null;

export const RANKS = [
  { id: 'cirak', tr: 'Çırak', min: 0 },
  { id: 'kalfa', tr: 'Kalfa', min: 300 },
  { id: 'usta', tr: 'Usta', min: 900 },
  { id: 'yonetmen', tr: 'Yönetmen', min: 2000 },
];
export const rankOf = (xp: number) => [...RANKS].reverse().find((r) => xp >= r.min)!;
export const nextRank = (xp: number) => RANKS.find((r) => r.min > xp) ?? null;

interface Toast { id: number; text: string; kind: 'ok' | 'info' | 'warn' | 'celebrate' }

interface State {
  route: Route;
  theme: Theme;
  providerId: AIProvider['id'];
  cloudStatus: CloudStatus;
  saveState: 'saved' | 'saving' | 'idle';
  paletteOpen: boolean;
  toasts: Toast[];

  projects: Project[];
  currentId: string;
  past: Project[];
  future: Project[];

  progress: Progress;
  activeLessonId: string | null;
  cardId: string;

  go(r: Route): void;
  setTheme(t: Theme): void;
  setProvider(id: AIProvider['id']): void;
  setCard(id: string): void;
  togglePalette(open?: boolean): void;
  toast(text: string, kind?: Toast['kind']): void;

  project(): Project;
  edit(label: string, recipe: (p: Project) => void): void;
  editPart(index: number, recipe: (part: Part) => void): void;
  applyFix(fix: GraphFix): void;
  undo(): void;
  redo(): void;
  newProject(title?: string, template?: string): void;
  openProject(id: string): void;
  importProject(json: unknown): void;
  deleteProject(id: string): void;

  openLesson(id: string | null): void;
  addXp(n: number, reason?: string): void;
  completeLesson(id: string): void;
  unlockLesson(id: string): void;
  recordRuleHits(ids: string[]): void;
  toggleFavorite(catalogId: string): void;

  hydrateFromCloud(): Promise<void>;
}

const saver = makeSaver(700);
const clone = <T,>(x: T): T => structuredClone(x);

function initialProjects(): Project[] {
  const stored = local.get<unknown[]>('projects');
  if (stored && Array.isArray(stored) && stored.length) {
    const out: Project[] = [];
    for (const p of stored) { try { out.push(migrateProject(p)); } catch { /* skip broken */ } }
    if (out.length) return out;
  }
  return [sampleProject()];
}

const initial = initialProjects();
const initialUi = local.get<{ theme?: Theme; providerId?: AIProvider['id']; currentId?: string; route?: Route; cardId?: string }>('ui') ?? {};

export const useApp = create<State>()((set, get) => {
  const persistProjects = () => {
    set({ saveState: 'saving' });
    saver('projects', get().projects, (ok) => set({ saveState: 'saved', cloudStatus: ok ? 'cloud' : get().cloudStatus === 'checking' ? 'local' : get().cloudStatus }));
    setTimeout(() => { if (get().saveState === 'saving') set({ saveState: 'saved' }); }, 900);
  };
  const persistUi = () => { const s = get(); local.set('ui', { theme: s.theme, providerId: s.providerId, currentId: s.currentId, route: s.route, cardId: s.cardId }); };
  const persistProgress = () => saver('progress', get().progress);
  const replaceCurrent = (next: Project) => set((s) => ({ projects: s.projects.map((p) => (p.id === next.id ? next : p)) }));

  return {
    route: initialUi.route ?? 'home',
    theme: initialUi.theme ?? 'system',
    providerId: initialUi.providerId ?? 'claude-artifact',
    cloudStatus: 'checking',
    saveState: 'idle',
    paletteOpen: false,
    toasts: [],
    projects: initial,
    currentId: initial.some((p) => p.id === initialUi.currentId) ? initialUi.currentId! : initial[0].id,
    past: [],
    future: [],
    progress: { ...defaultProgress(), ...(local.get<Progress>('progress') ?? {}) },
    activeLessonId: null,
    cardId: initialUi.cardId ?? 'seedance-2',

    go(route) { set({ route, paletteOpen: false }); persistUi(); try { history.replaceState(null, '', '#' + ROUTE_HASH[route]); } catch { /* ignore */ } },
    setTheme(theme) { set({ theme }); persistUi(); },
    setProvider(providerId) { set({ providerId }); persistUi(); },
    setCard(cardId) { set({ cardId }); persistUi(); },
    togglePalette(open) { set((s) => ({ paletteOpen: open ?? !s.paletteOpen })); },
    toast(text, kind = 'info') {
      const id = Date.now() + Math.random();
      set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, kind }] }));
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), kind === 'celebrate' ? 4200 : 2800);
    },

    project() { const s = get(); return s.projects.find((p) => p.id === s.currentId) ?? s.projects[0]; },
    edit(_label, recipe) {
      const cur = get().project();
      const next = clone(cur);
      recipe(next);
      next.updatedAt = Date.now();
      set((s) => ({ past: [...s.past.slice(-99), cur], future: [] }));
      replaceCurrent(next);
      persistProjects();
    },
    editPart(index, recipe) { get().edit('part', (p) => { const part = p.parts[index]; if (part) recipe(part); }); },
    applyFix(fix) {
      get().edit('fix', (p) => {
        switch (fix.type) {
          case 'light-direction': p.parts[fix.partIndex].light.direction = fix.direction; break;
          case 'light-kelvin': p.parts[fix.partIndex].light.kelvin = fix.kelvin; break;
          case 'copy-light': p.parts[fix.to].light = clone(p.parts[fix.from].light); break;
          case 'perspective': p.parts[fix.partIndex].camera.perspective = fix.perspective; if (fix.framing) p.parts[fix.partIndex].camera.framing = fix.framing; break;
          case 'motion': p.parts[fix.partIndex].camera.motion = fix.motion; break;
          case 'mask': p.parts[fix.partIndex].characters[fix.charIndex].mask = fix.mask; break;
        }
      });
      get().toast('Düzeltme uygulandı. Geri almak için Ctrl+Z.', 'ok');
    },
    undo() {
      const { past, future } = get();
      const prev = past[past.length - 1];
      if (!prev) return;
      const cur = get().project();
      set({ past: past.slice(0, -1), future: [cur, ...future], currentId: prev.id });
      replaceCurrent(prev);
      persistProjects();
    },
    redo() {
      const { past, future } = get();
      const nxt = future[0];
      if (!nxt) return;
      const cur = get().project();
      set({ past: [...past, cur], future: future.slice(1), currentId: nxt.id });
      replaceCurrent(nxt);
      persistProjects();
    },
    newProject(title, template) {
      const p = emptyProject(title, template);
      set((s) => ({ projects: [p, ...s.projects], currentId: p.id, past: [], future: [] }));
      persistProjects(); persistUi();
    },
    openProject(id) { set({ currentId: id, past: [], future: [] }); persistUi(); },
    importProject(json) {
      const p = migrateProject(json);
      const exists = get().projects.some((x) => x.id === p.id);
      if (exists) p.id = p.id + '_kopya';
      set((s) => ({ projects: [p, ...s.projects], currentId: p.id, past: [], future: [] }));
      persistProjects(); persistUi();
    },
    deleteProject(id) {
      set((s) => {
        const projects = s.projects.filter((p) => p.id !== id);
        const safe = projects.length ? projects : [sampleProject()];
        return { projects: safe, currentId: s.currentId === id ? safe[0].id : s.currentId, past: [], future: [] };
      });
      persistProjects(); persistUi();
    },

    openLesson(id) { set({ activeLessonId: id }); },
    addXp(n, reason) {
      const before = get().progress;
      const d = today();
      const yesterday = today(new Date(Date.now() - 86_400_000));
      const streak = before.lastDay === d ? before.streak : before.lastDay === yesterday ? before.streak + 1 : 1;
      const progress = { ...before, xp: before.xp + n, lastDay: d, streak };
      set({ progress });
      persistProgress();
      const r0 = rankOf(before.xp); const r1 = rankOf(progress.xp);
      if (r1.id !== r0.id) get().toast(`Yeni rütbe: ${r1.tr}! 🎬`, 'celebrate');
      else if (reason) get().toast(`+${n} XP · ${reason}`, 'ok');
    },
    completeLesson(id) {
      const p = get().progress;
      if (p.completedLessons.includes(id)) return;
      const badges = [...p.badges];
      const modId = id.split('.')[0];
      const modLessons = ALL_LESSONS.filter((l) => l.id.startsWith(modId + '.'));
      const done = [...p.completedLessons, id];
      if (modLessons.every((l) => done.includes(l.id)) && !badges.includes(`badge.${modId}`)) badges.push(`badge.${modId}`);
      set({ progress: { ...p, completedLessons: done, badges } });
      persistProgress();
    },
    // Topic lock: the next lesson opens only when the learner says "başla".
    unlockLesson(id) {
      const p = get().progress;
      if (p.unlockedLessons.includes(id)) return;
      set({ progress: { ...p, unlockedLessons: [...p.unlockedLessons, id] } });
      persistProgress();
    },
    recordRuleHits(ids) {
      if (!ids.length) return;
      const p = get().progress;
      const ruleHits = { ...p.ruleHits };
      for (const id of ids) ruleHits[id] = (ruleHits[id] ?? 0) + 1;
      set({ progress: { ...p, ruleHits } });
      persistProgress();
    },
    toggleFavorite(catalogId) {
      const p = get().progress;
      const favorites = p.favorites.includes(catalogId) ? p.favorites.filter((f) => f !== catalogId) : [...p.favorites, catalogId];
      set({ progress: { ...p, favorites } });
      persistProgress();
    },

    async hydrateFromCloud() {
      const ok = await cloud.available();
      if (!ok) { set({ cloudStatus: 'local' }); return; }
      set({ cloudStatus: 'cloud' });
      const [projects, progress] = await Promise.all([cloud.get<unknown[]>('projects'), cloud.get<Progress>('progress')]);
      if (projects && Array.isArray(projects.value) && projects.value.length) {
        const localNewest = Math.max(0, ...get().projects.map((p) => p.updatedAt));
        const migrated: Project[] = [];
        for (const p of projects.value) { try { migrated.push(migrateProject(p)); } catch { /* skip */ } }
        if (migrated.length && projects.updatedAt >= localNewest) {
          set((s) => ({ projects: migrated, currentId: migrated.some((p) => p.id === s.currentId) ? s.currentId : migrated[0].id }));
          local.set('projects', migrated);
        }
      }
      if (progress?.value && progress.value.xp >= get().progress.xp) {
        set({ progress: { ...defaultProgress(), ...progress.value } });
        local.set('progress', get().progress);
      }
    },
  };
});

export const currentProvider = (): AIProvider => PROVIDERS.find((p) => p.id === useApp.getState().providerId) ?? PROVIDERS[2];
