type AppLocale = {
  id: string;
  name: string;
};

const locales = [
  {
    id: 'id',
    name: 'Indonesia'
  }
] satisfies AppLocale[];

export const AppConfig = {
  name: 'Klinik Pratama Amanah Healthcare',
  i18n: {
    locales,
    defaultLocale: 'id',
    localePrefix: 'never'
  },
  email: {
    support: 'amanahhealthcare.id@gmail.com'
  }
} as const;

export const AllLocales = AppConfig.i18n.locales.map((locale) => locale.id);
