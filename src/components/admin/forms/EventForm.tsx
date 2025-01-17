'use client'

import type { Event, NewEvent, UpdateEvent } from '@/types/event'
import { eventTypesEnum } from '@/models/Schema'
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
import { createEvent, updateEvent } from '@/actions/event'
import { cn, toISOString } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { FormInput } from '@/components/ui/form-input'
import { FormTextarea } from '@/components/ui/form-textarea'
import { rules } from '@/lib/validation'

const logger = createLogger({
  module: 'admin',
  file: 'EventForm.tsx'
})

const formSchema = z.object({
  event_name: z.string().min(1, 'Event name is required'),
  event_type: z.enum(eventTypesEnum.enumValues),
  event_date: z.date({
    required_error: 'Event date is required'
  }),
  event_start_time: z.string().min(1, 'Start time is required'),
  event_end_time: z.string().min(1, 'End time is required'),
  event_location: z.string().min(1, 'Location is required'),
  notes: z.string().nullable()
})

type FormValues = z.infer<typeof formSchema>

interface EventFormProps {
  event?: Event
  onSuccess?: (event: Event) => void
  closeDialog?: () => void
}

export function EventForm({ event, onSuccess, closeDialog }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

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
      event_type: event?.event_type || 'community_event',
      event_date: event ? new Date(event.event_date) : new Date(),
      event_start_time: event?.event_start_time
        ? format(new Date(event.event_start_time), 'HH:mm')
        : '',
      event_end_time: event?.event_end_time
        ? format(new Date(event.event_end_time), 'HH:mm')
        : '',
      event_location: event?.event_location || '',
      notes: event?.notes || null
    }
  })

  const onSubmit = async (values: FormValues) => {
    logger.info(
      'Submitting event form',
      { values, isEdit: !!event },
      'onSubmit'
    )
    logger.time('form-submission')
    setIsSubmitting(true)

    try {
      if (!session) {
        logger.warn(
          'Form submission attempted without auth',
          undefined,
          'onSubmit'
        )
        toast.error('You must be logged in to submit the form')
        return
      }

      // Combine date and time values
      const eventDate = new Date(values.event_date)
      const [startHours, startMinutes] = values.event_start_time.split(':')
      const [endHours, endMinutes] = values.event_end_time.split(':')

      const startTime = new Date(eventDate)
      startTime.setHours(
        Number.parseInt(startHours || '0'),
        Number.parseInt(startMinutes || '0')
      )

      const endTime = new Date(eventDate)
      endTime.setHours(
        Number.parseInt(endHours || '0'),
        Number.parseInt(endMinutes || '0')
      )

      const eventData = {
        ...values,
        event_start_time: startTime,
        event_end_time: endTime
      }

      const result = event
        ? await updateEvent(event.id, eventData as UpdateEvent)
        : await createEvent(eventData as NewEvent)

      if (result) {
        const eventWithStringDates: Event = {
          ...result,
          event_date: toISOString(result.event_date),
          event_start_time: toISOString(result.event_start_time),
          event_end_time: toISOString(result.event_end_time),
          created_at: toISOString(result.created_at),
          updated_at: toISOString(result.updated_at)
        }

        logger.info(
          'Event form submitted successfully',
          { eventId: result.id },
          'onSubmit'
        )
        toast.success(`Event ${event ? 'updated' : 'created'} successfully`)

        // Call onSuccess if provided
        onSuccess?.(eventWithStringDates)

        // Close dialog if in one
        if (closeDialog) {
          closeDialog()
        }

        // Reset form
        form.reset()

        // Refresh the page data
        router.refresh()
      }
    } catch (error) {
      logger.error(
        'Form submission failed',
        logger.errorWithData(error),
        'onSubmit'
      )
      toast.error(`Failed to ${event ? 'update' : 'create'} event`)
    } finally {
      setIsSubmitting(false)
      logger.timeEnd('form-submission')
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
                  <FormInput
                    {...field}
                    label='Event Name'
                    rules={[
                      rules.required('Event name'),
                      rules.minLength(2, 'Event name')
                    ]}
                    onValueChange={field.onChange}
                  />
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
                    <FormInput
                      type='time'
                      label='Start Time'
                      name='event_start_time'
                      value={field.value}
                      rules={[rules.required('Start time')]}
                      onValueChange={field.onChange}
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
                    <FormInput
                      type='time'
                      label='End Time'
                      name='event_end_time'
                      value={field.value}
                      rules={[rules.required('End time')]}
                      onValueChange={field.onChange}
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
                  <FormInput
                    {...field}
                    label='Location'
                    rules={[
                      rules.required('Location'),
                      rules.minLength(2, 'Location')
                    ]}
                    onValueChange={field.onChange}
                  />
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
                  <FormTextarea
                    {...field}
                    label='Notes'
                    value={field.value || ''}
                    rules={[rules.notes()]}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting
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
