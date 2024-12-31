import type { LocalePrefixMode } from 'node_modules/next-intl/dist/types/src/routing/types';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  defaultLocale: 'en',
  localePrefix,
  locales: ['en'],
  name: 'Village of Mukwonago Police Reserves',
};
