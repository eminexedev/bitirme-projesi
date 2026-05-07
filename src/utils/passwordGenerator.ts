export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  customExclude: string;
}

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
  similarChars: 'il1Lo0O',
};

export function getEffectiveCharset(options: PasswordOptions): string {
  let charset = '';
  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.symbols) charset += CHAR_SETS.symbols;

  if (charset === '') {
    return '';
  }

  let finalCharset = charset;
  if (options.excludeSimilar) {
    finalCharset = finalCharset.split('').filter(c => !CHAR_SETS.similarChars.includes(c)).join('');
  }

  if (options.customExclude) {
    const customExcludeSet = new Set(options.customExclude.split(''));
    finalCharset = finalCharset.split('').filter(c => !customExcludeSet.has(c)).join('');
  }

  return finalCharset;
}

export function getEffectiveCharsetSize(options: PasswordOptions): number {
  return getEffectiveCharset(options).length;
}

export function generatePassword(options: PasswordOptions): string {
  const finalCharset = getEffectiveCharset(options);

  if (finalCharset === '') {
    return '';
  }

  const charsetArray = finalCharset.split('');
  const passwordArray = new Uint32Array(options.length);
  window.crypto.getRandomValues(passwordArray);

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += charsetArray[passwordArray[i] % charsetArray.length];
  }

  return password;
}
