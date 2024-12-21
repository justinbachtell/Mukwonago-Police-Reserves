import type { LocalePrefixMode } from 'node_modules/next-intl/dist/types/src/routing/types';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'Village of Mukwonago Police Reserves',
  locales: ['en'],
  defaultLocale: 'en',
  localePrefix,
};
