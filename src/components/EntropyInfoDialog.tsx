import { X } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage.ts';
import { computeEntropyDetails, type PasswordEntropyContext } from '../utils/strengthCalculator';
import { getWordList } from '../utils/wordlist';

interface EntropyInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  password?: string;
  entropyContext?: PasswordEntropyContext;
}

export function EntropyInfoDialog({ isOpen, onClose, password, entropyContext }: EntropyInfoDialogProps) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const content = {
    en: {
      title: 'What does this mean?',
      paragraphs: [
        'Entropy is a simple way to measure how unpredictable a password is. Think of it as the number of bits of "surprise" in the password — more bits means harder to guess.',
        'A bit is a tiny unit of information. In this context, 1 bit means two possible choices, 2 bits mean four choices, 3 bits mean eight choices, and so on. So when entropy goes up, the number of possible guesses grows very fast.',
        'A basic estimate we use is: length × log2(character set size). For example, a password of 8 lowercase letters (26 letters) gives about 8 × 4.7 ≈ 38 bits. That corresponds to roughly 2^38 (~275 billion) possible guesses.',
        'We then lower that score if we detect easy patterns: repeated characters, sequences like "abcd" or "1234", common words, or dates. These patterns make a password much easier to crack than a random string of the same length.',
        'The dialog also shows estimated times for different attack types (website login attempts, or offline attacks if a password is leaked). These are rough guides to compare passwords — not exact predictions.',
      ],
      bullets: [
        'Use longer passphrases (5–6 random words or more in this app) instead of short complex strings',
        'Avoid obvious patterns (dates, repeated blocks, keyboard rows)',
        'Mix character types (lowercase, uppercase, digits, symbols) to increase the character set',
        'Consider a password manager to store long, random passwords safely'
      ],
      exampleTitle: 'Quick example',
      example: '8 random lowercase letters ≈ 38 bits → ~275 billion guesses. With this app’s built-in word list, 8 random words land around 61 bits.',
      close: 'Close',
    },
    tr: {
      title: 'Entropi nedir? & Mantıığı nasıl çalışır?',
      paragraphs: [
        'Entropi, bir parolanın ne kadar tahmin edilemez olduğunu ölçmenin basit bir yoludur. Bunu parolanın içindeki "sürpriz" miktarı olarak düşünebilirsiniz — daha fazla entropi, kırılması daha zordur.',
        'Bit, çok küçük bir bilgi birimidir. Bu bağlamda 1 bit, iki seçenek; 2 bit, dört seçenek; 3 bit, sekiz seçenek demektir. Entropi arttıkça olası deneme sayısı çok hızlı büyür.',
        'Kullandığımız temel tahmin: uzunluk × log2(karakter havuzu büyüklüğü). Örneğin, yalnızca 8 küçük harf (26 harf) için yaklaşık 8 × 4.7 ≈ 38 bit elde ederiz. Bu da yaklaşık 2^38 (~275 milyar) olası deneme demektir.',
        'Eğer parolada kolay desenler (tekrar eden karakterler, "abcd" veya "1234" gibi ardışık diziler, yaygın kelimeler veya tarih) bulunursa puanı düşürüyoruz. Bu desenler, aynı uzunluktaki rastgele bir diziden çok daha kolay kırılmasına yol açar.',
        'Pencere ayrıca farklı saldırı türleri için tahmini süreleri gösterir (web giriş denemeleri veya parolanın sızdırılması durumunda çevrimdışı saldırılar). Bunlar kesin sonuçlar değil, karşılaştırma amaçlı yaklaşık değerlerdir.',
      ],
      bullets: [
        'Kısa karmaşık diziler yerine daha uzun parola cümleleri kullanın (bu uygulamada 5–6 rastgele kelime ve üzeri)',
        'Açık desenlerden kaçının (tarihler, tekrarlayan bloklar, klavye sıraları)',
        'Karakter türlerini karıştırın (küçük, büyük, rakam, sembol) — havuzu büyütür',
        'Uzun, rastgele parolaları saklamak için parola yöneticisi kullanmayı düşünün'
      ],
      exampleTitle: 'Hızlı örnek',
      example: '8 rastgele küçük harf ≈ 38 bit → ~275 milyar deneme. Bu uygulamanın kelime listesiyle 8 rastgele kelime yaklaşık 61 bit eder.',
      close: 'Kapat',
    }
  } as const;

  const lang = language === 'tr' ? 'tr' : 'en';
  const data = content[lang];

  const dynamic = password ? computeEntropyDetails(password, undefined, entropyContext) : null;

  const getWidthClass = (pct: number) => {
    if (pct >= 100) return 'w-full';
    if (pct >= 75) return 'w-3/4';
    if (pct >= 66) return 'w-2/3';
    if (pct >= 50) return 'w-1/2';
    if (pct >= 33) return 'w-1/3';
    if (pct >= 25) return 'w-1/4';
    if (pct >= 16) return 'w-1/6';
    return 'w-1/12';
  };

  const formatShortDuration = (seconds: number) => {
    if (!isFinite(seconds) || seconds <= 0) return language === 'tr' ? 'anlık' : 'instant';

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const year = day * 365;

    if (seconds >= year * 1000) return language === 'tr' ? '1000+ yıl' : '1000+ years';
    if (seconds >= year) return `${Math.max(1, Math.round(seconds / year))} ${language === 'tr' ? 'yıl' : 'years'}`;
    if (seconds >= day) return `${Math.max(1, Math.round(seconds / day))} ${language === 'tr' ? 'gün' : 'days'}`;
    if (seconds >= hour) return `${Math.max(1, Math.round(seconds / hour))} ${language === 'tr' ? 'saat' : 'hours'}`;
    if (seconds >= minute) return `${Math.max(1, Math.round(seconds / minute))} ${language === 'tr' ? 'dakika' : 'minutes'}`;
    return `${Math.max(1, Math.round(seconds))} ${language === 'tr' ? 'saniye' : 'seconds'}`;
  };

  const formatCompactNumber = (value: number) => {
    try {
      return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return Math.round(value).toLocaleString();
    }
  };

  const proofDemo = {
    alphabetSize: 4,
    length: 3,
    guessesPerSecond: 10,
  };

  const proofCombinations = Math.pow(proofDemo.alphabetSize, proofDemo.length);
  const proofAverageGuesses = proofCombinations / 2;
  const proofCrackSeconds = proofAverageGuesses / proofDemo.guessesPerSecond;

  const realWorldCombinations = Math.pow(26, 8);
  const realWorldAverageGuesses = realWorldCombinations / 2;
  const realWorldEntropyBits = Math.log2(realWorldCombinations);
  const builtInWordListSize = getWordList(language === 'tr' ? 'tr' : 'en').length;
  const builtInPassphraseBits = 8 * Math.log2(builtInWordListSize);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <style>{`
        /* Theme-aware scrollbar for entropy dialog panel */
        .entropy-dialog__panel::-webkit-scrollbar { width: 10px; height: 10px; }
        .entropy-dialog__panel::-webkit-scrollbar-track { background: var(--muted); border-radius: 9999px; }
        .entropy-dialog__panel::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
        .entropy-dialog__panel::-webkit-scrollbar-thumb:hover { filter: brightness(0.9); }
        /* Firefox */
        .entropy-dialog__panel { scrollbar-width: thin; scrollbar-color: var(--primary) var(--muted); }
      `}</style>
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto entropy-dialog__panel">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">{data.title}</h2>
          <button onClick={onClose} title={data.close} className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4 text-sm text-secondary-foreground">
          {data.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <ul className="list-disc ml-6 space-y-1">
            {data.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          <div className="mt-4 p-4 rounded-lg border border-border bg-muted/20">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'tr' ? 'Küçük bir ispat senaryosu' : 'A small proof scenario'}
            </h3>
            <div className="space-y-2 text-[12px] text-secondary-foreground">
              <p>
                {language === 'tr'
                  ? `4 harfli bir alfabe ve 3 karakterlik bir parola düşünelim. Toplam kombinasyon sayısı tam olarak ${proofDemo.alphabetSize}^${proofDemo.length} = ${proofCombinations}.`
                  : `Imagine a 4-letter alphabet and a 3-character password. The exact number of combinations is ${proofDemo.alphabetSize}^${proofDemo.length} = ${proofCombinations}.`}
              </p>
              <p>
                {language === 'tr'
                  ? `Ortalama olarak doğru şifreyi bulmak için ${proofAverageGuesses} deneme gerekir. Saniyede ${proofDemo.guessesPerSecond} deneme yapan bir saldırıda bu yaklaşık ${formatShortDuration(proofCrackSeconds)} sürer.`
                  : `On average, it takes ${proofAverageGuesses} guesses to find the right password. At ${proofDemo.guessesPerSecond} guesses per second, that is about ${formatShortDuration(proofCrackSeconds)}.`}
              </p>
              <p>
                {language === 'tr'
                  ? `Şimdi aynı mantığı 8 küçük harfe uygularsak: 26^8 = ${formatCompactNumber(realWorldCombinations)} kombinasyon ve ortalama ${formatCompactNumber(realWorldAverageGuesses)} deneme çıkar. Bu da yaklaşık ${Math.round(realWorldEntropyBits)} bit entropi demektir.`
                  : `Apply the same logic to 8 lowercase letters: 26^8 = ${formatCompactNumber(realWorldCombinations)} combinations and about ${formatCompactNumber(realWorldAverageGuesses)} average guesses. That corresponds to roughly ${Math.round(realWorldEntropyBits)} bits of entropy.`}
              </p>
            </div>
          </div>

          {/* Visual examples: small comparison bars (includes dynamic entry if password provided) */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">{data.exampleTitle}</h3>
            <div className="space-y-3">
              {dynamic && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-foreground font-medium">{language === 'tr' ? 'Girdiğiniz parola' : 'Your password'}</div>
                    <div className="text-xs text-secondary-foreground">{Math.round(dynamic.adjustedEntropy)} bits · {formatShortDuration(dynamic.crackTimes.offline_gpu)}</div>
                  </div>
                  <div className="w-full bg-muted rounded h-3 overflow-hidden mb-1">
                    <div className={`h-3 bg-primary ${getWidthClass(Math.min(100, Math.round((dynamic.adjustedEntropy / 100) * 100)))}`} />
                  </div>
                  <div className="text-xs text-secondary-foreground mb-2">
                    {language === 'tr'
                      ? `Bu parola yaklaşık ${formatShortDuration(dynamic.crackTimes.offline_gpu)} içinde kırılabilir.`
                      : `This password may take about ${formatShortDuration(dynamic.crackTimes.offline_gpu)} to crack.`}
                  </div>
                </div>
              )}

              {([
                { label: 'password123', bits: 20, note: language === 'tr' ? 'Çok zayıf' : 'Very weak' },
                { label: '8 lowercase letters', bits: 38, note: language === 'tr' ? 'Zayıf' : 'Weak' },
                {
                  label: language === 'tr' ? '8 uygulama kelimesi' : '8 built-in words',
                  bits: builtInPassphraseBits,
                  note: language === 'tr' ? 'Güçlü' : 'Strong',
                },
              ] as const).map((ex) => {
                const pct = Math.min(100, Math.round((ex.bits / 100) * 100));
                return (
                  <div key={ex.label} className="">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-foreground font-medium">{ex.label}</div>
                      <div className="text-xs text-secondary-foreground">{ex.bits} bits · {ex.note}</div>
                    </div>
                    <div className="w-full bg-muted rounded h-3 overflow-hidden">
                      <div className={`h-3 bg-primary ${getWidthClass(pct)}`} />
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30">
            {data.close}
          </button>
        </div>
      </div>
    </div>
  );
}
