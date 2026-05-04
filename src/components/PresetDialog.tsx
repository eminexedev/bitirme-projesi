import { X, AlertCircle, Clock, Shield } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage.ts';

interface PresetDialogProps {
  isOpen: boolean;
  preset: 'wifi' | 'banking' | 'social' | 'admin' | null;
  onClose: () => void;
  onConfirm: () => void;
}

const presetInfo = {
  en: {
    wifi: {
      title: 'WiFi Password Guidelines',
      rules: [
        'Use a mix of uppercase and lowercase letters',
        'Include numbers for better security',
        'Avoid special characters (to prevent router compatibility issues)',
        'Aim for at least 24 characters length',
      ],
      frequency: 'Change your WiFi password every 3-6 months or if you suspect unauthorized access.',
      security: [
        'Keep your WiFi network name (SSID) hidden if possible',
        'Disable WPS (WiFi Protected Setup) for better security',
        'Enable WPA3 encryption (or WPA2 if WPA3 is unavailable)',
        'Change the default admin password on your router',
      ],
    },
    banking: {
      title: 'Banking Password Guidelines',
      rules: [
        'Use at least 32 characters for maximum security',
        'Include uppercase letters, lowercase letters, numbers, and symbols',
        'Avoid dictionary words or personal information',
        'Each banking account should have a unique password',
      ],
      frequency: 'Change your banking password every 30-60 days. Consider changing it immediately if you notice any suspicious activity.',
      security: [
        'Enable multi-factor authentication (MFA) on your banking app',
        'Never share your password with anyone, including bank staff',
        'Use a password manager to store banking credentials securely',
        'Log out after each banking session',
        'Monitor your account regularly for unauthorized transactions',
      ],
    },
    social: {
      title: 'Social Media Password Guidelines',
      rules: [
        'Use a mix of uppercase and lowercase letters',
        'Include numbers and special characters',
        'Aim for at least 16 characters length',
        'Make it unique from other social media accounts',
      ],
      frequency: 'Change your social media password every 2-3 months or after any security breach notifications.',
      security: [
        'Enable two-factor authentication (2FA) on your social media accounts',
        'Review connected apps and revoke access to unused applications',
        'Check login activity and sign out from unknown devices',
        'Use a password manager to generate and store unique passwords',
        'Be cautious of phishing attempts and suspicious links',
      ],
    },
    admin: {
      title: 'Administrator Password Guidelines',
      rules: [
        'Use maximum length (64 characters) for critical systems',
        'Include all character types: uppercase, lowercase, numbers, and symbols',
        'Avoid any patterns or keyboard walks',
        'Use completely random characters',
      ],
      frequency: 'Change your admin password every 30 days or more frequently depending on your security policy.',
      security: [
        'Restrict admin access to authorized personnel only',
        'Implement role-based access control (RBAC)',
        'Enable audit logging for all admin actions',
        'Use separate admin accounts for daily tasks vs. critical operations',
        'Enforce MFA for all administrative access',
        'Store admin credentials in a secure vault',
      ],
    },
  },
  tr: {
    wifi: {
      title: 'WiFi Şifre Yönergeleri',
      rules: [
        'Büyük ve küçük harflerin karışımını kullanın',
        'Daha iyi güvenlik için rakamlar ekleyin',
        'Özel karakterlerden kaçının (router uyumluluk sorunları için)',
        'En az 24 karakter uzunluğu hedefleyin',
      ],
      frequency: '3-6 ayda bir veya yetkisiz erişimden şüpheleniyorsanız WiFi şifrenizi değiştirin.',
      security: [
        'WiFi ağ adınızı (SSID) mümkünse gizleyin',
        'Daha iyi güvenlik için WPS (WiFi Protected Setup) devre dışı bırakın',
        'WPA3 şifrelemesini etkinleştirin (WPA3 kullanılamıyorsa WPA2)',
        'Yönlendiriciniz üzerindeki varsayılan yönetici şifresini değiştirin',
      ],
    },
    banking: {
      title: 'Banka Şifre Yönergeleri',
      rules: [
        'Maksimum güvenlik için en az 32 karakter kullanın',
        'Büyük harf, küçük harf, rakam ve sembol ekleyin',
        'Sözlük kelimeleri veya kişisel bilgilerden kaçının',
        'Her banka hesabı için benzersiz bir şifre kullanın',
      ],
      frequency: 'Banka şifrenizi her 30-60 günde bir değiştirin. Şüpheli bir aktivite fark ederseniz hemen değiştirin.',
      security: [
        'Banka uygulamanızda çok faktörlü kimlik doğrulamayı (MFA) etkinleştirin',
        'Şifrenizi kimseyle paylaşmayın, banka personeli de dahil',
        'Banka kimlik bilgilerini güvenli bir şekilde depolamak için bir parola yöneticisi kullanın',
        'Her banka oturumundan sonra çıkış yapın',
        'Hesabınızı yetkisiz işlemler açısından düzenli olarak izleyin',
      ],
    },
    social: {
      title: 'Sosyal Medya Şifre Yönergeleri',
      rules: [
        'Büyük ve küçük harflerin karışımını kullanın',
        'Rakam ve özel karakterler ekleyin',
        'En az 16 karakter uzunluğu hedefleyin',
        'Diğer sosyal medya hesaplarınızdan farklı olsun',
      ],
      frequency: '2-3 ayda bir veya herhangi bir güvenlik ihlali bildirimi aldıktan sonra değiştirin.',
      security: [
        'Sosyal medya hesaplarınızda iki faktörlü kimlik doğrulamayı (2FA) etkinleştirin',
        'Bağlantılı uygulamaları gözden geçirin ve kullanılmayan uygulamalara erişimi iptal edin',
        'Oturum açma aktivitesini kontrol edin ve bilinmeyen cihazlardan çıkış yapın',
        'Benzersiz şifreler oluşturmak ve depolamak için bir parola yöneticisi kullanın',
        'Kimlik avı girişimleri ve şüpheli bağlantılardan dikkatli olun',
      ],
    },
    admin: {
      title: 'Yönetici Şifre Yönergeleri',
      rules: [
        'Kritik sistemler için maksimum uzunluk (64 karakter) kullanın',
        'Tüm karakter türlerini ekleyin: büyük harf, küçük harf, rakam ve sembol',
        'Herhangi bir desen veya klavye yürüyüşünden kaçının',
        'Tamamen rastgele karakterler kullanın',
      ],
      frequency: '30 günde bir veya güvenlik politikanıza bağlı olarak daha sık değiştirin.',
      security: [
        'Yönetici erişimini yalnızca yetkili kişilere kısıtlayın',
        'Rol tabanlı erişim kontrolünü (RBAC) uygulayın',
        'Tüm yönetici işlemleri için denetim günlüğünü etkinleştirin',
        'Günlük görevler için ayrı yönetici hesapları ve kritik işlemleri ayırmış olun',
        'Tüm yönetici erişimi için MFA zorunlu kılın',
        'Yönetici kimlik bilgilerini güvenli bir kasada depolayın',
      ],
    },
  },
};

