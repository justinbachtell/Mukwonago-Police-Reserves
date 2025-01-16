import { getUserEventAssignments } from '@/actions/eventAssignment'
import { getCurrentUser } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, ListPlus } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { UserEventsTable } from '@/components/user/events/UserEventsTable'
import { UserEventsGrid } from '@/components/user/events/UserEventsGrid'
import { ViewToggle } from '@/components/ui/view-toggle'
import { Suspense } from 'react'

export const metadata = {
  title: 'My Events - Mukwonago Police Reserves',
  description: 'View your event assignments and sign up for new events'
}

export default async function UserEventsPage() {
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  const eventAssignments = await getUserEventAssignments(user.id)

  return (
    <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>My Events</h1>
          <p className='mt-2 text-muted-foreground'>
            View and manage your event assignments
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Link href='/events'>
            <Button size='default' variant='outline' className='gap-2'>
              <ListPlus className='size-4' />
              View All Events
            </Button>
          </Link>
          <ViewToggle />
        </div>
      </div>

      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarDays className='size-5 text-green-500' />
            Event Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-3'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Assignments</p>
            <p className='mt-1 text-2xl font-bold'>
              {eventAssignments?.length ?? 0}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Upcoming Events</p>
            <p className='mt-1 text-2xl font-bold'>
              {eventAssignments?.filter(
                assignment =>
                  assignment.event &&
                  new Date(assignment.event.event_date) >= new Date()
              ).length ?? 0}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Completed Events</p>
            <p className='mt-1 text-2xl font-bold'>
              {eventAssignments?.filter(
                assignment =>
                  assignment.event &&
                  new Date(assignment.event.event_date) < new Date()
              ).length ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Loading events...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <UserEventsTable data={eventAssignments ?? []} />
        {/* @ts-expect-error Async Server Component */}
        <UserEventsGrid data={eventAssignments ?? []} />
      </Suspense>
    </div>
  )
}
