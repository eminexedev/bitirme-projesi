import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Wifi, Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { generatePassword } from '../utils/passwordGenerator';

interface WifiQrDialogProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
}

export function WifiQrDialog({ isOpen, onClose, password: initialPassword }: WifiQrDialogProps) {
  const { t } = useLanguage();
  const qrRef = useRef<HTMLDivElement>(null);
  const [ssid, setSsid] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  const [passwordMode, setPasswordMode] = useState<'random' | 'manual'>('random');
  const [manualPassword, setManualPassword] = useState(initialPassword);

  const currentPassword = passwordMode === 'random' ? initialPassword : manualPassword;

  // Initialize dialog state when opening
  // Dialog initialization pattern: setState used to reset component state when dialog opens
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (!isOpen) return;
    
    setManualPassword(initialPassword);
    setPasswordMode('random');
  }, [isOpen, initialPassword]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const qrValue = useMemo(() => {
    if (!isOpen) return '';
    // Format: WIFI:S:<SSID>;T:<WEP|WPA|blank>;P:<PASSWORD>;H:<true|false|blank>;;
    const tParam = encryption === 'nopass' ? '' : encryption;
    const hParam = hidden ? 'true' : 'false';
    // Escape special characters in SSID and Password
    const safeSsid = ssid.replace(/([\\;,:"])/g, '\\$1');
    const safePassword = currentPassword.replace(/([\\;,:"])/g, '\\$1');
    return `WIFI:T:${tParam};S:${safeSsid};P:${safePassword};H:${hParam};;`;
  }, [isOpen, ssid, encryption, hidden, currentPassword]);

  const handleGenerateRandomPassword = () => {
    const newPassword = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeSimilar: true,
      customExclude: '',
    });
    setManualPassword(newPassword);
    setPasswordMode('manual');
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `wifi_qr_${ssid || 'network'}_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2 text-foreground">
            <Wifi className="text-primary" size={20} />
            <h2 className="font-bold">{t('wifiQrTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title={t('close')}
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('wifiSsid')}</label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="My_WiFi_Network"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('manualPassword')}</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={manualPassword}
                    onChange={(e) => {
                      setManualPassword(e.target.value);
                      setPasswordMode('manual');
                    }}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <button
                  onClick={handleGenerateRandomPassword}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Rastgele şifre oluştur"
                  aria-label="Rastgele şifre oluştur"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="wifi-encryption" className="text-sm font-medium text-foreground">{t('wifiEncryption')}</label>
                <select
                  id="wifi-encryption"
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  <option value="WPA">WPA/WPA2/WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-ring"
                  />
                  {t('wifiHidden')}
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-inner border border-gray-200">
            <div ref={qrRef} className="flex items-center justify-center">
              {ssid.trim() ? (
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={false}
                />
              ) : (
                <div className="w-50 h-50 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-center p-4">
                  {t('wifiSsid')}...
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-gray-500 font-mono text-center break-all max-w-full">
              {ssid.trim() ? qrValue : ''}
            </p>
            {ssid.trim() && (
              <button
                onClick={handleDownloadQR}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                title="QR kodu PNG olarak indir"
              >
                <Download size={16} />
                İndir
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
