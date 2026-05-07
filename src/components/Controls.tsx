import { type PasswordOptions } from '../utils/passwordGenerator';
import { useLanguage } from '../i18n/useLanguage.ts';

interface ControlsProps {
  options: PasswordOptions;
  setOptions: React.Dispatch<React.SetStateAction<PasswordOptions>>;
  onOptionsChange?: (nextOptions: PasswordOptions) => void;
}

export function Controls({ options, setOptions, onOptionsChange }: ControlsProps) {
  const { t } = useLanguage();

  const updateOptions = (updater: (prev: PasswordOptions) => PasswordOptions) => {
    setOptions((prev) => {
      const nextOptions = updater(prev);
      onOptionsChange?.(nextOptions);
      return nextOptions;
    });
  };

  const handleCheckboxChange = (key: keyof PasswordOptions) => {
    if (
      typeof options[key] === 'boolean' &&
      options[key] &&
      !options.uppercase && !options.lowercase && !options.numbers && !options.symbols &&
      key === 'uppercase'
    ) {
        // do nothing
    }

    const activeCount = [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length;
    if (activeCount === 1 && options[key] === true && (key === 'uppercase' || key === 'lowercase' || key === 'numbers' || key === 'symbols')) {
      return;
    }

    updateOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-6 w-full p-6 bg-card border border-border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CheckboxOption
          id="uppercase"
          label={t('uppercase')}
          checked={options.uppercase}
          onChange={() => handleCheckboxChange('uppercase')}
        />
        <CheckboxOption
          id="lowercase"
          label={t('lowercase')}
          checked={options.lowercase}
          onChange={() => handleCheckboxChange('lowercase')}
        />
        <CheckboxOption
          id="numbers"
          label={t('numbers')}
          checked={options.numbers}
          onChange={() => handleCheckboxChange('numbers')}
        />
        <CheckboxOption
          id="symbols"
          label={t('symbols')}
          checked={options.symbols}
          onChange={() => handleCheckboxChange('symbols')}
        />
      </div>

      <hr className="border-border my-2" />

      <div className="flex flex-col gap-4">
        <CheckboxOption
          id="excludeSimilar"
          label={t('excludeSimilar')}
          checked={options.excludeSimilar}
          onChange={() => handleCheckboxChange('excludeSimilar')}
        />
        
        <div className="flex flex-col gap-2">
          <label htmlFor="customExclude" className="text-sm font-medium text-muted-foreground">{t('customExclude')}</label>
          <input
            id="customExclude"
            type="text"
            placeholder={t('customExcludePlaceholder')}
            value={options.customExclude}
            onChange={(e) => updateOptions((prev) => ({ ...prev, customExclude: e.target.value }))}
            className="px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}

interface CheckboxOptionProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

function CheckboxOption({ id, label, checked, onChange }: CheckboxOptionProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group select-none">
      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary'}`}>
        {checked && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className="text-foreground font-medium">{label}</span>
      <input
        type="checkbox"
        id={id}
        className="hidden"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}

