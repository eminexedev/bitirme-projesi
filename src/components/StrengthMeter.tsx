import { type Strength, type StrengthResult, type StrengthWarningCode, checkPasswordCompliance } from '../utils/strengthCalculator';
import { computeEntropyDetails } from '../utils/strengthCalculator';
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
  const [showDetails, setShowDetails] = useState(false);

  const formatGuesses = (g: number) => {
    if (!isFinite(g)) return '∞';
    if (g <= 0) return '0';
    // Use compact notation for large numbers when supported
    try {
      const nf = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 });
      if (g >= 1000) return nf.format(g);
    } catch {
      // fall through
    }
    // Fallback to exponential for extremely large
    if (g >= 1e12) return g.toExponential(2);
    return Math.round(g).toLocaleString();
  };

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

  const getStrengthWarningText = (warning: StrengthWarningCode): string => {
    const warningMap: Record<StrengthWarningCode, keyof typeof translations.en> = {
      shortLength: 'warningShortLength',
      datePattern: 'warningDatePattern',
      yearPattern: 'warningYearPattern',
      personalInfo: 'warningPersonalInfo',
      commonPattern: 'warningCommonPattern',
      keyboardPattern: 'warningKeyboardPattern',
      shiftPattern: 'warningShiftPattern',
      sequencePattern: 'warningSequencePattern',
      repetitionPattern: 'warningRepetitionPattern',
      repeatingBlockPattern: 'warningRepeatingBlockPattern',
    };

    return t(warningMap[warning]);
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

      {/* Entropy / crack time estimates */}
      {password && (
        (() => {
          const details = computeEntropyDetails(password);
          const fmt = (s: number) => {
            if (!isFinite(s) || s > 3600 * 24 * 365 * 1000) return t('veryLong');
            const sec = Math.round(s);
            if (sec < 1) return '<1s';
            const minutes = Math.floor(sec / 60);
            if (minutes < 1) return `${sec}s`;
            const hours = Math.floor(minutes / 60);
            if (hours < 1) return `${minutes}m`;
            const days = Math.floor(hours / 24);
            if (days < 1) return `${hours}h`;
            const years = (days / 365).toFixed(1);
            return `${years}y`;
          };

          return (
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="font-medium">{t('entropy')}: {Math.round(details.adjustedEntropy)} bits</div>

              <div className="flex items-center justify-between gap-4 mt-1">
                <div className="text-[11px] text-muted-foreground">{t('guesses')}: <strong>{formatGuesses(details.guesses)}</strong></div>
                <button
                  onClick={() => setShowDetails(s => !s)}
                  className="text-[11px] text-primary underline decoration-primary/60 underline-offset-2 hover:decoration-primary/80 focus:outline-none"
                >
                  {showDetails ? t('hideDetails') : t('showDetails')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                <div>{t('attack_online_throttled')}: <strong>{fmt(details.crackTimes.online_throttled)}</strong></div>
                <div>{t('attack_online_unthrottled')}: <strong>{fmt(details.crackTimes.online_unthrottled)}</strong></div>
                <div>{t('attack_offline_slow')}: <strong>{fmt(details.crackTimes.offline_slow)}</strong></div>
                <div>{t('attack_offline_gpu')}: <strong>{fmt(details.crackTimes.offline_gpu)}</strong></div>
                <div>{t('attack_offline_highend')}: <strong>{fmt(details.crackTimes.offline_highend)}</strong></div>
              </div>

              {showDetails && (
                <div className="mt-3 p-3 bg-muted/5 border border-muted/10 rounded text-[12px]">
                  <div className="font-medium mb-1">{t('detailsTitle')}</div>
                  <div className="text-[11px] mb-1">{t('baseEntropy')}: <strong>{Math.round(details.baseEntropy)} bits</strong></div>
                  <div className="text-[11px] mb-2">{t('adjustedEntropy')}: <strong>{Math.round(details.adjustedEntropy)} bits</strong></div>
                  <div className="text-[11px] mb-1">{t('guesses')}: <strong>{formatGuesses(details.guesses)}</strong></div>
                  <div className="mt-2 text-[11px]">
                    {(() => {
                      const labelKeyMap: Record<string, keyof typeof translations.en> = {
                        online_throttled: 'attack_online_throttled',
                        online_unthrottled: 'attack_online_unthrottled',
                        offline_slow: 'attack_offline_slow',
                        offline_gpu: 'attack_offline_gpu',
                        offline_highend: 'attack_offline_highend',
                      };

                      return Object.entries(details.crackTimes).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <div className="capitalize">{t(labelKeyMap[k] ?? k)}</div>
                          <div><strong>{fmt(v)}</strong></div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}
      {password && compliance && !compliance.meetsRequirements && (
        <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-700 dark:text-yellow-500">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong>{t('complianceWarning')}</strong> {t('complianceMissing')} <strong>{getMissingTypesText(compliance.missingTypes)}</strong>
          </div>
        </div>
      )}

      {password && strength.warnings && strength.warnings.length > 0 && (
        <div className="flex items-start gap-2 mt-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-md text-orange-700 dark:text-orange-400">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong>{t('patternWarning')}</strong>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {strength.warnings.map((warning) => (
                <li key={warning}>{getStrengthWarningText(warning)}</li>
              ))}
            </ul>
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

