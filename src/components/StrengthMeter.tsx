import { type Strength, type StrengthResult } from '../utils/strengthCalculator';
import { cn } from '../utils/cn';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { KAnonymityDialog } from './KAnonymityDialog';
import { useLanguage } from '../i18n/useLanguage.ts';
import { translations } from '../i18n/translations.ts';

const strengthTranslationKeyMap: Record<Strength, keyof typeof translations.en> = {
  Weak: 'weak',
  Medium: 'medium',
  Strong: 'strong',
  'Very Strong': 'veryStrong',
};

interface StrengthMeterProps {
  password: string;
  strength: StrengthResult;
  pwnedCount: number;
  isCheckingPwned: boolean;
  checkedPassword: string | null;
}

export function StrengthMeter({ password, strength, pwnedCount, isCheckingPwned, checkedPassword }: StrengthMeterProps) {
  const bars = Array.from({ length: 4 });
  const { t } = useLanguage();
  const strengthTranslationKey = strengthTranslationKeyMap[strength.label];
  const hasCheckedCurrentPassword = checkedPassword === password;
  const labelClassName = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground';
  const [showKAnon, setShowKAnon] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <div className="flex justify-between items-center mb-1">
        <span className={labelClassName}>{t('passwordStrength')}</span>
        <span className={cn('text-[11px] font-bold uppercase tracking-[0.14em]', `text-${strength.color.replace('bg-', '')}`)}>
          {t(strengthTranslationKey)}
        </span>
      </div>
      
      <div className="flex gap-2 h-2 w-full">
        {bars.map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              index < strength.score ? strength.color : "bg-secondary"
            )}
          />
        ))}
      </div>

      {isCheckingPwned && hasCheckedCurrentPassword && (
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground animate-pulse mt-2">
          {t('checkingBreaches')}
        </div>
      )}

      {pwnedCount > 0 && !isCheckingPwned && hasCheckedCurrentPassword && (
        <div className="flex items-start gap-2 mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong>{t('warningBreach').split(':')[0]}:</strong> {t('warningBreach').split(':')[1]} <strong>{pwnedCount.toLocaleString()}</strong> {t('dataBreaches')}
          </div>
        </div>
      )}
      
      {pwnedCount === 0 && !isCheckingPwned && strength.score > 0 && hasCheckedCurrentPassword && (
         <div className="flex items-center gap-2 mt-2">
          <div className="text-[11px] font-medium tracking-wide text-green-600 dark:text-green-400">{t('safeNoBreach')}</div>
          <button
            onClick={() => setShowKAnon(true)}
            className="cursor-pointer text-[11px] text-primary underline decoration-primary/60 underline-offset-2 ml-1 hover:decoration-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
            title="K-anonymity nedir?"
            aria-haspopup="dialog"
          >
            K-anonymity nedir?
          </button>
         </div>
      )}

      <KAnonymityDialog isOpen={showKAnon} onClose={() => setShowKAnon(false)} />
    </div>
  );
}

