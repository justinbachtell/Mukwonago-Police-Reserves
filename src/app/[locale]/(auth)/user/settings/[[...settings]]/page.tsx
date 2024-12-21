import { getI18nPath } from '@/utils/Helpers';
import { UserProfile } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ISettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISettingsPageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Settings',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function SettingsPage(props: ISettingsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto flex justify-center px-4 py-8">
      <UserProfile
        path={getI18nPath('/user/settings', locale)}
      />
    </div>
  );
};
