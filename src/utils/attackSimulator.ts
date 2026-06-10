export type AttackMethod = 'dictionary' | 'mask' | 'bruteForce' | 'notCracked';
export type AttackPhase = 'dictionary' | 'mask' | 'bruteForce';

// Bu modül, verilen bir parolaya karşı sözlük saldırısı, maske saldırısı ve kaba kuvvet saldırısı simüle eder. 
// Her aşamada ilerleme raporlaması yapılır ve sonuç olarak saldırının başarılı olup olmadığı, kullanılan yöntem, deneme sayısı, geçen süre, saniye başına deneme sayısı, tahmini tam arama süresi, aranan alan ve maksimum deneme sayısı gibi bilgiler döndürülür.
export interface AttackSimulationResult {
  cracked: boolean;
  method: AttackMethod;
  attempts: number;
  elapsedMs: number;
  attemptsPerSecond: number;
  estimatedFullSearchSeconds: number;
  searchedSpace: number;
  maxAttempts: number;
}

// Saldırı simülasyonu seçenekleri, maksimum deneme sayısı ve ilerleme raporlaması için bir geri çağırma fonksiyonu içerebilir.
export interface AttackProgress {
  phase: AttackPhase;
  attempts: number;
  elapsedMs: number;
  lastCandidate: string;
  currentLength?: number;
}

interface AttackSimulationOptions {
  maxAttempts?: number;
  onProgress?: (progress: AttackProgress) => void;
}

// Saldırı simülasyonu, verilen bir parolaya karşı çeşitli saldırı yöntemlerini kullanarak parolanın kırılmaya çalışılmasıdır.
// İlk olarak, sözlük saldırısı ile yaygın kelimeler ve bunların varyasyonları denenir. 
// Ardından, maske saldırısı ile yaygın kelimeler ve bunlara eklenen sayısal veya sembolik ekler denenir. 
// Son olarak, kaba kuvvet saldırısı ile gözlemlenen karakter seti kullanılarak tüm olası kombinasyonlar denenir. 
// Her aşamada ilerleme raporlaması yapılır ve sonuç olarak saldırının başarılı olup olmadığı, kullanılan yöntem, deneme sayısı, geçen süre, saniye başına deneme sayısı, tahmini tam arama süresi, aranan alan ve maksimum deneme sayısı gibi bilgiler döndürülür.
const dictionaryWords = [
  'password', '123456', '12345678', 'qwerty', 'admin', 'welcome', 'letmein',
  'monkey', 'dragon', 'master', 'root', 'user', 'login', 'test', 'secret',
  'istanbul', 'ankara', 'turkiye', 'securekey', 'fenerbahce', 'galatasaray',
  'besiktas', 'trabzonspor', 'askim', 'mehmet', 'ahmet', 'emre', 'ayse',
  'love', 'football', 'summer', 'winter', 'school', 'student', 'computer',
  'internet', 'security', 'parola', 'sifre', 'guvenlik', 'bitirme',
];

const dictionarySuffixes = ['', '1', '12', '123', '1234', '12345', '!', '!!', '@', '01', '00', '1907', '2024', '2025'];
const commonSymbols = '!@#$%^&*()-_=+[]{};:,.?/|~';
const defaultMaxAttempts = 2_000_000;

function waitForBrowser() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toLeetspeak(value: string) {
  return value
    .replaceAll('a', '@')
    .replaceAll('e', '3')
    .replaceAll('i', '1')
    .replaceAll('o', '0')
    .replaceAll('s', '$');
}

// Parolada gözlemlenen karakter setini belirler. 
// Küçük harfler, büyük harfler, rakamlar ve semboller için ayrı ayrı kontrol yapar ve bunları charset'e ekler. 
// Ayrıca, parolada bulunan ancak charset'te olmayan karakterleri de ekleyerek saldırı sırasında bu karakterlerin de denenmesini sağlar. 
// Eğer hiçbir karakter gözlemlenmezse, varsayılan olarak küçük harfleri içeren bir charset döndürür.
function getObservedCharset(password: string) {
  let charset = '';
  if (/[a-z]/.test(password)) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (/[A-Z]/.test(password)) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (/[0-9]/.test(password)) charset += '0123456789';
  if (/[^A-Za-z0-9]/.test(password)) charset += commonSymbols;

  for (const char of password) {
    if (!charset.includes(char)) charset += char;
  }

  return charset || 'abcdefghijklmnopqrstuvwxyz';
}

function getSearchSpace(charsetSize: number, maxLength: number) {
  let total = 0;

  for (let length = 1; length <= maxLength; length += 1) {
    total += charsetSize ** length;
  }

  return total;
}

