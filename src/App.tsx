import React, { useState, useCallback, useEffect } from 'react';
import { PasswordDisplay } from './components/PasswordDisplay';
import { StrengthMeter } from './components/StrengthMeter';
import { Controls } from './components/Controls';
import { PasswordHistory } from './components/PasswordHistory';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { PresetDialog } from './components/PresetDialog';
import { useLanguage } from './i18n/useLanguage.ts';

import { generatePassword, type PasswordOptions } from './utils/passwordGenerator';
import { generatePassphrase } from './utils/passphraseGenerator';
import { generatePronounceable } from './utils/pronounceableGenerator';
import { calculateStrength } from './utils/strengthCalculator';
import { checkPwned } from './utils/pwnedChecker';

import { ShieldCheck, Zap, RefreshCw, Wifi, Building, Share2, Key } from 'lucide-react';
import { cn } from './utils/cn';
import { WelcomeDialog } from './components/WelcomeDialog';
import { WifiQrDialog } from './components/WifiQrDialog';

type Mode = 'standard' | 'passphrase' | 'pronounceable';

const MODE_LABEL_KEYS: Record<Mode, 'standardModeLabel' | 'passphraseModeLabel' | 'pronounceableModeLabel'> = {
  standard: 'standardModeLabel',
  passphrase: 'passphraseModeLabel',
  pronounceable: 'pronounceableModeLabel',
};

