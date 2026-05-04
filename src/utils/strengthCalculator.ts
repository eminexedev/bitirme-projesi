export type Strength = 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export interface StrengthResult {
  score: number; // 0 to 4
  label: Strength;
  color: string;
}

// Common patterns that weaken passwords
const COMMON_PATTERNS = [
  'password', 'pass123', '123456', '12345678', 'qwerty', 'abc123',
  'password123', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
  '111111', '123123', 'admin', 'root', 'passw0rd', 'shadow',
];

// Keyboard patterns
const KEYBOARD_PATTERNS = [
  'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'qweasd', 'asdfghjkl',
  '1234567890', 'qwertyuiop', 'qwertyu', 'asdfg',
];

// Sequences to detect (alphabetic, numeric, etc.)
function hasSequences(password: string): number {
  let sequenceCount = 0;
  const lowerPassword = password.toLowerCase();

  // Detect 3+ consecutive sequential characters
  for (let i = 0; i < lowerPassword.length - 2; i++) {
    const char0 = lowerPassword.charCodeAt(i);
    const char1 = lowerPassword.charCodeAt(i + 1);
    const char2 = lowerPassword.charCodeAt(i + 2);

    // Forward sequence
    if (char1 === char0 + 1 && char2 === char0 + 2) {
      sequenceCount += 2;
    }
    // Backward sequence
    if (char1 === char0 - 1 && char2 === char0 - 2) {
      sequenceCount += 2;
    }
  }

  return sequenceCount;
}

// Detect repetitions (3+ identical characters in a row)
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

// Check for common patterns
function hasCommonPatterns(password: string): boolean {
  const lowerPassword = password.toLowerCase();

  return COMMON_PATTERNS.some(pattern => lowerPassword.includes(pattern)) ||
         KEYBOARD_PATTERNS.some(pattern => lowerPassword.includes(pattern));
}

// Calculate character diversity bonus
function getCharacterDiversityBonus(password: string): number {
  let bonus = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  if (hasLower) bonus += 1;
  if (hasUpper) bonus += 1;
  if (hasDigits) bonus += 1;
  if (hasSymbols) bonus += 1;

  return bonus;
}

export function calculateStrength(password: string): StrengthResult {
  if (!password) {
    return { score: 0, label: 'Weak', color: 'bg-destructive' };
  }

  // Basic length check
  if (password.length < 4) {
    return { score: 0, label: 'Weak', color: 'bg-destructive' };
  }

  // Common patterns are always weak
  if (hasCommonPatterns(password)) {
    if (password.length <= 8) {
      return { score: 1, label: 'Weak', color: 'bg-destructive' };
    }
    if (password.length <= 12) {
      return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
    }
  }

  let poolSize = 0;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) poolSize = 1;

  // Calculate base entropy
  let entropy = password.length * Math.log2(poolSize);

  // Apply penalties for weak patterns
  const sequencePenalty = hasSequences(password) * 5; // 5 bits per sequence found
  const repetitionPenalty = hasRepetitions(password) * 4; // 4 bits per repetition found
  entropy -= sequencePenalty + repetitionPenalty;

  // Apply bonus for character diversity
  const diversityBonus = getCharacterDiversityBonus(password) * 5;
  entropy += diversityBonus;

  // Length-based adjustments
  if (password.length < 6) {
    entropy *= 0.8; // Penalize short passwords further
  }

  // Determine strength based on adjusted entropy
  if (entropy < 35) {
    return { score: 1, label: 'Weak', color: 'bg-destructive' };
  } else if (entropy < 55) {
    return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
  } else if (entropy < 75) {
    return { score: 3, label: 'Strong', color: 'bg-green-500' };
  } else {
    return { score: 4, label: 'Very Strong', color: 'bg-primary' };
  }
}
