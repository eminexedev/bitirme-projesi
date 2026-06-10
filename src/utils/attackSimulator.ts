export type AttackMethod = 'dictionary' | 'bruteForce' | 'notCracked';

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

const dictionaryWords = [
  'password', '123456', '12345678', 'qwerty', 'admin', 'welcome', 'letmein',
  'monkey', 'dragon', 'master', 'root', 'user', 'login', 'test', 'secret',
  'istanbul', 'ankara', 'turkiye', 'securekey', 'fenerbahce', 'galatasaray',
  'besiktas', 'trabzonspor', 'askim', 'mehmet', 'ahmet', 'emre', 'ayse',
];

const dictionarySuffixes = ['', '1', '12', '123', '1234', '12345', '!', '!!', '@', '01', '00', '1907', '2024', '2025'];
const commonSymbols = '!@#$%^&*()-_=+[]{};:,.?/|~';

function waitForBrowser() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

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

function indexToCandidate(index: number, length: number, charset: string) {
  let value = index;
  let candidate = '';

  for (let i = 0; i < length; i += 1) {
    candidate = charset[value % charset.length] + candidate;
    value = Math.floor(value / charset.length);
  }

  return candidate;
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

export async function simulatePasswordAttack(password: string, maxAttempts = 250_000): Promise<AttackSimulationResult> {
  const startTime = performance.now();
  const seenCandidates = new Set<string>();
  let attempts = 0;

  const charset = getObservedCharset(password);
  const searchedSpace = getSearchSpace(charset.length, password.length);

  for (const word of dictionaryWords) {
    const wordVariants = [word, word.toUpperCase(), capitalize(word)];

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

  for (let length = 1; length <= password.length && attempts < maxAttempts; length += 1) {
    const combinations = charset.length ** length;

    for (let index = 0; index < combinations && attempts < maxAttempts; index += 1) {
      const candidate = indexToCandidate(index, length, charset);
      if (seenCandidates.has(candidate)) continue;

      attempts += 1;
      if (candidate === password) {
        return finish('bruteForce', attempts, startTime, searchedSpace, maxAttempts);
      }

      if (attempts % 5000 === 0) {
        await waitForBrowser();
      }
    }
  }

  return finish('notCracked', attempts, startTime, searchedSpace, maxAttempts);
}
