const CONSONANTS = 'bcdfghjklmnprstvwz';
const VOWELS = 'aeiouy';

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
