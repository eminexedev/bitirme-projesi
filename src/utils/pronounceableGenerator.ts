const CONSONANTS = 'bcdfghjklmnprstvwz';
const VOWELS = 'aeiouy';


// Verilen uzunlukta telaffuz edilebilir bir parola oluşturur ve tahmin edilebilirlik için entropi hesaplar
export function getPronounceableEntropyBits(length: number = 10): number {
  if (length <= 0) {
    return 0;
  }


  const firstPatternConsonants = Math.ceil(length / 2);
  const firstPatternVowels = Math.floor(length / 2);
  const secondPatternConsonants = Math.floor(length / 2);
  const secondPatternVowels = Math.ceil(length / 2);

  // Her iki desen için olası kombinasyon sayısını hesapla ve toplam kombinasyon sayısını log2 ile entropi bitlerine çevir
  const combinations =
    Math.pow(CONSONANTS.length, firstPatternConsonants) * Math.pow(VOWELS.length, firstPatternVowels) +
    Math.pow(CONSONANTS.length, secondPatternConsonants) * Math.pow(VOWELS.length, secondPatternVowels);

  return Math.log2(combinations);
}

// Telaffuz edilebilir bir parola oluşturur (sessiz ve ünlü harfleri sırayla kullanarak) 
export function generatePronounceable(length: number = 10): string {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  // İlk harfin sessiz mi ünlü mü olduğunu belirle (rastgele)
  let password = '';
  let isVowel = array[0] % 2 === 0;

  // Harfleri sırayla ekle (sessiz ve ünlü harfler arasında geçiş yaparak telaffuz edilebilir bir desen oluştur)
  for (let i = 0; i < length; i++) {
    if (isVowel) {
      password += VOWELS[array[i] % VOWELS.length];
    } else {
      password += CONSONANTS[array[i] % CONSONANTS.length];
    }
    // Her harften sonra sessiz ve ünlü harfler arasında geçiş yap ve böylece telaffuz edilebilir bir desen oluştur
    isVowel = !isVowel;
  }

  // Parolayı tamamen küçük harfe çevir (büyük harfler eklenmediği için zaten küçük harfler olacak, ancak bu adım okunabilirliği artırır)
  return password;
}
