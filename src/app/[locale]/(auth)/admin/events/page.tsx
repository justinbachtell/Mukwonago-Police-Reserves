import { getAllEvents } from '@/actions/event'
import { EventsManagementTable } from '@/components/admin/events/EventsManagementTable'
import type { EventType } from '@/types/event'
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

export default async function AdminEventsPage() {
  const rawEvents = await getAllEvents()

  const events = rawEvents.map(event => ({
    ...event,
    created_at: new Date(event.created_at),
    event_date: new Date(event.event_date),
    event_end_time: new Date(event.event_end_time),
    event_start_time: new Date(event.event_start_time),
    updated_at: new Date(event.updated_at),
    event_type: event.event_type as EventType
  }))

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Event Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Create and manage events for reserve officers.
          </p>
        </div>

        <Dialog>
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
            <EventForm />
          </DialogContent>
        </Dialog>
      </div>

      <EventsManagementTable data={events} />
    </div>
  )
}
