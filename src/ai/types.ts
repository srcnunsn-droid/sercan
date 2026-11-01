// One AIProvider interface, three implementations. Claude is optional: the Mock engine always answers.
export type TaskName =
  | 'generateExercise' | 'evaluatePrompt' | 'suggestIdeas' | 'writeStoryPlan' | 'dialogueDoctor'
  | 'continuityAudit' | 'diagnoseResult' | 'translateToEnglish' | 'tutor' | 'draftModelCard';

export interface AIProvider {
  id: 'claude-artifact' | 'api-key' | 'mock';
  labelTr: string;
  available(): Promise<boolean>;
  /** Ask for JSON. Implementations must reject on failure; the task runner handles retry/fallback. */
  json(prompt: string, opts?: { signal?: AbortSignal; quick?: boolean; images?: Blob[] }): Promise<unknown>;
}

export interface EvalResult { score: number; boxes: Record<string, boolean>; reasonsTr: string[]; suggestionEn: string; suggestionTr: string }
export interface Idea { titleTr: string; hookTr: string; whyTr: string; effort: 'kolay' | 'orta' | 'zor' }
export interface TranslateResult { en: string }
export interface TutorResult { answerTr: string; followUpTr: string }
export interface StoryPlan { parts: { beat: string; sceneTr: string; sceneEn: string; dialogueTr: string; camera: string }[] }
export interface DialogueFix { lineTr: string; lineEn: string; words: number; notesTr: string[] }
