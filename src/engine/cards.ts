import { MODEL_CARDS, type ModelCard } from '../content';
export const CARD_FALLBACK = (id?: string): ModelCard => MODEL_CARDS.find((c) => c.id === id) ?? MODEL_CARDS[0];
export const cardMax = (id?: string) => CARD_FALLBACK(id).maxRefs;
