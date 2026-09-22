export type Phoneme = {
  symbol: string;
  label: string;
  example: string;
};

export const phonemes: Phoneme[] = [
  // Consonants
  { symbol: "p", label: "P", example: "pat" },
  { symbol: "b", label: "B", example: "bat" },
  { symbol: "t", label: "T", example: "top" },
  { symbol: "d", label: "D", example: "dog" },
  { symbol: "k", label: "K", example: "kite" },
  { symbol: "g", label: "G", example: "go" },
  { symbol: "m", label: "M", example: "man" },
  { symbol: "n", label: "N", example: "no" },
  { symbol: "ŋ", label: "NG", example: "sing" },
  { symbol: "f", label: "F", example: "fun" },
  { symbol: "v", label: "V", example: "van" },
  { symbol: "θ", label: "TH", example: "thin" },
  { symbol: "ð", label: "TH", example: "this" },
  { symbol: "s", label: "S", example: "sit" },
  { symbol: "z", label: "Z", example: "zoo" },
  { symbol: "ʃ", label: "SH", example: "ship" },
  { symbol: "ʒ", label: "ZH", example: "vision" },
  { symbol: "h", label: "H", example: "hat" },
  { symbol: "tʃ", label: "CH", example: "chin" },
  { symbol: "dʒ", label: "J", example: "jam" },
  { symbol: "l", label: "L", example: "leg" },
  { symbol: "r", label: "R", example: "red" },
  { symbol: "w", label: "W", example: "wet" },
  { symbol: "j", label: "Y", example: "yes" },
  
  // 1. Short Vowels
  { symbol: "æ", label: "A", example: "cat" },
  { symbol: "ɛ", label: "E", example: "bed" },
  { symbol: "ɪ", label: "I", example: "sit" },
  { symbol: "ɒ", label: "O", example: "dog" },
  { symbol: "ʌ", label: "U", example: "sun" },
  { symbol: "ʊ", label: "OO", example: "book" },
  { symbol: "ə", label: "UH", example: "about" }, // Schwa? (idk what that sounds like)

  // 2. Long Vowels
  { symbol: "ɑː", label: "AH", example: "arm" },
  { symbol: "iː", label: "EE", example: "see" },
  { symbol: "ɔː", label: "OR", example: "saw" },
  { symbol: "uː", label: "OO", example: "moon" },
  { symbol: "ɜː", label: "ER", example: "bird" },

  // 3. Diphthongs (Gliding or Extended Length Vowels)
  { symbol: "aɪ", label: "AY", example: "pie" },
  { symbol: "eɪ", label: "AI", example: "face" },
  { symbol: "ɔɪ", label: "OY", example: "boy" },
  { symbol: "aʊ", label: "OW", example: "now" },
  { symbol: "əʊ", label: "OH", example: "go" },
  { symbol: "ɪə", label: "EAR", example: "near" },
  { symbol: "eə", label: "AIR", example: "hair" },
  { symbol: "ʊə", label: "CURE", example: "tour" }

];
