export interface WordPhoneme {
  id: number;
  symbol: string;
  position: number;
}

export interface ActivityWord {
  id: number;
  english: string;
  hint: string | null;
  phonemes: WordPhoneme[];
}

export interface Activity {
  id: number;
  title: string;
  type: string;
  difficulty: number;
  words: ActivityWord[];
  createdAt: string;
  updatedAt: string;
}
