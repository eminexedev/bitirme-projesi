import { type Strength, type StrengthResult, checkPasswordCompliance } from '../utils/strengthCalculator';
import { cn } from '../utils/cn';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { KAnonymityDialog } from './KAnonymityDialog';
import { useLanguage } from '../i18n/useLanguage.ts';
import { translations } from '../i18n/translations.ts';
import { type PasswordOptions } from '../utils/passwordGenerator';

const strengthTranslationKeyMap: Record<Strength, keyof typeof translations.en> = {
  Weak: 'weak',
  Medium: 'medium',
  Strong: 'strong',
  'Very Strong': 'veryStrong',
  Compromised: 'compromised',
};

interface StrengthMeterProps {
  password: string;
  strength: StrengthResult;
  pwnedCount: number;
  isCheckingPwned: boolean;
  checkedPassword: string | null;
  options?: PasswordOptions;
}

export function StrengthMeter({ password, strength, pwnedCount, isCheckingPwned, checkedPassword, options }: StrengthMeterProps) {
  const bars = Array.from({ length: 4 });
  const { t } = useLanguage();
  const strengthTranslationKey = strengthTranslationKeyMap[strength.label];
  const hasCheckedCurrentPassword = checkedPassword === password;
  const labelClassName = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground';
  const [showKAnon, setShowKAnon] = useState(false);

  // Check password compliance with selected options
  const compliance = options ? checkPasswordCompliance(password, {
    uppercase: options.uppercase,
    lowercase: options.lowercase,
    numbers: options.numbers,
    symbols: options.symbols,
  }) : null;

  const getMissingTypesText = (missingTypes: string[]): string => {
    const typeLabels: Record<string, string> = {
      uppercase: t('uppercase'),
      lowercase: t('lowercase'),
      numbers: t('numbers'),
      symbols: t('symbols'),
    };

    return missingTypes.map(type => typeLabels[type]).join(', ');
  };

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

      {password && compliance && !compliance.meetsRequirements && (
        <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-700 dark:text-yellow-500">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong>{t('complianceWarning')}</strong> {t('complianceMissing')} <strong>{getMissingTypesText(compliance.missingTypes)}</strong>
          </div>
        </div>
      )}

      {isCheckingPwned && Boolean(password) && (
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground animate-pulse mt-2">
          {t('checkingBreaches')}
        </div>
      )}

      {pwnedCount < 0 && !isCheckingPwned && hasCheckedCurrentPassword && (
        <div className="flex items-start gap-2 mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-700 dark:text-amber-500">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            {t('pwnedCheckUnavailable')}
          </div>
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
      
      {pwnedCount === 0 && !isCheckingPwned && hasCheckedCurrentPassword && (
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

