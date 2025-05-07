import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationUA from '../locales/ua/translation.json';

const resources = {
  en: { translation: translationEN },
  ua: { translation: translationUA },
};

const directionMap = {
  en: 'ltr',
  ua: 'ltr',
  ar: 'rtl',
};

const setDirection = (lng) => {
  const direction = directionMap[lng] || 'ltr';
  document.documentElement.dir = direction;
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  setDirection(lng);
});

setDirection(i18n.language);

export default i18n;
