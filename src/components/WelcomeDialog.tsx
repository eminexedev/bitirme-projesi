import { X } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage.ts';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
}

export function WelcomeDialog({ isOpen, onClose, onAcknowledge }: WelcomeDialogProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const content = {
    en: {
      title: 'Welcome to SecureKey',
      paragraphs: [
        'SecureKey helps you create strong, unique passwords locally in your browser. Passwords are generated on your device and never sent to our servers.',
        'We perform an optional breach check using a privacy-preserving method called k-anonymity (we only send a short hash prefix — the server cannot see your full password).',
        'You remain in control: we do not store or transmit your passwords. Always use a password manager for important credentials and enable multi-factor authentication where available.'
      ],
      acknowledge: 'I have read and understand',
      close: 'Close'
    },
    tr: {
      title: 'SecureKey’e Hoş Geldiniz',
      paragraphs: [
        'SecureKey, güçlü ve benzersiz şifreleri tarayıcınızda yerel olarak oluşturmanıza yardımcı olur. Şifreler cihazınızda üretilir ve bizim sunucularımıza gönderilmez.',
        'İsteğe bağlı bir ihlal kontrolü için k-anonymity adlı gizliliği koruyan bir yöntem kullanıyoruz (yalnızca kısa bir hash ön eki gönderilir — sunucu tam parolanızı göremez).',
        'Kontrol sizde: Şifrelerinizi depolamıyor veya iletmiyoruz. Önemli hesaplar için bir parola yöneticisi kullanın ve mümkünse çok faktörlü kimlik doğrulamayı etkinleştirin.'
      ],
      acknowledge: 'Okudum ve anladım',
      close: 'Kapat'
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
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/20">{data.close}</button>
          <button onClick={() => { onAcknowledge(); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30">{data.acknowledge}</button>
        </div>
      </div>
    </div>
  );
}
