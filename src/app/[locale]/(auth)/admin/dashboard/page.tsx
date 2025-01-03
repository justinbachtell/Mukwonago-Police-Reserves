import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers, getCurrentUser } from '@/actions/user'
import { getAllEquipment } from '@/actions/equipment'
import { getAllEvents } from '@/actions/event'
import { getAllPolicies, getPolicyCompletions } from '@/actions/policy'
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
import type { Training } from '@/types/training'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch all required data
  const users = await getAllUsers()
  const equipment = await getAllEquipment()
  const events = await getAllEvents()
  const policies = await getAllPolicies()
  const trainings = await getTrainings()

  // Calculate statistics
  const totalUsers = users.length
  const activeUsers = users.filter(
    user => user.role === 'member' || user.role === 'admin'
  ).length
  const totalEquipment = equipment.length
  const availableEquipment = equipment.filter(item => !item.is_assigned).length
  const upcomingEvents = events.filter(
    event => new Date(event.event_date) > new Date()
  ).length
  const upcomingTrainings = trainings.filter(
    training => new Date(training.training_date) > new Date()
  ).length

  // Get policy completion statistics
  const policyCompletions = await Promise.all(
    policies.map(policy => getPolicyCompletions(policy.id))
  )
  const totalCompletions = policyCompletions.reduce(
    (acc, completions) => acc + completions.length,
    0
  )
  const averageCompletionRate =
    totalUsers > 0
      ? Math.round((totalCompletions / (totalUsers * policies.length)) * 100)
      : 0

  // Get recent users (last 5)
  const recentUsers = users
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)

  // Get upcoming events (next 5)
  const nextEvents = events
    .filter(event => new Date(event.event_date) > new Date())
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    )
    .slice(0, 5)

  // Get upcoming trainings (next 5)
  const nextTrainings = trainings
    .filter(training => new Date(training.training_date) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.training_date).getTime() -
        new Date(b.training_date).getTime()
    )
    .slice(0, 5)

  return (
    <div className='mx-auto max-w-[1800px] space-y-8 px-4 py-6 sm:space-y-12 sm:px-6 sm:py-10 lg:px-8'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
          Admin Dashboard
        </h1>
        <p className='text-base text-gray-600 dark:text-gray-300 sm:text-lg'>
          Overview of your organization's statistics and management tools.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 gap-4 min-[450px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6'>
        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Total Users
            </CardTitle>
            <Users className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>{totalUsers}</div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              {activeUsers} active members
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Equipment
            </CardTitle>
            <Boxes className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {totalEquipment}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              {availableEquipment} available items
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Events
            </CardTitle>
            <CalendarDays className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {events.length}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              {upcomingEvents} upcoming events
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Training
            </CardTitle>
            <GraduationCap className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {trainings.length}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              {upcomingTrainings} upcoming sessions
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
            <CardTitle className='text-sm font-semibold sm:text-base'>
              Policies
            </CardTitle>
            <ScrollText className='size-4 text-muted-foreground sm:size-5' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold sm:text-3xl'>
              {policies.length}
            </div>
            <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
              {averageCompletionRate}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Grid */}
      <div className='grid gap-4 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3'>
        {/* Recent Sign-ups */}
        <Card className='overflow-hidden shadow-md transition-all hover:shadow-lg'>
          <CardHeader className='pb-2 sm:pb-3'>
            <CardTitle className='text-lg font-semibold sm:text-xl'>
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4 sm:space-y-6'>
              {recentUsers.map(user => (
                <div key={user.id} className='flex items-center gap-3 sm:gap-4'>
                  <Avatar className='size-8 border-2 border-muted sm:size-10'>
                    <AvatarFallback className='text-sm sm:text-base'>
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1 space-y-0.5 sm:space-y-1'>
                    <p className='truncate text-sm font-medium leading-none sm:text-base'>
                      {user.first_name} {user.last_name}
                    </p>
                    <p className='truncate text-xs text-muted-foreground sm:text-sm'>
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    variant='secondary'
                    className='ml-auto shrink-0 text-xs font-medium sm:text-sm'
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
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
              {nextEvents.map(event => (
                <div
                  key={event.id}
                  className='flex items-center gap-3 sm:gap-4'
                >
                  <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-muted bg-background sm:size-10'>
                    <CalendarDays className='size-4 text-muted-foreground sm:size-5' />
                  </div>
                  <div className='min-w-0 flex-1 space-y-0.5 sm:space-y-1'>
                    <p className='truncate text-sm font-medium leading-none sm:text-base'>
                      {event.event_name}
                    </p>
                    <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                      <Clock className='mr-1 size-3 shrink-0 sm:size-4' />
                      <span className='truncate'>
                        {formatDistanceToNow(new Date(event.event_date), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant='secondary'
                    className='ml-auto shrink-0 text-xs font-medium sm:text-sm'
                  >
                    {event.event_type}
                  </Badge>
                </div>
              ))}
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
              {nextTrainings.map((training: Training) => (
                <div
                  key={training.id}
                  className='flex items-center gap-3 sm:gap-4'
                >
                  <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-muted bg-background sm:size-10'>
                    <GraduationCap className='size-4 text-muted-foreground sm:size-5' />
                  </div>
                  <div className='min-w-0 flex-1 space-y-0.5 sm:space-y-1'>
                    <p className='truncate text-sm font-medium leading-none sm:text-base'>
                      {training.name}
                    </p>
                    <div className='flex items-center text-xs text-muted-foreground sm:text-sm'>
                      <Clock className='mr-1 size-3 shrink-0 sm:size-4' />
                      <span className='truncate'>
                        {formatDistanceToNow(new Date(training.training_date), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant='secondary'
                    className='ml-auto shrink-0 text-xs font-medium sm:text-sm'
                  >
                    {training.training_type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
