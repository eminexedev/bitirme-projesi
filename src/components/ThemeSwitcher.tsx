import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage } from '../i18n/useLanguage.ts';
import { translations } from '../i18n/translations.ts';

const THEMES = [
  { id: 'dark', labelKey: 'themeMinimalDark' },
  { id: 'theme-cyber', labelKey: 'themeCyber' },
  { id: 'theme-hacker', labelKey: 'themeHacker' },
] as const satisfies ReadonlyArray<{ id: string; labelKey: keyof typeof translations.en }>;

const THEME_STORAGE_KEY = 'appTheme';
const DEFAULT_THEME = 'theme-cyber';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const isKnownTheme = THEMES.some((themeOption) => themeOption.id === savedTheme);
    return isKnownTheme && savedTheme ? savedTheme : DEFAULT_THEME;
  });
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Remove old themes
    document.documentElement.classList.remove('dark', 'theme-cyber', 'theme-hacker');
    // Add new theme
    document.documentElement.classList.add(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
      >
        <Palette size={16} />
        <span className="text-sm font-medium">{t('theme')}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => {
                setTheme(themeOption.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 text-sm transition-colors",
                theme === themeOption.id ? "bg-primary text-primary-foreground" : "text-popover-foreground hover:bg-secondary"
              )}
            >
              {t(themeOption.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

