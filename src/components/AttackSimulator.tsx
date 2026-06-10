import { Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { simulatePasswordAttack, type AttackProgress, type AttackSimulationResult } from '../utils/attackSimulator';
import { useLanguage } from '../i18n/useLanguage.ts';
import { translations } from '../i18n/translations.ts';

interface AttackSimulatorProps {
  password: string;
}

interface AttackLogEntry {
  id: number;
  text: string;
  tone?: 'muted' | 'success' | 'danger';
}

function formatNumber(value: number) {
  if (!isFinite(value)) return '∞';

  return new Intl.NumberFormat(undefined, {
    notation: value >= 100_000 ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDuration(seconds: number, language: 'en' | 'tr') {
  if (!isFinite(seconds)) return '∞';
  if (seconds < 1) return language === 'tr' ? '1 saniyeden kısa' : 'less than 1 second';

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  if (seconds < minute) return `${Math.round(seconds)} ${language === 'tr' ? 'saniye' : 'seconds'}`;
  if (seconds < hour) return `${Math.round(seconds / minute)} ${language === 'tr' ? 'dakika' : 'minutes'}`;
  if (seconds < day) return `${Math.round(seconds / hour)} ${language === 'tr' ? 'saat' : 'hours'}`;
  if (seconds < year) return `${Math.round(seconds / day)} ${language === 'tr' ? 'gün' : 'days'}`;

  return `${formatNumber(seconds / year)} ${language === 'tr' ? 'yıl' : 'years'}`;
}

export function AttackSimulator({ password }: AttackSimulatorProps) {
  const { t, language } = useLanguage();
  const [result, setResult] = useState<AttackSimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testedPassword, setTestedPassword] = useState('');
  const [logs, setLogs] = useState<AttackLogEntry[]>([]);

  const methodKeyMap: Record<AttackSimulationResult['method'], keyof typeof translations.en> = {
    dictionary: 'attackResultDictionary',
    mask: 'attackResultMask',
    bruteForce: 'attackResultBruteForce',
    notCracked: 'attackResultNotCracked',
  };

  const phaseKeyMap: Record<AttackProgress['phase'], keyof typeof translations.en> = {
    dictionary: 'attackPhaseDictionary',
    mask: 'attackPhaseMask',
    bruteForce: 'attackPhaseBruteForce',
  };

  const addLog = (text: string, tone: AttackLogEntry['tone'] = 'muted') => {
    setLogs((currentLogs) => [
      ...currentLogs.slice(-59),
      { id: currentLogs.length ? currentLogs[currentLogs.length - 1].id + 1 : 1, text, tone },
    ]);
  };

  const addProgressLog = (progress: AttackProgress) => {
    const phase = t(phaseKeyMap[progress.phase]);
    const lengthText = progress.currentLength ? ` | ${t('attackLength')}: ${progress.currentLength}` : '';
    const candidateText = progress.lastCandidate ? ` | ${t('attackLastCandidate')}: ${progress.lastCandidate}` : '';

    addLog(`${phase} | ${formatNumber(progress.attempts)} ${t('attackAttemptsShort')}${lengthText}${candidateText}`);
  };

  const runSimulation = async () => {
    if (!password || isRunning) return;

    setIsRunning(true);
    setResult(null);
    setTestedPassword(password);
    setLogs([]);
    addLog(t('attackLogStarted'), 'muted');

    try {
      const nextResult = await simulatePasswordAttack(password, {
        onProgress: addProgressLog,
      });

      setResult(nextResult);
      addLog(
        nextResult.cracked ? t(methodKeyMap[nextResult.method]) : t('attackResultNotCracked'),
        nextResult.cracked ? 'danger' : 'success',
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6 bg-card border border-border rounded-lg shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldAlert size={18} className="text-primary" />
              {t('attackSimulatorTitle')}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t('attackSimulatorDesc')}
            </p>
          </div>
          <button
            onClick={() => {
              setResult(null);
              setTestedPassword('');
              setLogs([]);
            }}
            title={t('attackReset')}
            className="shrink-0 p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <button
          onClick={() => void runSimulation()}
          disabled={!password || isRunning}
          className="w-full bg-secondary text-foreground font-semibold py-3 rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Play size={18} />
          {isRunning ? t('attackRunning') : t('attackRun')}
        </button>

        {(isRunning || logs.length > 0) && (
          <div className="bg-background border border-border rounded-md overflow-hidden">
            <div className="px-3 py-2 border-b border-border text-xs font-semibold text-foreground">
              {t('attackLogTitle')}
            </div>
            <div className="h-40 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={
                    log.tone === 'danger'
                      ? 'text-destructive'
                      : log.tone === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-muted-foreground'
                  }
                >
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-background border border-border rounded-md">
              <div className="text-muted-foreground">{t('attackResult')}</div>
              <div className={result.cracked ? 'font-bold text-destructive mt-1' : 'font-bold text-green-600 dark:text-green-400 mt-1'}>
                {t(methodKeyMap[result.method])}
              </div>
            </div>
            <div className="p-3 bg-background border border-border rounded-md">
              <div className="text-muted-foreground">{t('attackAttempts')}</div>
              <div className="font-bold text-foreground mt-1">{formatNumber(result.attempts)}</div>
            </div>
            <div className="p-3 bg-background border border-border rounded-md">
              <div className="text-muted-foreground">{t('attackSpeed')}</div>
              <div className="font-bold text-foreground mt-1">{formatNumber(result.attemptsPerSecond)} {t('attackPerSecond')}</div>
            </div>
            <div className="p-3 bg-background border border-border rounded-md">
              <div className="text-muted-foreground">{t('attackElapsed')}</div>
              <div className="font-bold text-foreground mt-1">{formatDuration(result.elapsedMs / 1000, language)}</div>
            </div>
            <div className="p-3 bg-background border border-border rounded-md sm:col-span-2">
              <div className="text-muted-foreground">{t('attackLimit')}</div>
              <div className="font-bold text-foreground mt-1">{formatNumber(result.maxAttempts)}</div>
            </div>
            <div className="p-3 bg-background border border-border rounded-md sm:col-span-2">
              <div className="text-muted-foreground">{t('attackFullEstimate')}</div>
              <div className="font-bold text-foreground mt-1">
                {formatDuration(result.estimatedFullSearchSeconds, language)}
              </div>
            </div>
            <div className="p-3 bg-background border border-border rounded-md sm:col-span-2">
              <div className="text-muted-foreground">{t('attackTestedPassword')}</div>
              <div className="font-mono font-bold text-foreground mt-1 break-all">{testedPassword}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
