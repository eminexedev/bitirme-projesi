export async function checkPwned(password: string): Promise<number> {
  if (!password) return 0;

  try {
    // SHA-1 hash hesapla ve büyük harfe çevir
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    
    // Hash'i hexadecimal string'e çevir
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Hash'in ilk 5 karakterini al ve API'ye sorgu yaptırma
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    // API'den hash suffix'lerini ve sayıları al ve karşılaştır
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error('Hata: pwned API\'dan veri alınırken oluştu');
    }

    // API yanıtını satır satır işle ve suffix ile eşleşen satırı bul
    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return parseInt(countStr.trim(), 10);
      }
    }

    return 0; // Parola pwned değilse 0 döndür
  } catch (error) {
    console.error('Hata kontrol ederken oluştu:', error);
    return -1; // Hata durumunda -1 döndür
  }
}
