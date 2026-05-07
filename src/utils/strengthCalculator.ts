export type Strength = 'Weak' | 'Medium' | 'Strong' | 'Very Strong' | 'Compromised';

// Parola güç değerlendirmesi için uyarı kodları
export type StrengthWarningCode =
  | 'shortLength'
  | 'datePattern'
  | 'yearPattern'
  | 'personalInfo'
  | 'commonPattern'
  | 'keyboardPattern'
  | 'shiftPattern'
  | 'sequencePattern'
  | 'repetitionPattern'
  | 'repeatingBlockPattern';

export interface StrengthResult {
  score: number; // 0 ile 4 arası puanlama (0: Weak, 1: Weak, 2: Medium, 3: Strong, 4: Very Strong)
  label: Strength;
  color: string;
  compromised?: boolean; // HIBP kontrol sonucu
  warnings?: StrengthWarningCode[];
}

// Parola güç değerlendirmesi için ek seçenekler (kullanıcı bağlamı)
export interface StrengthOptions {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface PasswordEntropyContext {
  source: 'manual' | 'generated';
  baseEntropyBits?: number;
}

// Parolaları zayıflatan yaygın kalıplar
const COMMON_PATTERNS = [
  'password', 'pass123', '123456', '12345678', 'qwerty', 'abc123',
  'password123', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
  '111111', '123123', 'admin', 'root', 'passw0rd', 'shadow',
];

// Klavye kalıpları
const KEYBOARD_PATTERNS = [
  'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'qweasd', 'asdfghjkl',
  '1234567890', 'qwertyuiop', 'qwertyu', 'asdfg',
];

// Klavye kalıplarının Shift tuşlu varyasyonları
const SHIFT_PATTERNS = [
  '!@#$%', '!@#$%^&*()', '@werty', 'QWERTY', 'ASDFGH',
  '~!@#$%^', 'qweasdzxc', 'qweasd', 'zxcvbnm',
];

// Tespit edilecek diziler (harf, sayı vb.)
function hasSequences(password: string): number {
  let sequenceCount = 0;
  const lowerPassword = password.toLowerCase();

  // Art arda gelen 3+ sıralı karakteri tespit et
  for (let i = 0; i < lowerPassword.length - 2; i++) {
    const char0 = lowerPassword.charCodeAt(i);
    const char1 = lowerPassword.charCodeAt(i + 1);
    const char2 = lowerPassword.charCodeAt(i + 2);

    // İleri yönlü sıra
    if (char1 === char0 + 1 && char2 === char0 + 2) {
      sequenceCount += 2;
    }
    // Geri yönlü sıra
    if (char1 === char0 - 1 && char2 === char0 - 2) {
      sequenceCount += 2;
    }
  }

  return sequenceCount;
}

// Tekrarları tespit et (arka arkaya 3+ aynı karakter)
function hasRepetitions(password: string): number {
  let repetitionCount = 0;

  for (let i = 0; i < password.length - 2; i++) {
    if (
      password[i] === password[i + 1] &&
      password[i + 1] === password[i + 2]
    ) {
      repetitionCount += 2;
    }
  }

  return repetitionCount;
}

// Ardışık tekrar eden kalıpları tespit et (örneğin: "1212", "abab", "123123")
function hasConsecutiveRepeatingPatterns(password: string): number {
  let penaltyCount = 0;
  const lowerPassword = password.toLowerCase();

  for (let i = 0; i < lowerPassword.length - 3;) {
    let matchedPattern = false;
    const maxPatternLength = Math.floor((lowerPassword.length - i) / 2);

    for (let patternLen = 2; patternLen <= maxPatternLength; patternLen++) {
      const pattern = lowerPassword.substring(i, i + patternLen);
      let repeatCount = 1;
      let cursor = i + patternLen;

      while (
        cursor + patternLen <= lowerPassword.length &&
        lowerPassword.substring(cursor, cursor + patternLen) === pattern
      ) {
        repeatCount += 1;
        cursor += patternLen;
      }

      if (repeatCount >= 2) {
        penaltyCount += 3 + (repeatCount - 2);
        i = cursor;
        matchedPattern = true;
        break;
      }
    }

    if (!matchedPattern) {
      i += 1;
    }
  }

  return penaltyCount;
}

// Paroladaki yaygın tarih biçimlerini tespit et (örneğin: "25051990", "25/05/1990", "1990-05-25")
function hasDatePatterns(password: string): boolean {
  // Yaygın tarih biçimleri: DDMMYYYY, DD/MM/YYYY, DD-MM-YYYY, YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD
  const datePatterns = [
    /\b(0?[1-9]|[12][0-9]|3[01])([-/]?)(0?[1-9]|1[0-2])\2(19|20)\d{2}\b/gi, // DD-MM-YYYY veya benzeri
    /\b(19|20)\d{2}([-/]?)(0?[1-9]|1[0-2])\2(0?[1-9]|[12][0-9]|3[01])\b/gi, // YYYY-MM-DD veya benzeri
    /\b(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])(19|20)\d{2}\b/g, // DDMMYYYY
    /\b(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\b/g, // YYYYMMDD
  ];

  return datePatterns.some(pattern => pattern.test(password));
}

// Leetspeak ve yaygın karakter dönüşümlerini normalleştir
function normalizeLeetspeak(password: string): string {
  const leetMap: Record<string, string> = {
    '@': 'a', '4': 'a', // @ = a, 4 = a
    '8': 'b', // 8 = b
    '(': 'c', '©': 'c', // ( = c
    '3': 'e', // 3 = e
    '6': 'g', // 6 = g
    '#': 'h', // # = h
    '1': 'i', '!': 'i', // 1, ! = i
    '0': 'o', // 0 = o
    '9': 'q', // 9 = q
    '$': 's', '5': 's', // $, 5 = s
    '+': 't', '7': 't', // +, 7 = t
    '/': 'v', // / = v
    '><': 'x', // >< = x
    '2': 'z', // 2 = z
  };

  let normalized = password.toLowerCase();
  
  // Leetspeak için regex kullanmadan basit karakter değiştirme
  for (const [leet, char] of Object.entries(leetMap)) {
    normalized = normalized.split(leet).join(char);
  }
  return normalized;
}

// Yıl son eklerini/öneklerini tespit et (örneğin: "Fenerbahce1907", "Istanbul2024")
function hasYearSuffix(password: string): boolean {
  return /(19|20)\d{2}/.test(password);
}

// Parolanın kullanıcının kişisel bilgilerini içerip içermediğini kontrol et
function checkUserContextViolation(password: string, options?: StrengthOptions): boolean {
  if (!options) return false;

  const lowerPassword = password.toLowerCase();
  const userInfo = [
    options.username,
    options.firstName,
    options.lastName,
    options.email?.split('@')[0], // e-posta öneki
  ].filter(Boolean) as string[];

  for (const info of userInfo) {
    const lowerInfo = info.toLowerCase();
    // Doğrudan eşleşmeyi kontrol et
    if (lowerPassword.includes(lowerInfo)) {
      return true;
    }
    // Ters çevrilmiş eşleşmeyi kontrol et
    if (lowerPassword.includes(lowerInfo.split('').reverse().join(''))) {
      return true;
    }
  }

  return false;
}

// HIBP API için SHA-1 karma yardımcı fonksiyonu (k-anonimlik modeli)
async function hashPasswordSHA1(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Parolanın HIBP API üzerinden ele geçirilip geçirilmediğini kontrol etttirme kısmı
export async function checkPwnedPassword(password: string): Promise<boolean> {
  try {
    const hash = await hashPasswordSHA1(password);
    const prefix = hash.substring(0, 5); // Sadece ilk 5 karakteri gönder
    const suffix = hash.substring(5);


    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    // API hatası
    if (!response.ok) {
      console.warn('HIBP API error:', response.status);
      return false;
    }

    const text = await response.text();
    const hashes = text.split('\r\n');

    // Sonekimizin yanıtta olup olmadığını kontrol et
    for (const line of hashes) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix === suffix) {
        return true; // Parola ihlal veritabanında bulundu
      }
    }

    return false; // Parola bulunamadı
  } catch (error) {
    console.error('HIBP check failed:', error);
    return false; // Hata durumunda ele geçirilmemiş varsay
  }
}