function loadHistory() {
  const saved = localStorage.getItem('passwordHistory');
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function generatePasswordValue(
  mode: Mode,
  options: PasswordOptions,
  wordCount: number,
  separator: string,
) {
  if (mode === 'standard') {
    return generatePassword(options);
  }

  if (mode === 'passphrase') {
    return generatePassphrase(wordCount, separator);
  }

  return generatePronounceable(options.length);
}

export default function App() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('standard');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    customExclude: '',
  });
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');

  const [history, setHistory] = useState<string[]>(loadHistory);
  const [selectedPreset, setSelectedPreset] = useState<'wifi' | 'banking' | 'social' | 'admin' | null>(null);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('welcomeSeen');
    } catch (err) {
      console.debug('Could not read welcomeSeen from localStorage', err);
      return true;
    }
  });
  const [showWifiQrDialog, setShowWifiQrDialog] = useState(false);
  const [isWifiMode, setIsWifiMode] = useState(false);
  const sectionLabelClassName = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground';

  const initialPassword = generatePasswordValue('standard', {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    customExclude: '',
  }, 4, '-');

  const [password, setPassword] = useState(initialPassword);

  const strength = calculateStrength(password);
  
  // Pwned Check State
  const [pwnedCount, setPwnedCount] = useState<number>(0);
  const [isCheckingPwned, setIsCheckingPwned] = useState(Boolean(initialPassword));
  const [lastCheckedPassword, setLastCheckedPassword] = useState<string | null>(null);

  // Handle generation
  const handleGenerate = useCallback((
    selectedMode: Mode = mode,
    selectedOptions: PasswordOptions = options,
    selectedWordCount: number = wordCount,
    selectedSeparator: string = separator,
    saveToHistory: boolean = true,
  ) => {
    const newPassword = generatePasswordValue(
      selectedMode,
      selectedOptions,
      selectedWordCount,
      selectedSeparator,
    );

    if (!newPassword) return;

    setPassword(newPassword);
    setPwnedCount(0);
    setIsCheckingPwned(true);
    setLastCheckedPassword(null);
    
    // Save to history
    if (saveToHistory) {
      setHistory(prev => {
        const newHistory = [newPassword, ...prev.filter(p => p !== newPassword)].slice(0, 5);
        localStorage.setItem('passwordHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }

  }, [mode, options, wordCount, separator]);

  // Presets
  const handlePresetClick = (preset: 'wifi' | 'banking' | 'social' | 'admin') => {
    setSelectedPreset(preset);
    setShowPresetDialog(true);
  };

  const applyPreset = (preset: 'wifi' | 'banking' | 'social' | 'admin') => {
    let nextOptions: PasswordOptions;
    if (preset === 'wifi') {
      nextOptions = { length: 24, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: true, customExclude: '' };
    } else if (preset === 'banking') {
      nextOptions = { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeSimilar: false, customExclude: '' };
    } else if (preset === 'social') {
      nextOptions = { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeSimilar: false, customExclude: '' };
    } else if (preset === 'admin') {
      nextOptions = { length: 64, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeSimilar: false, customExclude: '' };
    } else {
      nextOptions = options;
    }

    setMode('standard');
    setOptions(nextOptions);
    setIsWifiMode(preset === 'wifi');
    void handleGenerate('standard', nextOptions, wordCount, separator);
    setShowPresetDialog(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setIsWifiMode(false);
    setPwnedCount(0);
    setIsCheckingPwned(Boolean(value));
    setLastCheckedPassword(null);
  };

  useEffect(() => {
    // welcomeShown handled via lazy initial state

    let isActive = true;

    if (!password) {
      return () => {
        isActive = false;
      };
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        const count = await checkPwned(password);
        if (!isActive) return;

        setPwnedCount(count);
        setLastCheckedPassword(password);
        setIsCheckingPwned(false);
      })();
    }, 450);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [password]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('passwordHistory');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center selection:bg-primary/30">
      
      <PresetDialog 
        isOpen={showPresetDialog} 
        preset={selectedPreset} 
        onClose={() => setShowPresetDialog(false)}
        onConfirm={() => selectedPreset && applyPreset(selectedPreset)}
      />
      <WelcomeDialog
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onAcknowledge={() => {
          try {
            localStorage.setItem('welcomeSeen', 'true');
          } catch (err) {
            console.debug('Failed to persist welcomeSeen', err);
          }
          setShowWelcome(false);
        }}
      />
      <WifiQrDialog
        isOpen={showWifiQrDialog}
        onClose={() => setShowWifiQrDialog(false)}
        password={password}
      />

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 animate-fade-in">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary" size={32} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SecureKey</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
        
        {/* Left Column - Output & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <PasswordDisplay 
            password={password} 
            onQrClick={() => setShowWifiQrDialog(true)}
            showQrButton={isWifiMode}
          />

          <div className="flex flex-col gap-2 w-full p-4 md:p-6 bg-card border border-border rounded-lg shadow-sm">
            <label htmlFor="manual-password" className={sectionLabelClassName}>
              {t('manualPassword')}
            </label>
            <input
              id="manual-password"
              type="text"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder={t('manualPasswordPlaceholder')}
              className="px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <StrengthMeter
              password={password}
              strength={strength}
              pwnedCount={pwnedCount}
              isCheckingPwned={isCheckingPwned}
              checkedPassword={lastCheckedPassword}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => void handleGenerate()}
              className="flex-1 bg-primary text-primary-foreground font-bold text-lg py-4 rounded-lg shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2 group"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                {t('generateButton')}
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-secondary p-1 rounded-lg">
            {(['standard', 'passphrase', 'pronounceable'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setIsWifiMode(false);
                  void handleGenerate(m, options, wordCount, separator);
                }}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors",
                  mode === m ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(MODE_LABEL_KEYS[m])}
              </button>
            ))}
          </div>

          {/* Conditional Controls */}
          {mode === 'standard' && (
             <Controls
               options={options}
               setOptions={setOptions}
               onOptionsChange={(nextOptions) => {
                 setIsWifiMode(false);
                 void handleGenerate('standard', nextOptions, wordCount, separator, false);
               }}
             />
          )}

          {mode === 'passphrase' && (
            <div className="flex flex-col gap-6 w-full p-6 bg-card border border-border rounded-lg shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="word-count" className={sectionLabelClassName}>{t('wordCount')}</label>
                  <span className="text-sm font-bold text-primary w-12 text-right tracking-wide">{wordCount}</span>
                </div>
                <input
                  id="word-count"
                  type="range"
                  min="3"
                  max="12"
                  value={wordCount}
                  onChange={(e) => {
                    const nextWordCount = parseInt(e.target.value, 10);
                    setWordCount(nextWordCount);
                    setIsWifiMode(false);

                    if (mode === 'passphrase') {
                      void handleGenerate('passphrase', options, nextWordCount, separator, false);
                    }
                  }}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="separator" className={sectionLabelClassName}>{t('separator')}</label>
                <select
                  id="separator"
                  value={separator}
                  onChange={(e) => {
                    setSeparator(e.target.value);
                    setIsWifiMode(false);
                  }}
                  className="px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="-">{t('hyphen')}</option>
                  <option value="_">{t('underscore')}</option>
                  <option value=" ">{t('space')}</option>
                  <option value=".">{t('dot')}</option>
                  <option value="">{t('none')}</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'pronounceable' && (
             <div className="flex flex-col gap-6 w-full p-6 bg-card border border-border rounded-lg shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="pronounceable-length" className={sectionLabelClassName}>{t('passwordLength')}</label>
                  <span className="text-sm font-bold text-primary w-12 text-right tracking-wide">{options.length}</span>
                </div>
                <input
                  id="pronounceable-length"
                  type="range"
                  min="4"
                  max="32"
                  value={options.length}
                  onChange={(e) => {
                    const nextLength = parseInt(e.target.value, 10);
                    setIsWifiMode(false);
                    setOptions(prev => {
                      const nextOptions = { ...prev, length: nextLength };

                      if (mode === 'pronounceable') {
                        void handleGenerate('pronounceable', nextOptions, wordCount, separator, false);
                      }

                      return nextOptions;
                    });
                  }}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('pronounceableDesc')}
              </p>
            </div>
          )}

        </div>

        {/* Right Column - Presets & History */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
             <h3 className={sectionLabelClassName + ' mb-4'}>{t('quickPresets')}</h3>
             <div className="grid grid-cols-2 gap-3">
               <PresetButton icon={<Wifi size={16}/>} label={t('wifi')} onClick={() => handlePresetClick('wifi')} />
               <PresetButton icon={<Building size={16}/>} label={t('banking')} onClick={() => handlePresetClick('banking')} />
               <PresetButton icon={<Share2 size={16}/>} label={t('social')} onClick={() => handlePresetClick('social')} />
               <PresetButton icon={<Key size={16}/>} label={t('admin')} onClick={() => handlePresetClick('admin')} />
             </div>
          </div>

          <PasswordHistory history={history} clearHistory={clearHistory} />

          <div className="bg-card border border-border p-4 rounded-lg shadow-sm text-sm text-muted-foreground">
             <div className="flex items-center gap-2 mb-2 text-foreground font-semibold">
               <Zap size={16} className="text-yellow-500" />
               {t('clientSideNotice')}
             </div>
             {t('clientSideDesc')}
          </div>

        </div>

      </main>
    </div>
  );
}

function PresetButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 bg-secondary/80 hover:bg-primary hover:text-primary-foreground text-secondary-foreground rounded-lg transition-all duration-200 border border-border/60 hover:border-primary group"
    >
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-90">{label}</span>
    </button>
  );
}
