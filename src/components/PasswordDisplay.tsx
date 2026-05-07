import { useRef, useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage } from '../i18n/useLanguage.ts';

interface PasswordDisplayProps {
  password: string;
  onQrClick?: () => void;
  showQrButton?: boolean;
}

export function PasswordDisplay({ password, onQrClick, showQrButton = true }: PasswordDisplayProps) {
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const { t } = useLanguage();

  const copied = copiedPassword === password;

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(password);

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        setCopiedPassword(null);
        resetTimerRef.current = null;
      }, 2000);
    } catch (err) {
      // tr
      console.error('Kopyalama başarısız', err);
      console.error('Copy failed', err);
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between w-full p-4 md:p-6 bg-card border border-border rounded-lg shadow-sm transition-all overflow-hidden break-all min-h-20">
        <span className={cn(
          "text-2xl md:text-4xl font-mono tracking-wider transition-colors duration-300 w-[75%]",
          password ? "text-foreground" : "text-muted-foreground opacity-50"
        )}>
          {password || t('generatePlaceholder')}
        </span>
        
        <div className="flex items-center gap-2">
          {onQrClick && showQrButton && (
            <button
              onClick={onQrClick}
              disabled={!password}
              className={cn(
                "p-3 rounded-full transition-all duration-300 hover:bg-secondary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
              )}
              title={t('wifiQrTooltip') || 'Show Wi-Fi QR'}
            >
              <QrCode size={24} />
            </button>
          )}

          <button
            onClick={handleCopy}
            disabled={!password}
            className={cn(
              "p-3 rounded-full transition-all duration-300 hover:bg-secondary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              copied ? "text-green-500 bg-green-500/10" : "text-muted-foreground hover:text-foreground"
            )}
            title={t('copyToClipboard')}
          >
            {copied ? <Check size={24} /> : <Copy size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}
