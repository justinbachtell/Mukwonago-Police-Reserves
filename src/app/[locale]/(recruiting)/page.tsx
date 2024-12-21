import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Building2, Shield, Star, Users } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-16 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            {t('description')}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              className="rounded-lg bg-blue-700 px-8 py-6 text-lg text-white hover:bg-blue-800"
            >
              <Link href="/application">
                {t('apply_now')}
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-lg border-blue-700 px-8 py-6 text-lg text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
            >
              <Link href="/about">{t('learn_more')}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="bg-white py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Serving Our Community Since 1926
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              The Mukwonago Police Department provides 24/7 police protection to over 8,000 residents
              across 8.2 square miles. Our reserve officers play a vital role in supporting our
              full-time officers and maintaining public safety.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
              <Building2 className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Professional Department
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Join a modern, well-equipped police department committed to excellence in law enforcement.
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
              <Shield className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {t('features.serve.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.serve.description')}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
              <Users className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {t('features.join.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.join.description')}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
              <Award className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {t('features.experience.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.experience.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Program */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Reserve Officer Program
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Our reserve officers are essential members of the Mukwonago Police Department,
              providing crucial support in various law enforcement activities.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
              <Star className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Duties & Responsibilities
              </h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>Patrol support</li>
                <li>Traffic control</li>
                <li>Special events security</li>
                <li>Community outreach</li>
                <li>Emergency response</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
              <Shield className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Requirements
              </h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>18 years or older</li>
                <li>Valid driver's license</li>
                <li>Clean background</li>
                <li>High school diploma/GED</li>
                <li>Physical fitness standards</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
              <Award className="mb-4 size-12 text-blue-700 dark:text-blue-400" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Benefits
              </h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>Professional training</li>
                <li>Law enforcement experience</li>
                <li>Community service</li>
                <li>Team environment</li>
                <li>Career development</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-blue-700 p-12 text-center dark:bg-blue-800">
          <h2 className="mb-4 text-3xl font-bold text-white">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-blue-100">
            {t('cta.description')}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              variant="secondary"
              className="rounded-lg bg-white px-8 py-6 text-lg text-blue-700 hover:bg-gray-100"
            >
              <Link href="/sign-up">{t('cta.button')}</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="rounded-lg bg-white px-8 py-6 text-lg text-blue-700 hover:bg-gray-100"
            >
              <Link href="tel:2623632400">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
