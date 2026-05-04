import { Globe } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage.ts';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
      className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
      title={language === 'tr' ? t('switchToEnglish') : t('switchToTurkish')}
    >
      <Globe size={16} />
      <span className="text-sm font-medium uppercase">{language}</span>
    </button>
  );
}
