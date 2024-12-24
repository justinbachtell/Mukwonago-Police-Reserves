import { getUserApplications } from '@/actions/application';
import { getCurrentUser } from '@/actions/user';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(_props: Props) {
  return {
    title: 'User Dashboard',
    description: 'View your application status and details',
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const applications = await getUserApplications(user.id);
  const latestApplication = applications[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Welcome back,
          {' '}
          {user.first_name}
          !
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 sm:text-lg">
          Track your application progress below
        </p>
      </div>

      {latestApplication
        ? (
            <Card className="overflow-hidden">
              <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                      Reserve Officer Application Status
                    </h2>
                    <Badge
                      className="w-fit text-sm font-medium"
                      variant={
                        latestApplication.status === 'approved'
                          ? 'success'
                          : latestApplication.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {latestApplication.status.charAt(0).toUpperCase()
                      + latestApplication.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Submitted on
                    {' '}
                    <span className="font-medium">
                      {new Date(latestApplication.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          )
        : (
            <Card className="overflow-hidden border-2 border-gray-100 p-6 shadow-lg dark:border-gray-800 sm:p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="rounded-full bg-yellow-50 p-3 ring-4 ring-yellow-50/30 dark:bg-yellow-900/30 dark:ring-yellow-900/20 sm:p-4">
                  <Clock className="size-6 text-yellow-600 dark:text-yellow-400 sm:size-8" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                    Start Your Journey
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                    You haven't submitted an application yet.
                  </p>
                  <Link
                    href="/user/application"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-blue-600 sm:px-6 sm:py-3 sm:text-base"
                  >
                    Apply Now
                    <svg
                      className="ml-2 size-4 sm:size-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </Card>
          )}
    </div>
  );
}
