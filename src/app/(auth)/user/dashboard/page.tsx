import { getUserApplications } from '@/actions/application'
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
import { getCurrentUser, getUserById } from '@/actions/user'
import { createLogger } from '@/lib/debug'
import type { Route } from 'next'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'auth',
  file: 'user/dashboard/page.tsx'
})

export async function generateMetadata() {
  return {
    description: 'View your application status and details',
    title: 'User Dashboard'
  }
}

async function fetchAllUserData(userId: string) {
  const [
    applications,
    eventAssignments,
    trainingAssignments,
    equipmentAssignments,
    policiesStatus
  ] = await Promise.all([
    getUserApplications(userId),
    getUserEventAssignments(userId),
    getUserTrainingAssignments(userId),
    getAssignedEquipment(userId),
    getPoliciesWithCompletionStatus()
  ])

  return {
    applications,
    eventAssignments,
    trainingAssignments,
    equipmentAssignments,
    policiesStatus
  }
}

export default async function DashboardPage() {
  logger.info('Initializing dashboard page', undefined, 'DashboardPage')
  logger.time('dashboard-page-load')

  try {
    const authUser = await getCurrentUser()
    const user = authUser ? await getUserById(authUser.id) : null

    if (!user) {
      logger.warn('No user data found', undefined, 'DashboardPage')
      return redirect('/sign-in')
    }

    logger.time('fetch-user-data')
    const userData = await fetchAllUserData(user.id)
    logger.timeEnd('fetch-user-data')

    const {
      applications,
      eventAssignments,
      trainingAssignments,
      equipmentAssignments,
      policiesStatus
    } = userData

    const latestApplication = applications?.[0]

    // If user is a guest, show application-focused view
    if (user.role === 'guest') {
      return (
        <div className='min-h-screen'>
          <div className='container relative mx-auto space-y-8 px-4 md:px-6 lg:px-10'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
                Welcome, {user.first_name}!
              </h1>
              <p className='text-base text-gray-600 dark:text-gray-300 sm:text-lg'>
                Let's get started with your application process.
              </p>
            </div>

            {/* Application Status or CTA */}
            {latestApplication ? (
              <Card className='overflow-hidden border-0 bg-gradient-to-r from-yellow-50/90 to-yellow-100/90 shadow-lg backdrop-blur-sm dark:from-yellow-900/20 dark:to-yellow-800/20'>
                <CardHeader className='pb-2 sm:pb-3'>
                  <CardTitle className='flex items-center gap-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200 sm:text-xl'>
                    <ShieldCheck className='size-5 text-yellow-600 dark:text-yellow-400 sm:size-6' />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-yellow-800 dark:text-yellow-200 sm:text-base'>
                    Your application is currently {latestApplication.status}.{' '}
                    {latestApplication.status === 'pending'
                      ? "We'll notify you once there's an update."
                      : latestApplication.status === 'rejected'
                        ? 'You may submit a new application.'
                        : ''}
                  </p>
                  <p className='mt-1 text-xs text-yellow-700 dark:text-yellow-300 sm:text-sm'>
                    Submitted on{' '}
                    {new Date(
                      latestApplication.created_at
                    ).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className='overflow-hidden border-0 bg-gradient-to-r from-blue-50/90 to-blue-100/90 shadow-lg backdrop-blur-sm dark:from-blue-900/20 dark:to-blue-800/20'>
                <CardHeader className='pb-2 sm:pb-3'>
                  <CardTitle className='flex items-center gap-2 text-lg font-semibold text-blue-800 dark:text-blue-200 sm:text-xl'>
                    <ShieldCheck className='size-5 text-blue-600 dark:text-blue-400 sm:size-6' />
                    Start Your Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-sm text-blue-800 dark:text-blue-200 sm:text-base'>
                    Ready to join the Mukwonago Police Reserves? Complete your
                    application to get started.
                  </p>
                  <Link
                    href='/user/application'
                    className='inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:ring-blue-500'
                  >
                    Start Application
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )
    }

    // Calculate statistics for non-guest users
    const activeEquipment = (equipmentAssignments ?? []).filter(
      item => !item.checked_in_at
    ).length

    const completedEvents = (eventAssignments ?? []).filter(
      assignment =>
        assignment.event &&
        new Date(assignment.event.event_date).getTime() < Date.now()
    ).length

    const completedTrainings = (trainingAssignments ?? []).filter(
      assignment =>
        assignment.training &&
        new Date(assignment.training.training_date).getTime() < Date.now()
    ).length

    const completedPoliciesCount = Object.values(
      policiesStatus?.completedPolicies ?? {}
    ).filter(Boolean).length

    const policyCompletionRate = Math.round(
      (completedPoliciesCount / (policiesStatus?.policies?.length ?? 0)) * 100
    )

    logger.info(
      'Dashboard data loaded successfully',
      { userId: user.id },
      'DashboardPage'
    )

    return (
      <div className='min-h-screen px-4 md:px-6 lg:px-10'>
        <div className='container relative mx-auto space-y-8'>
          {/* Header Section */}
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
              Welcome back, {user.first_name}!
            </h1>
            <p className='text-base text-gray-600 dark:text-gray-300 sm:text-lg'>
              Track your progress and upcoming activities below.
            </p>
          </div>

          {/* Application Status Card */}
          {latestApplication?.status === 'pending' && (
            <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'>
              <CardHeader className='pb-2 sm:pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl'>
                  <ShieldCheck className='size-5 text-blue-500 dark:text-blue-400 sm:size-6' />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600 dark:text-gray-300 sm:text-base'>
                  Your application is currently under review. We'll notify you
                  once there's an update.
                </p>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm'>
                  Submitted on{' '}
                  {new Date(latestApplication.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6'>
            {[
              {
                title: 'Your Equipment',
                value: activeEquipment,
                label: 'Active assignments',
                icon: Boxes,
                color: 'blue'
              },
              {
                title: 'Your Events',
                value: completedEvents,
                label: 'Completed events',
                icon: CalendarDays,
                color: 'green'
              },
              {
                title: 'Your Training',
                value: completedTrainings,
                label: 'Completed sessions',
                icon: GraduationCap,
                color: 'purple'
              },
              {
                title: 'Your Policies',
                value: completedPoliciesCount,
                label: `${policyCompletionRate}% completion rate`,
                icon: ScrollText,
                color: 'indigo'
              }
            ].map((stat, index) => (
              <Card
                key={index}
                className='group overflow-hidden border-0 bg-white/80 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-white/5'
              >
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
                  <CardTitle className='text-sm font-semibold sm:text-base'>
                    {stat.title}
                  </CardTitle>
                  <stat.icon
                    className={`text- size-4${stat.color}-500 transition-transform group-hover:scale-110 sm:size-5`}
                  />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold sm:text-3xl'>
                    {stat.value}
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Grid */}
          <div className='grid gap-6 xl:grid-cols-2'>
            {/* Upcoming Events Card */}
            <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-white/5'>
              <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl'>
                  <CalendarDays className='size-5 text-green-500 dark:text-green-400' />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {(eventAssignments ?? [])
                    .filter(
                      assignment =>
                        assignment.event &&
                        new Date(assignment.event.event_date).getTime() >=
                          Date.now()
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.event!.event_date).getTime() -
                        new Date(b.event!.event_date).getTime()
                    )
                    .slice(0, 5)
                    .map(assignment => (
                      <Link
                        key={assignment.id}
                        href={`/user/events/${assignment.event?.id}` as Route}
                        className='group flex items-center gap-4 rounded-lg border border-gray-100 bg-white/50 p-3 transition-all hover:border-green-100 hover:bg-green-50/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-green-900/50 dark:hover:bg-green-900/20'
                      >
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-900/30'>
                          <CalendarDays className='size-5 text-green-500 dark:text-green-400' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium sm:text-base'>
                            {assignment.event?.event_name}
                          </p>
                          <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                            <Clock className='mr-1 size-3 sm:size-4' />
                            <span className='truncate'>
                              {formatDistanceToNow(
                                new Date(assignment.event!.event_date),
                                {
                                  addSuffix: true
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant='secondary'
                          className='ml-auto shrink-0 bg-green-50 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300 sm:text-sm'
                        >
                          {assignment.event?.event_type
                            ? formatEnumValueWithMapping(
                                assignment.event.event_type
                              )
                            : ''}
                        </Badge>
                      </Link>
                    ))}
                  {(eventAssignments ?? []).length === 0 && (
                    <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-8 dark:border-gray-800'>
                      <CalendarDays className='mb-2 size-8 text-gray-400' />
                      <p className='text-center text-sm text-muted-foreground'>
                        No upcoming events
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Training Card */}
            <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-white/5'>
              <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl'>
                  <GraduationCap className='size-5 text-purple-500 dark:text-purple-400' />
                  Upcoming Training
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {(() => {
                    const upcomingTraining = (trainingAssignments ?? [])
                      .filter(
                        assignment =>
                          assignment.training &&
                          new Date(
                            assignment.training.training_date
                          ).getTime() >= Date.now()
                      )
                      .sort(
                        (a, b) =>
                          new Date(a.training!.training_date).getTime() -
                          new Date(b.training!.training_date).getTime()
                      )
                      .slice(0, 5)

                    return upcomingTraining.length > 0 ? (
                      upcomingTraining.map(assignment => (
                        <Link
                          key={assignment.id}
                          href={
                            `/user/training/${assignment.training?.id}` as Route
                          }
                          className='group flex items-center gap-4 rounded-lg border border-gray-100 bg-white/50 p-3 transition-all hover:border-purple-100 hover:bg-purple-50/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-purple-900/50 dark:hover:bg-purple-900/20'
                        >
                          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-purple-100 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/30'>
                            <GraduationCap className='size-5 text-purple-500 dark:text-purple-400' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-sm font-medium sm:text-base'>
                              {assignment.training?.name}
                            </p>
                            <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                              <Clock className='mr-1 size-3 sm:size-4' />
                              <span className='truncate'>
                                {formatDistanceToNow(
                                  new Date(assignment.training!.training_date),
                                  {
                                    addSuffix: true
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant='secondary'
                            className='ml-auto shrink-0 bg-purple-50 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 sm:text-sm'
                          >
                            {assignment.training?.training_type
                              ? formatEnumValueWithMapping(
                                  assignment.training.training_type
                                )
                              : ''}
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-8 dark:border-gray-800'>
                        <GraduationCap className='mb-2 size-8 text-gray-400' />
                        <p className='text-center text-sm text-muted-foreground'>
                          No upcoming training
                        </p>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Equipment List Card */}
            <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-white/5'>
              <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl'>
                  <Boxes className='size-5 text-blue-500 dark:text-blue-400' />
                  Current Equipment
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {(equipmentAssignments ?? [])
                    .filter(item => !item.checked_in_at)
                    .map(item => (
                      <Link
                        key={item.id}
                        href={`/user/equipment/${item.equipment?.id}` as Route}
                        className='group flex items-center gap-4 rounded-lg border border-gray-100 bg-white/50 p-3 transition-all hover:border-blue-100 hover:bg-blue-50/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-blue-900/50 dark:hover:bg-blue-900/20'
                      >
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/30'>
                          <Boxes className='size-5 text-blue-500 dark:text-blue-400' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium sm:text-base'>
                            {item.equipment?.name}
                          </p>
                          <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                            <Clock className='mr-1 size-3 sm:size-4' />
                            <span className='truncate'>
                              Checked out{' '}
                              {formatDistanceToNow(
                                new Date(item.checked_out_at),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant='secondary'
                          className='ml-auto shrink-0 bg-blue-50 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 sm:text-sm'
                        >
                          {item.condition
                            ? formatEnumValueWithMapping(item.condition)
                            : ''}
                        </Badge>
                      </Link>
                    ))}
                  {(equipmentAssignments ?? []).filter(
                    item => !item.checked_in_at
                  ).length === 0 && (
                    <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-8 dark:border-gray-800'>
                      <Boxes className='mb-2 size-8 text-gray-400' />
                      <p className='text-center text-sm text-muted-foreground'>
                        No active equipment assignments
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className='flex w-full flex-col items-center justify-center gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6'>
            {[
              {
                href: '/user/equipment' as Route,
                icon: Boxes,
                label: 'View Equipment',
                color: 'blue',
                hoverClass: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
                iconClass: 'text-blue-500 dark:text-blue-400'
              },
              {
                href: '/user/events' as Route,
                icon: CalendarDays,
                label: 'View Events',
                color: 'green',
                hoverClass: 'hover:bg-green-50/50 dark:hover:bg-green-900/20',
                iconClass: 'text-green-500 dark:text-green-400'
              },
              {
                href: '/user/training' as Route,
                icon: GraduationCap,
                label: 'View Training',
                color: 'purple',
                hoverClass: 'hover:bg-purple-50/50 dark:hover:bg-purple-900/20',
                iconClass: 'text-purple-500 dark:text-purple-400'
              },
              {
                href: '/user/policies' as Route,
                icon: ScrollText,
                label: 'View Policies',
                color: 'red',
                hoverClass: 'hover:bg-red-50/50 dark:hover:bg-red-900/20',
                iconClass: 'text-red-500 dark:text-red-400'
              }
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`group flex w-full items-center justify-between rounded-lg border-0 bg-white/80 p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg ${action.hoverClass} dark:bg-white/5`}
              >
                <div className='flex w-full items-center justify-center gap-3 md:justify-start'>
                  <action.icon
                    className={`size-5 ${action.iconClass} transition-transform group-hover:scale-110`}
                  />
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {action.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error loading dashboard',
      logger.errorWithData(error),
      'DashboardPage'
    )
    return redirect('/sign-in')
  } finally {
    logger.timeEnd('dashboard-page-load')
  }
}
