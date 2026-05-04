import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Wifi } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';

interface WifiQrDialogProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
}

export function WifiQrDialog({ isOpen, onClose, password }: WifiQrDialogProps) {
  const { t } = useLanguage();
  const [ssid, setSsid] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Re-calculate QR value whenever inputs change
      // Format: WIFI:S:<SSID>;T:<WEP|WPA|blank>;P:<PASSWORD>;H:<true|false|blank>;;
      const tParam = encryption === 'nopass' ? '' : encryption;
      const hParam = hidden ? 'true' : 'false';
      // Escape special characters in SSID and Password if needed (though usually fine as raw strings, sometimes semicolons need escaping)
      const safeSsid = ssid.replace(/([\\;,:"])/g, '\\$1');
      const safePassword = password.replace(/([\\;,:"])/g, '\\$1');
      
      const value = `WIFI:T:${tParam};S:${safeSsid};P:${safePassword};H:${hParam};;`;
      setQrValue(value);
    }
  }, [ssid, encryption, hidden, password, isOpen]);

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

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-foreground">{t('wifiEncryption')}</label>
                <select
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
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-center p-4">
                {t('wifiSsid')}...
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500 font-mono text-center break-all max-w-full">
              {ssid.trim() ? qrValue : ''}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
