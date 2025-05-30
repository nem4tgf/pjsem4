export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Vocabulary {
  wordId?: number;
  word: string;
  meaning: string;
  exampleSentence?: string;
  pronunciation?: string;
  audioUrl?: string;
  writingPrompt?: string;
  difficultyLevel: DifficultyLevel;
}
