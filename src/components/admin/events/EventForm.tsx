'use client'

import type { Event, NewEvent } from '@/types/event'
import { eventTypesEnum } from '@/models/Schema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createEvent, updateEvent } from '@/actions/event'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { toISOString } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const logger = createLogger({
  module: 'admin',
  file: 'EventForm.tsx'
})

const formSchema = z.object({
  event_name: z.string().min(2, 'Event name must be at least 2 characters'),
  event_date: z.string().min(10, 'Date is required'),
  event_start_time: z.string(),
  event_end_time: z.string(),
  event_location: z.string().min(2, 'Location must be at least 2 characters'),
  event_type: z.enum(['school_event', 'community_event', 'fair', 'other']),
  notes: z.string().nullable(),
  min_participants: z.number().min(0),
  max_participants: z.number().min(0)
})

type FormValues = z.infer<typeof formSchema>

interface EventFormProps {
  event?: Event
  onSuccess?: (event: Event) => void
  closeDialog?: () => void
}

export function EventForm({ event, onSuccess, closeDialog }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  logger.time('event-form-render')

  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession()
      setSession(currentSession)
      setIsLoading(false)
    }

    checkSession()
  }, [supabase.auth])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_name: event?.event_name || '',
      event_date: event?.event_date
        ? new Date(event.event_date).toISOString().split('T')[0]
        : '',
      event_start_time: event?.event_start_time
        ? new Date(event.event_start_time).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          })
        : '',
      event_end_time: event?.event_end_time
        ? new Date(event.event_end_time).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          })
        : '',
      event_location: event?.event_location || '',
      event_type: event?.event_type || 'other',
      notes: event?.notes || '',
      min_participants: event?.min_participants || 1,
      max_participants: event?.max_participants || 5
    }
  })

  const onSubmit = async (values: FormValues) => {
    logger.info('Submitting event form', { values }, 'onSubmit')

    if (!session?.user) {
      logger.warn(
        'Form submission attempted without auth',
        undefined,
        'onSubmit'
      )
      toast({
        title: 'Error',
        description: 'You must be logged in to submit the form',
        variant: 'destructive'
      })
      return
    }

    try {
      // Convert string dates to Date objects for the API
      const eventDate = new Date(`${values.event_date}T12:00:00.000Z`)
      const formData: NewEvent = {
        event_name: values.event_name,
        event_type: values.event_type,
        event_location: values.event_location,
        event_date: eventDate,
        event_start_time: new Date(
          `${values.event_date}T${values.event_start_time}`
        ),
        event_end_time: new Date(
          `${values.event_date}T${values.event_end_time}`
        ),
        notes: values.notes,
        min_participants: values.min_participants,
        max_participants: values.max_participants
      }

      const apiResult = event
        ? await updateEvent(event.id, formData)
        : await createEvent(formData)

      if (apiResult) {
        // Convert dates back to strings for the Event type
        const result: Event = {
          ...apiResult,
          event_date: toISOString(apiResult.event_date),
          event_start_time: toISOString(apiResult.event_start_time),
          event_end_time: toISOString(apiResult.event_end_time),
          created_at: toISOString(apiResult.created_at),
          updated_at: toISOString(apiResult.updated_at)
        }

        toast({
          title: 'Success',
          description: event
            ? 'Event updated successfully'
            : 'Event created successfully'
        })
        onSuccess?.(result)
        closeDialog?.()
      } else {
        toast({
          title: 'Error',
          description: event
            ? 'Failed to update event'
            : 'Failed to create event',
          variant: 'destructive'
        })
      }
    } catch (error) {
      logger.error(
        'Form submission failed',
        { error: error instanceof Error ? error : new Error('Unknown error') },
        'onSubmit'
      )
      toast({
        title: 'Error',
        description: 'An error occurred while saving the event',
        variant: 'destructive'
      })
    }
  }

  const capitalizeWords = (str: string): string => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  try {
    logger.info('Rendering event form', { isEdit: !!event }, 'render')

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
                  <Input {...field} placeholder='Enter event name' />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select event type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eventTypesEnum.enumValues.map(
                      (type: (typeof eventTypesEnum.enumValues)[number]) => (
                        <SelectItem key={type} value={type}>
                          {capitalizeWords(type)}
                        </SelectItem>
                      )
                    )}
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
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    value={field.value || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e.target.value)
                    }}
                  />
                </FormControl>
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
                    <Input
                      type='time'
                      step='60'
                      value={field.value || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(e.target.value)
                      }}
                    />
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
                    <Input
                      type='time'
                      step='60'
                      value={field.value || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(e.target.value)
                      }}
                    />
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
                  <Input {...field} placeholder='Enter event location' />
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
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder='Enter event notes'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='min_participants'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Participants</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.onChange(Number.parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='max_participants'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.onChange(Number.parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading
              ? 'Submitting...'
              : event
                ? 'Update Event'
                : 'Create Event'}
          </Button>
        </form>
      </Form>
    )
  } catch (error) {
    logger.error(
      'Error rendering event form',
      logger.errorWithData(error),
      'render'
    )
    throw error
  } finally {
    logger.timeEnd('event-form-render')
  }
}
