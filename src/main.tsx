import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    const shouldUpdate = window.confirm('Yeni bir sürüm mevut , güncellemek ister misiniz?');
    if (shouldUpdate) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.info('Uygulama çevrimdışı kullanılabilir.');
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

