import { X } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage.ts';

interface KAnonymityDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KAnonymityDialog({ isOpen, onClose }: KAnonymityDialogProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const content = {
    en: {
      title: 'What is k-anonymity?',
      paragraphs: [
        'K-anonymity is a privacy technique used when checking if a password appears in breach databases without revealing the full password to the server.',
        'We hash your password locally (SHA-1) and only send the first 5 characters of that hash to the server. The server returns a list of matching hash suffixes and counts. Your browser then checks if the full hash appears in that list. This way, the server never sees your full password or full hash.',
        'Simple example: you hash your password and get ABCDE12345..., we send only "ABCDE". The server returns all suffixes starting with "ABCDE" and their counts. You compare locally to see if your suffix exists.',
      ],
      bullets: [
        'Keeps your full password private',
        'Server cannot determine your exact password from the 5-character prefix',
        'This is the method used by Have I Been Pwned for password checks'
      ],
      close: 'Close',
    },
    tr: {
      title: 'K-anonymity nedir?',
      paragraphs: [
        'K-anonymity, bir parolanın ihlal veri tabanlarında olup olmadığını sunucuya tam parola göndermeden kontrol etmeye yarayan bir gizlilik tekniğidir.',
        'Tarayıcınız parolayı yerelde (SHA-1) hashler ve sadece o hashin ilk 5 karakterini sunucuya gönderir. Sunucu bu 5 karakterle başlayan hash eklerini ve sayılarını döner. Tarayıcınız daha sonra yerelde tam hashin listede olup olmadığını kontrol eder. Böylece sunucu tam parolayı veya tam hashi görmez.',
        'Basit örnek: Parolanız hashlendikten sonra ABCDE12345... gibi olsun; biz sadece "ABCDE" göndeririz. Sunucu "ABCDE" ile başlayan tüm suffixleri döner. Siz yerelde kendi suffixinizi karşılaştırırsınız.',
      ],
      bullets: [
        'Tam parolanızı gizli tutar',
        'Sunucu 5 karakterlik prefixten sizin tam parolanızı belirleyemez',
        'Bu yöntem, Have I Been Pwned tarafından kullanılan yöntemdir'
      ],
      close: 'Kapat',
    }
  } as const;

  const lang = language === 'tr' ? 'tr' : 'en';
  const data = content[lang];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
