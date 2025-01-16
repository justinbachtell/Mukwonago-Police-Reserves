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
import { Plus } from 'lucide-react'
import { toISOString } from '@/lib/utils'
import { useState, useEffect } from 'react'

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
        status: assignment.completion_status || undefined,
        notes: assignment.completion_notes || null,
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

  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
      <div className='mb-6 flex items-center justify-between'>
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

      <EventsManagementTable data={events} />
    </div>
  )
}
