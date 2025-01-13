import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers, getCurrentUser } from '@/actions/user'
import { getAllEquipment } from '@/actions/equipment'
import { getAllEvents } from '@/actions/event'
import { getAllPolicies } from '@/actions/policy'
import { getTrainings } from '@/actions/training'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Boxes,
  Users,
  CalendarDays,
  ScrollText,
  GraduationCap,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { redirect } from 'next/navigation'
import { db } from '@/libs/DB'
import { policyCompletion } from '@/models/Schema'
import { eq } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import Link from 'next/link'

const logger = createLogger({
  module: 'admin',
  file: 'dashboard/page.tsx'
})

export default async function AdminDashboardPage() {
  logger.info('Rendering admin dashboard', undefined, 'AdminDashboardPage')
  logger.time('dashboard-page-load')

  try {
    const user = await getCurrentUser()

    if (!user) {
      logger.warn(
        'No user found, redirecting to sign-in',
        undefined,
        'AdminDashboardPage'
      )
      redirect('/sign-in')
    }

    logger.info('Fetching dashboard data', undefined, 'AdminDashboardPage')

    // Fetch all required data
    const [users, equipment, events, policies, trainings] = await Promise.all([
      getAllUsers(),
      getAllEquipment(),
      getAllEvents(),
      getAllPolicies(),
      getTrainings()
    ])

    logger.info(
      'Dashboard data loaded',
      {
        userCount: users.length,
        equipmentCount: equipment?.length,
        eventCount: events?.length,
        policyCount: policies?.length,
        trainingCount: trainings?.length
      },
      'AdminDashboardPage'
    )

    // Calculate statistics
    const totalUsers = users.length
    const activeUsers = users.filter(
      user => user.role === 'member' || user.role === 'admin'
    ).length
    const totalEquipment = (equipment ?? []).length
    const availableEquipment = (equipment ?? []).filter(
      item => !item.is_assigned
    ).length
    const upcomingEvents = (events ?? []).filter(
      event => new Date(event.event_date).getTime() > new Date().getTime()
    ).length
    const upcomingTrainings = (trainings ?? []).filter(
      training =>
        new Date(training.training_date).getTime() > new Date().getTime()
    ).length

    // Get policy completion statistics
    logger.info(
      'Calculating policy completions',
      undefined,
      'AdminDashboardPage'
    )
    const policyCompletions = await Promise.all(
      (policies ?? []).map(async policy => {
        const completions = await db
          .select()
          .from(policyCompletion)
          .where(eq(policyCompletion.policy_id, policy.id))
        return completions
      })
    )
    const totalCompletions = policyCompletions.reduce(
      (acc: number, completions: any[]) => acc + completions.length,
      0
    )
    const averageCompletionRate =
      totalUsers > 0
        ? Math.round(
            (totalCompletions / (totalUsers * (policies?.length ?? 0))) * 100
          )
        : 0

    logger.info(
      'Statistics calculated',
      {
        totalUsers,
        activeUsers,
        totalEquipment,
        availableEquipment,
        upcomingEvents,
        upcomingTrainings,
        totalCompletions,
        averageCompletionRate
      },
      'AdminDashboardPage'
    )

    // Get recent users (last 5)
    const recentUsers = users
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)

    // Get upcoming events (next 5)
    const nextEvents = (events ?? [])
      .filter(
        event => new Date(event.event_date).getTime() > new Date().getTime()
      )
      .sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      )
      .slice(0, 5)

    // Get upcoming trainings (next 5)
    const nextTrainings = (trainings ?? [])
      .filter(
        training =>
          new Date(training.training_date).getTime() >= new Date().getTime()
      )
      .sort(
        (a, b) =>
          new Date(a.training_date).getTime() -
          new Date(b.training_date).getTime()
      )
      .slice(0, 5)

    logger.info(
      'Recent data prepared',
      {
        recentUsersCount: recentUsers.length,
        nextEventsCount: nextEvents.length,
        nextTrainingsCount: nextTrainings.length
      },
      'AdminDashboardPage'
    )

    return (
      <div className='min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900'>
        <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8 lg:py-10'>
          {/* Header Section with Gradient Text */}
          <div className='space-y-2'>
            <h1 className='bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-gray-400 sm:text-4xl'>
              Admin Dashboard
            </h1>
            <p className='text-base text-gray-600 dark:text-gray-300 sm:text-lg'>
              Monitor your organization's activities and manage resources below.
            </p>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6'>
            {[
              {
                title: 'Total Users',
                value: totalUsers,
                label: `${activeUsers} active members`,
                icon: Users,
                color: 'blue'
              },
              {
                title: 'Equipment',
                value: totalEquipment,
                label: `${availableEquipment} available`,
                icon: Boxes,
                color: 'green'
              },
              {
                title: 'Events',
                value: (events ?? []).length,
                label: `${upcomingEvents} upcoming`,
                icon: CalendarDays,
                color: 'purple'
              },
              {
                title: 'Training',
                value: (trainings ?? []).length,
                label: `${upcomingTrainings} upcoming`,
                icon: GraduationCap,
                color: 'indigo'
              },
              {
                title: 'Policies',
                value: (policies ?? []).length,
                label: `${averageCompletionRate}% completion`,
                icon: ScrollText,
                color: 'rose'
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
            <Card className='overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-white/5'>
              <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold sm:text-xl'>
                  <CalendarDays className='size-5 text-purple-500' />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {nextEvents.map(event => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className='group flex items-center gap-4 rounded-lg border border-gray-100 bg-white/50 p-3 transition-all hover:border-purple-100 hover:bg-purple-50/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-purple-900/50 dark:hover:bg-purple-900/20'
                    >
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-purple-100 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/30'>
                        <CalendarDays className='size-5 text-purple-500 dark:text-purple-400' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium sm:text-base'>
                          {event.event_name}
                        </p>
                        <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                          <Clock className='mr-1 size-3 sm:size-4' />
                          <span className='truncate'>
                            {formatDistanceToNow(new Date(event.event_date), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='secondary'
                        className='ml-auto shrink-0 bg-purple-50 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 sm:text-sm'
                      >
                        {event.event_type}
                      </Badge>
                    </Link>
                  ))}
                  {nextEvents.length === 0 && (
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

            {/* Training Activity Card */}
            <Card className='overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-white/5'>
              <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold sm:text-xl'>
                  <GraduationCap className='size-5 text-purple-500' />
                  Upcoming Training
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {nextTrainings.map(training => (
                    <Link
                      key={training.id}
                      href={`/admin/training/${training.id}`}
                      className='group flex items-center gap-4 rounded-lg border border-gray-100 bg-white/50 p-3 transition-all hover:border-purple-100 hover:bg-purple-50/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-purple-900/50 dark:hover:bg-purple-900/20'
                    >
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-purple-100 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/30'>
                        <GraduationCap className='size-5 text-purple-500 dark:text-purple-400' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium sm:text-base'>
                          {training.name}
                        </p>
                        <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                          <Clock className='mr-1 size-3 sm:size-4' />
                          <span className='truncate'>
                            {formatDistanceToNow(
                              new Date(training.training_date),
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
                        {training.training_type}
                      </Badge>
                    </Link>
                  ))}
                  {nextTrainings.length === 0 && (
                    <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-8 dark:border-gray-800'>
                      <GraduationCap className='mb-2 size-8 text-gray-400' />
                      <p className='text-center text-sm text-muted-foreground'>
                        No upcoming training sessions
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Users Card */}
            <Card className='overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-white/5'>
              <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold sm:text-xl'>
                  <Users className='size-5 text-blue-500' />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {recentUsers.map(user => (
                    <Link
                      key={user.id}
                      href={`/admin/users/${user.id}`}
                      className='group flex items-center gap-4 rounded-lg border border-gray-100 bg-white/50 p-3 transition-all hover:border-blue-100 hover:bg-blue-50/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-blue-900/50 dark:hover:bg-blue-900/20'
                    >
                      <Avatar className='size-10 border-2 border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/30'>
                        <AvatarFallback className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium sm:text-base'>
                          {user.first_name} {user.last_name}
                        </p>
                        <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                          <Clock className='mr-1 size-3 sm:size-4' />
                          <span className='truncate'>
                            Joined{' '}
                            {formatDistanceToNow(new Date(user.created_at), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='secondary'
                        className='ml-auto shrink-0 bg-blue-50 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 sm:text-sm'
                      >
                        {user.position}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className='grid w-full items-center justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6'>
            {[
              {
                href: '/admin/users',
                icon: Users,
                label: 'Manage Users',
                color: 'blue',
                hoverClass: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
                iconClass: 'text-blue-500'
              },
              {
                href: '/admin/equipment',
                icon: Boxes,
                label: 'Manage Equipment',
                color: 'green',
                hoverClass: 'hover:bg-green-50/50 dark:hover:bg-green-900/20',
                iconClass: 'text-green-500'
              },
              {
                href: '/admin/events',
                icon: CalendarDays,
                label: 'Manage Events',
                color: 'purple',
                hoverClass: 'hover:bg-purple-50/50 dark:hover:bg-purple-900/20',
                iconClass: 'text-purple-500'
              },
              {
                href: '/admin/training',
                icon: GraduationCap,
                label: 'Manage Training',
                color: 'indigo',
                hoverClass: 'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20',
                iconClass: 'text-indigo-500'
              },
              {
                href: '/admin/policies',
                icon: ScrollText,
                label: 'Manage Policies',
                color: 'rose',
                hoverClass: 'hover:bg-rose-50/50 dark:hover:bg-rose-900/20',
                iconClass: 'text-rose-500'
              }
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`group flex w-full items-center justify-between rounded-lg border-0 bg-white/80 p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg ${action.hoverClass} dark:bg-white/5`}
              >
                <div className='flex items-center gap-3'>
                  <action.icon
                    className={`size-5 ${action.iconClass} transition-transform group-hover:scale-110`}
                  />
                  <span className='font-medium'>{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in admin dashboard',
      logger.errorWithData(error),
      'AdminDashboardPage'
    )
    throw error
  } finally {
    logger.timeEnd('dashboard-page-load')
  }
}