export function PresetDialog({ isOpen, preset, onClose, onConfirm }: PresetDialogProps) {
  const { language } = useLanguage();
  const translations = presetInfo[language as 'en' | 'tr'];
  
  if (!isOpen || !preset || !translations[preset as keyof typeof translations]) {
    return null;
  }

  const info = translations[preset as keyof typeof translations];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">{info.title}</h2>
          <button
            onClick={onClose}
            title={language === 'en' ? 'Close' : 'Kapat'}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rules */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Şifre Kuralları / Password Rules</h3>
            </div>
            <ul className="space-y-2 ml-7">
              {info.rules.map((rule, index) => (
                <li key={index} className="text-sm text-secondary-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Frequency */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-foreground">Değişim Sıklığı / Change Frequency</h3>
            </div>
            <p className="text-sm text-secondary-foreground ml-7">{info.frequency}</p>
          </div>

          {/* Security Measures */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={20} className="text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Güvenlik Önlemleri / Security Measures</h3>
            </div>
            <ul className="space-y-2 ml-7">
              {info.security.map((measure, index) => (
                <li key={index} className="text-sm text-secondary-foreground flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{measure}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            {language === 'en' ? 'Cancel' : 'İptal'}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors font-medium"
          >
            {language === 'en' ? 'Apply Preset' : 'Şablonu Uygula'}
          </button>
        </div>
      </div>
    </div>
  );
}
