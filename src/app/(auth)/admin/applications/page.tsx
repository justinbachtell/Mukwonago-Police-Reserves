import type { Application } from '@/types/application';
import { getAllApplications } from '@/actions/application';
import { ApplicationsTable } from '@/components/admin/applications/ApplicationsTable';
import { toISOString } from '@/lib/utils'

export default async function ApplicationsPage() {
  const rawApplications = await getAllApplications();

  // Convert date strings to Date objects
  const applications: Application[] = (rawApplications ?? []).map(app => ({
    ...app,
    created_at: toISOString(new Date(app.created_at)),
    updated_at: toISOString(new Date(app.updated_at))
  }))

  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
      <div className='mb-6'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
          Application Management
        </h1>
        <p className='text-gray-600 dark:text-gray-300'>
          Review and manage user applications.
        </p>
      </div>

      <ApplicationsTable data={applications} />
    </div>
  )
}
