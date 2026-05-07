const CONSONANTS = 'bcdfghjklmnprstvwz';
const VOWELS = 'aeiouy';

export function getPronounceableEntropyBits(length: number = 10): number {
  if (length <= 0) {
    return 0;
  }

  const firstPatternConsonants = Math.ceil(length / 2);
  const firstPatternVowels = Math.floor(length / 2);
  const secondPatternConsonants = Math.floor(length / 2);
  const secondPatternVowels = Math.ceil(length / 2);

  const combinations =
    Math.pow(CONSONANTS.length, firstPatternConsonants) * Math.pow(VOWELS.length, firstPatternVowels) +
    Math.pow(CONSONANTS.length, secondPatternConsonants) * Math.pow(VOWELS.length, secondPatternVowels);

  return Math.log2(combinations);
}

export function generatePronounceable(length: number = 10): string {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = '';
  // Start randomly with vowel or consonant
  let isVowel = array[0] % 2 === 0;

  for (let i = 0; i < length; i++) {
    if (isVowel) {
      password += VOWELS[array[i] % VOWELS.length];
    } else {
      password += CONSONANTS[array[i] % CONSONANTS.length];
    }
    // Alternate
    isVowel = !isVowel;
  }

  // Capitalize first letter occasionally or format based on length
  // Keeping it fully lowercase makes it easier to read
  return password;
}
