import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

// Initialize isolated i18next instance
const zenTabI18n = i18n.createInstance();

zenTabI18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      vi: {
        translation: viTranslations,
      },
    },
    lng: 'vi', // default language, we will sync this dynamically in App.tsx
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already protects against XSS
    },
  });

export default zenTabI18n;
