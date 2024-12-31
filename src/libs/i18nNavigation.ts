import { AppConfig } from '@/utils/AppConfig';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  defaultLocale: AppConfig.defaultLocale,
  localePrefix: AppConfig.localePrefix,
  locales: AppConfig.locales,
});

export const { usePathname, useRouter } = createNavigation(routing);
