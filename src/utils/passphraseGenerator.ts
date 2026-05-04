import { WORD_LIST } from './wordlist';

export function generatePassphrase(wordCount: number = 4, separator: string = '-'): string {
  const array = new Uint32Array(wordCount);
  window.crypto.getRandomValues(array);

  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const wordIndex = array[i] % WORD_LIST.length;
    words.push(WORD_LIST[wordIndex]);
  }

  return words.join(separator);
}
