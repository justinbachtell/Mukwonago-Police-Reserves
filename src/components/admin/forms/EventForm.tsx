'use client'

import type { Event } from '@/types/event'
import { eventTypes } from '@/types/event'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createEvent, updateEvent } from '@/actions/event'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  event_name: z.string().min(1, 'Event name is required'),
  event_type: z.enum(eventTypes),
  event_date: z.coerce.date(),
  event_start_time: z.string(),
  event_end_time: z.string(),
  event_location: z.string().min(1, 'Location is required'),
  notes: z.string().nullable()
})

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: event
      ? {
          event_name: event.event_name,
          event_type: event.event_type,
          event_date: new Date(event.event_date),
          event_start_time: format(new Date(event.event_start_time), 'HH:mm'),
          event_end_time: format(new Date(event.event_end_time), 'HH:mm'),
          event_location: event.event_location,
          notes: event.notes
        }
      : {
          event_name: '',
          event_type: 'patrol',
          event_date: new Date(),
          event_start_time: '09:00',
          event_end_time: '17:00',
          event_location: '',
          notes: null
        }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const eventData = {
        ...values,
        event_start_time: new Date(
          `${format(values.event_date, 'yyyy-MM-dd')}T${
            values.event_start_time
          }`
        ),
        event_end_time: new Date(
          `${format(values.event_date, 'yyyy-MM-dd')}T${values.event_end_time}`
        )
      }

      if (event) {
        await updateEvent(event.id, eventData)
        toast.success('Event updated successfully')
      } else {
        await createEvent(eventData)
        toast.success('Event created successfully')
      }

      form.reset()
    } catch (error) {
      console.error('Error submitting event:', error)
      toast.error(event ? 'Failed to update event' : 'Failed to create event')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='event_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='event_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select event type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type
                        .replace('_', ' ')
                        .split(' ')
                        .map(
                          word => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='event_date'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className='ml-auto size-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='event_start_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type='time' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='event_end_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type='time' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='event_location'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full'>
          {event ? 'Update Event' : 'Create Event'}
        </Button>
      </form>
    </Form>
  )
}