function getObservedPoolSize(password: string): number {
  let poolSize = 0;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;

  return poolSize || 1;
}

function getBaseEntropy(password: string, entropyContext?: PasswordEntropyContext): number {
  if (entropyContext?.source === 'generated' && typeof entropyContext.baseEntropyBits === 'number') {
    return Math.max(0, entropyContext.baseEntropyBits);
  }

  return password.length * Math.log2(getObservedPoolSize(password));
}

function getPatternEntropyCap(password: string, warningSet: Set<StrengthWarningCode>): number | null {
  let cap: number | null = null;

  const applyCap = (nextCap: number) => {
    cap = cap === null ? nextCap : Math.min(cap, nextCap);
  };

  if (warningSet.has('shortLength')) applyCap(18);
  if (warningSet.has('datePattern')) applyCap(16);
  if (warningSet.has('yearPattern')) applyCap(18);
  if (warningSet.has('personalInfo')) applyCap(18);

  if (
    warningSet.has('commonPattern') ||
    warningSet.has('keyboardPattern') ||
    warningSet.has('shiftPattern')
  ) {
    applyCap(password.length <= 12 ? 20 : 45);
  }

  return cap;
}

function getStrengthLabel(adjustedEntropy: number, warningSet: Set<StrengthWarningCode>): StrengthResult {
  if (warningSet.has('shortLength')) {
    return { score: 0, label: 'Weak', color: 'bg-destructive', warnings: [...warningSet] };
  }

  if (adjustedEntropy < 40) {
    return { score: 1, label: 'Weak', color: 'bg-destructive', warnings: [...warningSet] };
  }

  if (adjustedEntropy < 60) {
    return { score: 2, label: 'Medium', color: 'bg-yellow-500', warnings: [...warningSet] };
  }

  if (adjustedEntropy < 80) {
    return { score: 3, label: 'Strong', color: 'bg-green-500', warnings: [...warningSet] };
  }

  return { score: 4, label: 'Very Strong', color: 'bg-primary', warnings: [...warningSet] };
}

