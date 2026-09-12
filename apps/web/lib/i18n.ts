import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../locales/en/common.json';
import viCommon from '../locales/vi/common.json';

const resources = {
  en: { common: enCommon },
  vi: { common: viCommon },
};

// Khởi tạo i18next cho Client Components
i18n
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    lng: 'vi', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
  });

export default i18n;
