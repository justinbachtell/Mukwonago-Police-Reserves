import type { Application } from '@/types/application';
import { getAllApplications } from '@/actions/application';
import { ApplicationsTable } from '@/components/admin/applications/ApplicationsTable';
import { toISOString } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList } from 'lucide-react'

export default async function ApplicationsPage() {
  const rawApplications = await getAllApplications()

  // Convert date strings to Date objects
  const applications: Application[] = (rawApplications ?? []).map(app => ({
    ...app,
    created_at: toISOString(new Date(app.created_at)),
    updated_at: toISOString(new Date(app.updated_at))
  }))

  // Calculate application statistics
  const totalApplications = applications.length
  const pendingApplications = applications.filter(
    app => app.status === 'pending'
  ).length
  const approvedApplications = applications.filter(
    app => app.status === 'approved'
  ).length
  const rejectedApplications = applications.filter(
    app => app.status === 'rejected'
  ).length
  const processingRate =
    totalApplications > 0
      ? Math.round(
          ((approvedApplications + rejectedApplications) / totalApplications) *
            100
        )
      : 0

  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 pt-4 md:px-6 lg:px-10'>
      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ClipboardList className='size-5 text-purple-500' />
            Application Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-5'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Applications</p>
            <p className='mt-1 text-2xl font-bold'>{totalApplications}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              Pending Applications
            </p>
            <p className='mt-1 text-2xl font-bold'>{pendingApplications}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              Approved Applications
            </p>
            <p className='mt-1 text-2xl font-bold'>{approvedApplications}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              Rejected Applications
            </p>
            <p className='mt-1 text-2xl font-bold'>{rejectedApplications}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Processing Rate</p>
            <p className='mt-1 text-2xl font-bold'>{processingRate}%</p>
          </div>
        </CardContent>
      </Card>

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
