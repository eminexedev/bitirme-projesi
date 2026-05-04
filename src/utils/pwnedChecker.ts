export async function checkPwned(password: string): Promise<number> {
  if (!password) return 0;

  try {
    // Hash password using SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // k-anonymity: only send first 5 chars
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error('Failed to fetch from pwned api');
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return parseInt(countStr.trim(), 10);
      }
    }

    return 0; // Not found
  } catch (error) {
    console.error('Error checking pwned passwords:', error);
    return -1; // Indicate error
  }
}
