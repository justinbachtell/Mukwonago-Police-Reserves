import { getUserApplications } from '@/actions/application'
import { getCurrentUser } from '@/actions/user'
import { getUserEventAssignments } from '@/actions/eventAssignment'
import { getUserTrainingAssignments } from '@/actions/trainingAssignment'
import { getAssignedEquipment } from '@/actions/assignedEquipment'
import { getPoliciesWithCompletionStatus } from '@/actions/policy'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Boxes,
  CalendarDays,
  Clock,
  GraduationCap,
  ScrollText,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(_props: Props) {
  return {
    description: 'View your application status and details',
    title: 'User Dashboard'
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch all user-specific data
  const [
    applications,
    eventAssignments,
    trainingAssignments,
    equipmentAssignments,
    policiesStatus
  ] = await Promise.all([
    getUserApplications(user.id),
    getUserEventAssignments(user.id),
    getUserTrainingAssignments(user.id),
    getAssignedEquipment(user.id),
    getPoliciesWithCompletionStatus()
  ])

  const latestApplication = applications[0]

  // Calculate statistics
  const activeEquipment = equipmentAssignments.filter(
    item => !item.checked_in_at
  ).length
  /* const upcomingEvents = eventAssignments.filter(
    assignment =>
      assignment.event && new Date(assignment.event.event_date) >= new Date()
  ).length */
  const completedEvents = eventAssignments.filter(
    assignment =>
      assignment.event && new Date(assignment.event.event_date) < new Date()
  ).length
  const completedTrainings = trainingAssignments.filter(
    assignment =>
      assignment.training &&
      new Date(assignment.training.training_date) < new Date()
  ).length
  const completedPoliciesCount = Object.values(
    policiesStatus.completedPolicies
  ).filter(Boolean).length
  const policyCompletionRate = Math.round(
    (completedPoliciesCount / policiesStatus.policies.length) * 100
  )

  return (
    <div className='mx-auto max-w-[1800px] space-y-8 px-4 py-6 sm:space-y-12 sm:px-6 sm:py-10 lg:px-8'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
          Welcome back, {user.first_name}!
        </h1>
        <p className='text-base text-gray-600 dark:text-gray-300 sm:text-lg'>
          Track your progress and upcoming activities below.
        </p>
      </div>

      {/* Application Status Card - Show only if there's a pending application */}
      {latestApplication?.status === 'pending' && (
        <Card className='overflow-hidden border-2 border-yellow-100 bg-yellow-50 shadow-md dark:border-yellow-900/50 dark:bg-yellow-900/20'>
          <CardHeader className='pb-2 sm:pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200 sm:text-xl'>
              <ShieldCheck className='size-5 sm:size-6' />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-yellow-800 dark:text-yellow-200 sm:text-base'>
              Your application is currently under review. We'll notify you once
              there's an update.
            </p>
            <p className='mt-1 text-xs text-yellow-700 dark:text-yellow-300 sm:text-sm'>
              Submitted on{' '}
              {new Date(latestApplication.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 gap-4 min-[450px]:grid-cols-2 lg:grid-cols-4 xl:gap-6'>
        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Your Equipment
            </CardTitle>
            <Boxes className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {activeEquipment}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              Active assignments
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Your Events
            </CardTitle>
            <CalendarDays className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {completedEvents}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              Completed events
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Your Training
            </CardTitle>
            <GraduationCap className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {completedTrainings}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              Completed sessions
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Your Policies
            </CardTitle>
            <ScrollText className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {completedPoliciesCount}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              {policyCompletionRate}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Grid */}
      <div className='grid gap-4 sm:gap-8 lg:grid-cols-3'>
        {/* Equipment List */}
        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='pb-2 sm:pb-3'>
            <CardTitle className='text-lg font-semibold sm:text-xl'>
              Current Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4 sm:space-y-6'>
              {equipmentAssignments
                .filter(item => !item.checked_in_at)
                .map(item => (
                  <div
                    key={item.id}
                    className='flex items-center gap-3 sm:gap-4'
                  >
                    <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-muted bg-background sm:size-10'>
                      <Boxes className='size-4 text-muted-foreground sm:size-5' />
                    </div>
                    <div className='min-w-0 flex-1 space-y-0.5 sm:space-y-1'>
                      <p className='truncate text-sm font-medium leading-none sm:text-base'>
                        {item.equipment?.name}
                      </p>
                      <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                        <Clock className='mr-1 size-3 shrink-0 sm:size-4' />
                        <span className='truncate'>
                          Checked out{' '}
                          {formatDistanceToNow(new Date(item.checked_out_at), {
                            addSuffix: true
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant='secondary'
                      className='ml-auto shrink-0 text-xs font-medium sm:text-sm'
                    >
                      {item.condition}
                    </Badge>
                  </div>
                ))}
              {equipmentAssignments.filter(item => !item.checked_in_at)
                .length === 0 && (
                <p className='text-center text-sm text-muted-foreground'>
                  No active equipment assignments
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='pb-2 sm:pb-3'>
            <CardTitle className='text-lg font-semibold sm:text-xl'>
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4 sm:space-y-6'>
              {eventAssignments.length > 0 ? (
                eventAssignments
                  .filter(
                    assignment =>
                      assignment.event &&
                      new Date(assignment.event.event_date) >= new Date()
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.event!.event_date).getTime() -
                      new Date(b.event!.event_date).getTime()
                  )
                  .slice(0, 5)
                  .map(assignment => (
                    <div
                      key={assignment.id}
                      className='flex items-center gap-3 sm:gap-4'
                    >
                      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-muted bg-background sm:size-10'>
                        <CalendarDays className='size-4 text-muted-foreground sm:size-5' />
                      </div>
                      <div className='min-w-0 flex-1 space-y-0.5 sm:space-y-1'>
                        <p className='truncate text-sm font-medium leading-none sm:text-base'>
                          {assignment.event?.event_name}
                        </p>
                        <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                          <Clock className='mr-1 size-3 shrink-0 sm:size-4' />
                          <span className='truncate'>
                            {formatDistanceToNow(
                              new Date(assignment.event!.event_date),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='secondary'
                        className='ml-auto shrink-0 text-xs font-medium sm:text-sm'
                      >
                        {assignment.event?.event_type}
                      </Badge>
                    </div>
                  ))
              ) : (
                <p className='text-center text-sm text-muted-foreground'>
                  No upcoming events
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Training */}
        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='pb-2 sm:pb-3'>
            <CardTitle className='text-lg font-semibold sm:text-xl'>
              Upcoming Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4 sm:space-y-6'>
              {(() => {
                const upcomingTraining = trainingAssignments
                  .filter(
                    assignment =>
                      assignment.training &&
                      new Date(assignment.training.training_date) >= new Date()
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.training!.training_date).getTime() -
                      new Date(b.training!.training_date).getTime()
                  )
                  .slice(0, 5)

                return upcomingTraining.length > 0 ? (
                  upcomingTraining.map(assignment => (
                    <div
                      key={assignment.id}
                      className='flex items-center gap-3 sm:gap-4'
                    >
                      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-muted bg-background sm:size-10'>
                        <GraduationCap className='size-4 text-muted-foreground sm:size-5' />
                      </div>
                      <div className='min-w-0 flex-1 space-y-0.5 sm:space-y-1'>
                        <p className='truncate text-sm font-medium leading-none sm:text-base'>
                          {assignment.training?.name}
                        </p>
                        <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                          <Clock className='mr-1 size-3 shrink-0 sm:size-4' />
                          <span className='truncate'>
                            {formatDistanceToNow(
                              new Date(assignment.training!.training_date),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='secondary'
                        className='ml-auto shrink-0 text-xs font-medium sm:text-sm'
                      >
                        {assignment.training?.training_type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className='text-center text-sm text-muted-foreground'>
                    No upcoming training
                  </p>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Link
          href='/user/equipment'
          className='group rounded-lg border-2 border-muted bg-card p-4 shadow-sm transition-all hover:shadow-md'
        >
          <div className='flex items-center gap-3'>
            <Boxes className='size-5 text-muted-foreground transition-colors group-hover:text-primary' />
            <span className='font-medium'>View Equipment</span>
          </div>
        </Link>
        <Link
          href='/user/events'
          className='group rounded-lg border-2 border-muted bg-card p-4 shadow-sm transition-all hover:shadow-md'
        >
          <div className='flex items-center gap-3'>
            <CalendarDays className='size-5 text-muted-foreground transition-colors group-hover:text-primary' />
            <span className='font-medium'>View Events</span>
          </div>
        </Link>
        <Link
          href='/user/training'
          className='group rounded-lg border-2 border-muted bg-card p-4 shadow-sm transition-all hover:shadow-md'
        >
          <div className='flex items-center gap-3'>
            <GraduationCap className='size-5 text-muted-foreground transition-colors group-hover:text-primary' />
            <span className='font-medium'>View Training</span>
          </div>
        </Link>
        <Link
          href='/user/policies'
          className='group rounded-lg border-2 border-muted bg-card p-4 shadow-sm transition-all hover:shadow-md'
        >
          <div className='flex items-center gap-3'>
            <ScrollText className='size-5 text-muted-foreground transition-colors group-hover:text-primary' />
            <span className='font-medium'>View Policies</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
