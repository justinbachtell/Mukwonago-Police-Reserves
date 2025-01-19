'use client'

import { getAllEvents } from '@/actions/event'
import { EventsManagementTable } from '@/components/admin/events/EventsManagementTable'
import type { Event } from '@/types/event'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { EventForm } from '@/components/admin/forms/EventForm'
import { Plus, CalendarDays } from 'lucide-react'
import { toISOString } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminEventsPage() {
  const [open, setOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])

  const fetchEvents = async () => {
    const rawEvents = await getAllEvents()
    const formattedEvents: Event[] = (rawEvents ?? []).map(event => ({
      ...event,
      created_at: toISOString(new Date(event.created_at)),
      event_date: toISOString(new Date(event.event_date)),
      event_end_time: toISOString(new Date(event.event_end_time)),
      event_start_time: toISOString(new Date(event.event_start_time)),
      updated_at: toISOString(new Date(event.updated_at)),
      event_type: event.event_type as Event['event_type'],
      assignments: event.assignments?.map(assignment => ({
        ...assignment,
        completion_status: assignment.completion_status || null,
        completion_notes: assignment.completion_notes || null,
        created_at: toISOString(new Date(assignment.created_at)),
        updated_at: toISOString(new Date(assignment.updated_at))
      }))
    }))
    setEvents(formattedEvents)
  }

  // Fetch events on mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Calculate event statistics
  const now = new Date()
  const upcomingEvents = events.filter(
    event => new Date(event.event_date) > now
  ).length
  const pastEvents = events.filter(
    event => new Date(event.event_date) <= now
  ).length
  const totalAssignments = events.reduce(
    (acc, event) => acc + (event.assignments?.length || 0),
    0
  )
  const completedAssignments = events.reduce(
    (acc, event) =>
      acc +
      (event.assignments?.filter(a => a.completion_status === 'completed')
        ?.length || 0),
    0
  )
  const assignmentCompletionRate =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 pt-4 md:px-6 lg:px-10'>
      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarDays className='size-5 text-green-500' />
            Event Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-5'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Events</p>
            <p className='mt-1 text-2xl font-bold'>{events.length}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Upcoming Events</p>
            <p className='mt-1 text-2xl font-bold'>{upcomingEvents}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Past Events</p>
            <p className='mt-1 text-2xl font-bold'>{pastEvents}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Total Assignments</p>
            <p className='mt-1 text-2xl font-bold'>{totalAssignments}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              Participant Completion Rate
            </p>
            <p className='mt-1 text-2xl font-bold'>
              {assignmentCompletionRate}%
            </p>
          </div>
        </CardContent>
      </Card>

      <div className='mb-6 flex flex-col items-center justify-between gap-4 md:flex-row'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Event Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Create and manage events for reserve officers.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 size-4' />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm
              closeDialog={() => setOpen(false)}
              onSuccess={() => {
                setOpen(false)
                // Refetch events after successful creation
                fetchEvents()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <EventsManagementTable data={events} onDataChange={fetchEvents} />
    </div>
  )
}
