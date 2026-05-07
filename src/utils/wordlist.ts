export type WordlistLanguage = 'en' | 'tr';

export const WORD_LISTS: Record<WordlistLanguage, string[]> = {
  en: [
    'apple', 'banana', 'orange', 'grape', 'melon', 'lemon', 'peach', 'berry', 'cherry', 'mango',
    'house', 'mouse', 'train', 'plane', 'plant', 'chair', 'table', 'phone', 'clock', 'watch',
    'river', 'ocean', 'cloud', 'storm', 'stone', 'water', 'flame', 'spark', 'light', 'shadow',
    'tiger', 'eagle', 'shark', 'whale', 'snake', 'horse', 'sheep', 'zebra', 'panda', 'koala',
    'music', 'dance', 'sound', 'voice', 'chord', 'piano', 'flute', 'drum', 'guitar', 'brass',
    'happy', 'brave', 'smart', 'quick', 'clean', 'fresh', 'sweet', 'sharp', 'quiet', 'proud',
    'green', 'black', 'white', 'brown', 'blue', 'yellow', 'purple', 'silver', 'gold', 'bronze',
    'dream', 'sleep', 'night', 'month', 'year', 'today', 'space', 'earth', 'world', 'orbit',
    'glass', 'metal', 'wood', 'paper', 'cloth', 'steel', 'brick', 'stone', 'sand', 'dust',
    'smile', 'laugh', 'cheer', 'shout', 'whisper', 'speak', 'think', 'learn', 'teach', 'write',
    'read', 'study', 'paint', 'draw', 'build', 'create', 'design', 'solve', 'guess', 'prove',
    'north', 'south', 'east', 'west', 'right', 'left', 'front', 'back', 'upper', 'lower',
    'heart', 'mind', 'soul', 'body', 'blood', 'bone', 'skin', 'hair', 'eye', 'face',
    'bread', 'cheese', 'milk', 'sugar', 'salt', 'spice', 'sauce', 'soup', 'meat', 'fish',
    'wheel', 'motor', 'engine', 'brake', 'pedal', 'gear', 'chain', 'belt', 'wire', 'cable',
    'lake', 'pond', 'pool', 'stream', 'creek', 'brook', 'gulf', 'bay', 'cove',
    'mountain', 'hill', 'valley', 'canyon', 'plain', 'desert', 'forest', 'jungle', 'swamp', 'marsh',
    'star', 'moon', 'sun', 'planet', 'comet', 'meteor', 'galaxy', 'nebula', 'cosmos', 'void',
    'spring', 'summer', 'autumn', 'winter', 'season', 'weather', 'climate', 'temp', 'degree', 'freeze',
    'book', 'page', 'word', 'letter', 'note', 'card', 'stamp', 'mail', 'post', 'sign',
  ],

  // Türkçe kelime listesi
  tr: [
    'kitap', 'defter', 'kalem', 'silgi', 'okul', 'sifre', 'guven', 'parola', 'yildiz', 'ay',
    'gunes', 'dunya', 'sehir', 'koy', 'orman', 'dag', 'vadi', 'nehir', 'gol', 'deniz',
    'bulut', 'yagmur', 'ruzgar', 'firtina', 'kar', 'buz', 'ates', 'isik', 'golge', 'ses',
    'muzik', 'sarki', 'ritim', 'melodi', 'dans', 'oyun', 'resim', 'cizim', 'renk', 'mavi',
    'yesil', 'sari', 'kirmizi', 'siyah', 'beyaz', 'gri', 'mor', 'turuncu', 'kahve', 'altin',
    'gumus', 'demir', 'bakir', 'tas', 'kum', 'toprak', 'cicek', 'yaprak', 'agac', 'bahce',
    'kapi', 'pencere', 'oda', 'ev', 'araba', 'otobus', 'tren', 'ucak', 'yol', 'köprü',
    'masa', 'sandalye', 'koltuk', 'lamba', 'telefon', 'saat', 'bilgisayar', 'ekran', 'klavye', 'fare',
    'kasa', 'banka', 'hesap', 'kart', 'madeni', 'kredi', 'para', 'makbuz', 'bilet', 'fatura',
    'mutfak', 'tabak', 'catal', 'bicak', 'kase', 'yemek', 'corba', 'ekmek', 'peynir', 'sut',
    'bal', 'seker', 'tuz', 'baharat', 'elma', 'armut', 'muz', 'uzum', 'portakal', 'limon',
    'kiraz', 'seftali', 'kayisi', 'cilek', 'karpuz', 'kavun', 'kaynak', 'not', 'liste', 'hedef',
    'basari', 'umut', 'hayal', 'dus', 'zaman', 'gun', 'hafta', 'aylik', 'yil', 'an',
    'kuzey', 'guney', 'dogu', 'bati', 'ileri', 'geri', 'ust', 'alt', 'orta', 'yan',
    'kalp', 'akil', 'ruh', 'beden', 'kan', 'kemik', 'cilt', 'sac', 'goz', 'yuz',
    'canta', 'anahtar', 'kilit', 'harita', 'adres', 'imza', 'posta', 'paket', 'damga', 'etiket',
    'sahil', 'kumsal', 'ada', 'liman', 'gemi', 'tekne', 'yildirim', 'isaret', 'hiz', 'denge',
  ],
};

export const WORD_LIST = WORD_LISTS.en;

// Belirli bir dil için kelime listesi döndürür (varsayılan olarak İngilizce kelimeleri kullanır)
export function getWordList(language: WordlistLanguage = 'en'): string[] {
  return WORD_LISTS[language] ?? WORD_LISTS.en;
}
