import { getUserApplications } from '@/actions/application';
import { getCurrentUser } from '@/actions/user';
import { ApplicationForm } from '@/components/forms/applicationForm';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(_props: Props) {
  return {
    title: 'Reserve Officer Application',
    description: 'Apply to become a reserve officer',
  };
}

export default async function ApplicationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const applications = await getUserApplications(user.id);
  const latestApplication = applications[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Reserve Officer Application
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {latestApplication
            ? 'View your application status and details.'
            : 'Please fill out all required information to apply for a reserve officer position.'}
        </p>
      </div>

      {latestApplication && latestApplication.status !== null
        ? (
            <div className="space-y-8">
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                    {latestApplication.status === 'pending' && (
                      <Clock className="size-6 text-blue-700 dark:text-blue-400" />
                    )}
                    {latestApplication.status === 'approved' && (
                      <CheckCircle className="size-6 text-green-700 dark:text-green-400" />
                    )}
                    {latestApplication.status === 'rejected' && (
                      <XCircle className="size-6 text-red-700 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      Application Status
                    </h2>
                    <p className="capitalize text-gray-600 dark:text-gray-300">
                      {latestApplication.status}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Submitted on
                      {' '}
                      {new Date(latestApplication.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Application Details
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Name</dt>
                        <dd className="text-gray-900 dark:text-white">
                          {latestApplication.first_name}
                          {' '}
                          {latestApplication.last_name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                        <dd className="text-gray-900 dark:text-white">{latestApplication.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Phone</dt>
                        <dd className="text-gray-900 dark:text-white">{latestApplication.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Driver's License</dt>
                        <dd className="text-gray-900 dark:text-white">{latestApplication.driver_license}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      Address Information
                    </h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Street Address</dt>
                        <dd className="text-gray-900 dark:text-white">{latestApplication.street_address}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">City</dt>
                        <dd className="text-gray-900 dark:text-white">{latestApplication.city}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">State</dt>
                        <dd className="text-gray-900 dark:text-white">{latestApplication.state}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">ZIP Code</dt>
                        <dd className="text-gray-900 dark:text-white">{latestApplication.zip_code}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      Additional Information
                    </h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Prior Experience</dt>
                        <dd className="capitalize text-gray-900 dark:text-white">
                          {latestApplication.prior_experience.replace(/_/g, ' ')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Availability</dt>
                        <dd className="capitalize text-gray-900 dark:text-white">
                          {latestApplication.availability}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Desired Position</dt>
                        <dd className="capitalize text-gray-900 dark:text-white">
                          {latestApplication.position}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </Card>
            </div>
          )
        : (
            <ApplicationForm user={user} />
          )}
    </div>
  );
}