function analyzePassword(password: string, options?: StrengthOptions, entropyContext?: PasswordEntropyContext) {
  const warningSet = new Set<StrengthWarningCode>();

  // NIST Guideline: Minimum 8 characters (< 8 is inherently weak)
  if (password.length < 8) {
    warningSet.add('shortLength');
  }

  if (hasDatePatterns(password)) {
    warningSet.add('datePattern');
  }

  if (hasYearSuffix(password)) {
    warningSet.add('yearPattern');
  }

  if (checkUserContextViolation(password, options)) {
    warningSet.add('personalInfo');
  }

  const normalizedPassword = normalizeLeetspeak(password);
  const lowerPassword = password.toLowerCase();

  const hasCommon = COMMON_PATTERNS.some(pattern => 
    normalizedPassword.includes(pattern) || lowerPassword.includes(pattern)
  );

  const hasKeyboard = KEYBOARD_PATTERNS.some(pattern => 
    normalizedPassword.includes(pattern) || lowerPassword.includes(pattern)
  );

  const hasShift = SHIFT_PATTERNS.some(pattern => 
    password.includes(pattern) || lowerPassword.includes(pattern)
  );

  if (hasCommon) warningSet.add('commonPattern');
  if (hasKeyboard) warningSet.add('keyboardPattern');
  if (hasShift) warningSet.add('shiftPattern');

  const baseEntropy = getBaseEntropy(password, entropyContext);

  const sequencePenalty = hasSequences(password) * 5; // 5 bits per sequence found
  const repetitionPenalty = hasRepetitions(password) * 4; // 4 bits per repetition found
  const consecutiveRepeatingPenalty = hasConsecutiveRepeatingPatterns(password); // Extra penalty for repeating patterns

  if (sequencePenalty > 0) warningSet.add('sequencePattern');
  if (repetitionPenalty > 0) warningSet.add('repetitionPattern');
  if (consecutiveRepeatingPenalty > 0) warningSet.add('repeatingBlockPattern');

  let adjustedEntropy = Math.max(
    0,
    baseEntropy - sequencePenalty - repetitionPenalty - consecutiveRepeatingPenalty
  );

  const entropyCap = getPatternEntropyCap(password, warningSet);
  if (entropyCap !== null) {
    adjustedEntropy = Math.min(adjustedEntropy, entropyCap);
  }

  return {
    baseEntropy,
    adjustedEntropy,
    warningSet,
  };
}