function getWordVariants(word: string) {
  const lower = word.toLowerCase();

  return [...new Set([
    lower,
    lower.toUpperCase(),
    capitalize(lower),
    toLeetspeak(lower),
    capitalize(toLeetspeak(lower)),
  ])];
}

function indexToCandidate(index: number, length: number, charset: string) {
  let value = index;
  let candidate = '';

  for (let i = 0; i < length; i += 1) {
    candidate = charset[value % charset.length] + candidate;
    value = Math.floor(value / charset.length);
  }

  return candidate;
}

function buildProgress(
  phase: AttackPhase,
  attempts: number,
  startTime: number,
  lastCandidate: string,
  currentLength?: number,
) {
  return {
    phase,
    attempts,
    elapsedMs: Math.max(1, performance.now() - startTime),
    lastCandidate,
    currentLength,
  };
}

function finish(
  method: AttackMethod,
  attempts: number,
  startTime: number,
  searchedSpace: number,
  maxAttempts: number,
) {
  const elapsedMs = Math.max(1, performance.now() - startTime);
  const attemptsPerSecond = attempts / (elapsedMs / 1000);
  const estimatedFullSearchSeconds = searchedSpace / Math.max(1, attemptsPerSecond);

  return {
    cracked: method !== 'notCracked',
    method,
    attempts,
    elapsedMs,
    attemptsPerSecond,
    estimatedFullSearchSeconds,
    searchedSpace,
    maxAttempts,
  };
}

export async function simulatePasswordAttack(
  password: string,
  options: AttackSimulationOptions = {},
): Promise<AttackSimulationResult> {
  const maxAttempts = options.maxAttempts ?? defaultMaxAttempts;
  const startTime = performance.now();
  const seenCandidates = new Set<string>();
  let attempts = 0;
  let lastProgressAttempt = 0;

  const charset = getObservedCharset(password);
  const searchedSpace = getSearchSpace(charset.length, password.length);

  const report = async (
    phase: AttackPhase,
    lastCandidate: string,
    currentLength?: number,
    force = false,
  ) => {
    if (force || attempts - lastProgressAttempt >= 25_000) {
      lastProgressAttempt = attempts;
      options.onProgress?.(buildProgress(phase, attempts, startTime, lastCandidate, currentLength));
      await waitForBrowser();
    }
  };

  await report('dictionary', '', undefined, true);

  for (const word of dictionaryWords) {
    const wordVariants = getWordVariants(word);

    for (const variant of wordVariants) {
      for (const suffix of dictionarySuffixes) {
        for (const candidate of [variant + suffix, suffix + variant]) {
          if (seenCandidates.has(candidate)) continue;
          seenCandidates.add(candidate);
          attempts += 1;

          if (candidate === password) {
            return finish('dictionary', attempts, startTime, searchedSpace, maxAttempts);
          }
        }
      }
    }
  }

  await report('mask', '', undefined, true);

  const maskAttemptLimit = Math.min(350_000, Math.floor(maxAttempts * 0.25));
  let maskAttempts = 0;

  for (const word of dictionaryWords) {
    const wordVariants = getWordVariants(word);

    for (const variant of wordVariants) {
      for (let number = 0; number <= 9999 && attempts < maxAttempts && maskAttempts < maskAttemptLimit; number += 1) {
        const numberText = number.toString();
        const paddedNumberText = number.toString().padStart(4, '0');

        for (const suffix of [numberText, paddedNumberText]) {
          for (const candidate of [variant + suffix, suffix + variant]) {
            if (seenCandidates.has(candidate)) continue;
            seenCandidates.add(candidate);
            attempts += 1;
            maskAttempts += 1;

            if (candidate === password) {
              return finish('mask', attempts, startTime, searchedSpace, maxAttempts);
            }
          }
        }

        if (maskAttempts % 25_000 === 0) {
          await report('mask', `${variant}${numberText}`);
        }
      }
    }
  }

  for (let length = 1; length <= password.length && attempts < maxAttempts; length += 1) {
    const combinations = charset.length ** length;
    await report('bruteForce', '', length, true);

    for (let index = 0; index < combinations && attempts < maxAttempts; index += 1) {
      const candidate = indexToCandidate(index, length, charset);
      if (seenCandidates.has(candidate)) continue;

      attempts += 1;
      if (candidate === password) {
        return finish('bruteForce', attempts, startTime, searchedSpace, maxAttempts);
      }

      if (attempts % 25_000 === 0) {
        await report('bruteForce', candidate, length);
      }
    }
  }

  return finish('notCracked', attempts, startTime, searchedSpace, maxAttempts);
}
