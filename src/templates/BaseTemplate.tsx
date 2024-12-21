import { Toaster } from '@/components/ui/toaster';
import { AppConfig } from '@/utils/AppConfig';
import { useTranslations } from 'next-intl';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="w-full text-gray-700 antialiased">
      <div className="container mx-auto max-w-screen-xl px-4 lg:px-8">
        <header className="border-b border-gray-300">
          {/* <div className="pb-8 pt-16">
            <h1 className="text-3xl font-bold text-gray-900">
              {AppConfig.name}
            </h1>
            <h2 className="text-xl">{t('description')}</h2>
          </div> */}

          <div className="flex justify-between py-2">
            <nav>
              <ul className="flex flex-wrap gap-x-5 text-xl">
                {props.leftNav}
              </ul>
            </nav>

            <nav>
              <ul className="flex flex-wrap gap-x-5 text-xl">
                {props.rightNav}
              </ul>
            </nav>
          </div>
        </header>

        <main>{props.children}</main>
        <Toaster />

        <footer className="border-t border-gray-300 py-8 text-center text-sm">
          {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
          {t.rich('built_by', {
            author: () => (
              <a
                href="https://justinbachtell.com"
                className="text-blue-700 hover:border-b-2 hover:border-blue-700"
              >
                Justin Bachtell
              </a>
            ),
          })}
        </footer>
      </div>
    </div>
  );
};
