import { getWordList, type WordlistLanguage } from './wordlist';

export function generatePassphrase(
  wordCount: number = 4,
  separator: string = '-',
  language: WordlistLanguage = 'en',
): string {
  const wordList = getWordList(language);
  const array = new Uint32Array(wordCount);
  window.crypto.getRandomValues(array);

  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const wordIndex = array[i] % wordList.length;
    words.push(wordList[wordIndex]);
  }

  return words.join(separator);
}