export function calculateStrength(
  password: string,
  options?: StrengthOptions,
  entropyContext?: PasswordEntropyContext
): StrengthResult {
  if (!password) {
    return { score: 0, label: 'Weak', color: 'bg-destructive', warnings: [] };
  }

  const { adjustedEntropy, warningSet } = analyzePassword(password, options, entropyContext);
  return getStrengthLabel(adjustedEntropy, warningSet);
}

// Entropi ayrıntılarını ve farklı saldırgan hızları için tahmini kırılma sürelerini hesapla
export function computeEntropyDetails(
  password: string,
  options?: StrengthOptions,
  entropyContext?: PasswordEntropyContext
) {
  const { baseEntropy, adjustedEntropy } = analyzePassword(password, options, entropyContext);

  // Tahmini deneme sayısı: 2^entropi
  const guesses = Math.pow(2, adjustedEntropy);

  // Saldırı hızları (saniyedeki deneme sayısı)
  // Hızlar, GRC tarzı kategorileri yaklaşık temsil edecek şekilde seçildi
  const speeds: Record<string, number> = {
    // Saatte yaklaşık 100 deneme (kısıtlanmış çevrimiçi hizmet)
    online_throttled: 100 / 3600,
    // Saniyede yaklaşık 10 deneme (çok sayıda IP üzerinden kısıtlanmamış çevrimiçi)
    online_unthrottled: 10,
    // ~10 bin/sn (tek CPU, yavaş çevrimdışı)
    offline_slow: 1e4,
    // ~100 milyon/sn (GPU kümesi - yaygın GRC benzeri tablolara uyacak şekilde ayarlandı)
    offline_gpu: 1e8,
    // ~10 milyar/sn (çok büyük dağıtık/çevrimdışı küme)
    offline_highend: 1e10,
  };

  const crackTimes: Record<string, number> = {};
  for (const [k, v] of Object.entries(speeds)) {
    crackTimes[k] = guesses / v; // saniye
  }

  return { baseEntropy, adjustedEntropy, guesses, crackTimes };
}

// Parolanın belirli karakter türlerini içerip içermediğini kontrol et
export interface PasswordCompliance {
  meetsRequirements: boolean;
  missingTypes: string[];
}

export function checkPasswordCompliance(
  password: string,
  requirements: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  }
): PasswordCompliance {
  const missingTypes: string[] = [];

  if (requirements.uppercase && !/[A-Z]/.test(password)) {
    missingTypes.push('uppercase');
  }

  if (requirements.lowercase && !/[a-z]/.test(password)) {
    missingTypes.push('lowercase');
  }

  if (requirements.numbers && !/[0-9]/.test(password)) {
    missingTypes.push('numbers');
  }

  if (requirements.symbols && !/[^A-Za-z0-9]/.test(password)) {
    missingTypes.push('symbols');
  }

  return {
    meetsRequirements: missingTypes.length === 0,
    missingTypes,
  };
}
