import type { Application } from '@/types/application';
import { getAllApplications } from '@/actions/application';
import { ApplicationsTable } from '@/components/admin/applications/ApplicationsTable';

export default async function ApplicationsPage() {
  const rawApplications = await getAllApplications();

  // Convert date strings to Date objects
  const applications: Application[] = rawApplications.map(app => ({
    ...app,
    created_at: new Date(app.created_at),
    updated_at: new Date(app.updated_at),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Application Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Review and manage user applications.</p>
      </div>

      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Applications List
      </h2>
      <ApplicationsTable data={applications} />
    </div>
  );
}
