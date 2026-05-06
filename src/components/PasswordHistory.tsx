import { Copy, Trash2, Eye, EyeOff, Wifi, Landmark, Share2, Key } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/useLanguage.ts';

interface PasswordHistoryItem {
  password: string;
  preset?: 'wifi' | 'banking' | 'social' | 'admin' | null;
}

interface PasswordHistoryProps {
  history: PasswordHistoryItem[];
  clearHistory: () => void;
}

export function PasswordHistory({ history, clearHistory }: PasswordHistoryProps) {
  const { t } = useLanguage();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

  const getPresetIcon = (preset?: 'wifi' | 'banking' | 'social' | 'admin' | null) => {
    switch (preset) {
      case 'wifi':
        return <div className="w-5 h-5 flex items-center justify-center shrink-0" title={t('wifi')}><Wifi size={20} strokeWidth={2} className="text-blue-500" /></div>;
      case 'banking':
        return <div className="w-5 h-5 flex items-center justify-center shrink-0" title={t('banking')}><Landmark size={20} strokeWidth={2} className="text-emerald-600" /></div>;
      case 'social':
        return <div className="w-5 h-5 flex items-center justify-center shrink-0" title={t('social')}><Share2 size={20} strokeWidth={2} className="text-pink-500" style={{ transform: 'scale(1.2)' }} /></div>;
      case 'admin':
        return <div className="w-5 h-5 flex items-center justify-center shrink-0" title={t('admin')}><Key size={20} strokeWidth={2} className="text-orange-600" style={{ transform: 'scale(0.85)' }} /></div>;
      default:
        return null;
    }
  };

  if (history.length === 0) {
    return null;
  }

  const handleCopy = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const toggleVisibility = (index: number) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(index)) {
      newVisible.delete(index);
    } else {
      newVisible.add(index);
    }
    setVisiblePasswords(newVisible);
  };

  return (
    <div className="flex flex-col gap-3 w-full p-6 bg-card border border-border rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-foreground">{t('historyTitle')}</h3>
        <button
          onClick={clearHistory}
          className="text-sm bg-red-800 text-white hover:bg-red-700 active:bg-red-900 px-2 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
        >
          <Trash2 size={14} /> {t('clear')}
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {history.map((item, index) => {
          const password = typeof item === 'string' ? item : item.password;
          const preset = typeof item === 'string' ? undefined : item.preset;
          return (
            <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-md">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {preset && getPresetIcon(preset)}
                <span className="font-mono text-sm text-secondary-foreground truncate">
                  {visiblePasswords.has(index) ? password : password.replace(/./g, '•')}
                </span>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => toggleVisibility(index)}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                  title={visiblePasswords.has(index) ? t('hide') : t('show')}
                >
                  {visiblePasswords.has(index) ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleCopy(password)}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                  title={t('copyToClipboard')}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

