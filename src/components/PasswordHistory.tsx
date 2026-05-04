import { Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/useLanguage.ts';

interface PasswordHistoryProps {
  history: string[];
  clearHistory: () => void;
}

export function PasswordHistory({ history, clearHistory }: PasswordHistoryProps) {
  const { t } = useLanguage();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

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
        {history.map((pw, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-md">
            <span className="font-mono text-sm text-secondary-foreground truncate mr-2">
              {visiblePasswords.has(index) ? pw : pw.replace(/./g, '•')}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => toggleVisibility(index)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                title={visiblePasswords.has(index) ? t('hide') : t('show')}
              >
                {visiblePasswords.has(index) ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => handleCopy(pw)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                title={t('copyToClipboard')}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

