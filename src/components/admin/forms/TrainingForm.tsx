'use client'

import { useEffect, useState, useTransition } from 'react'
import type { Training } from '@/types/training'
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
import { createTraining, updateTraining } from '@/actions/training'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { training } from '@/models/Schema'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'forms',
  file: 'TrainingForm.tsx'
})

const trainingSchema = z.object({
  description: z.string().nullable(),
  name: z.string().min(1, 'Name is required'),
  training_date: z.date({
    required_error: 'Training date is required'
  }),
  training_end_time: z.date({
    required_error: 'End time is required'
  }),
  training_instructor: z.string({
    required_error: 'Instructor is required'
  }),
  training_location: z.string().min(1, 'Location is required'),
  training_start_time: z.date({
    required_error: 'Start time is required'
  }),
  training_type: z.enum(training.training_type.enumValues)
})

type FormValues = z.infer<typeof trainingSchema>

interface TrainingFormProps {
  training?: Training
  onSuccess?: (training: Training) => void
}

export function TrainingForm({ training, onSuccess }: TrainingFormProps) {
  logger.time('training-form-render')
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession()
        setSession(currentSession)
      } catch (error) {
        logger.error(
          'Failed to check auth session',
          logger.errorWithData(error),
          'checkSession'
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  try {
    const form = useForm<FormValues>({
      resolver: zodResolver(trainingSchema),
      defaultValues: {
        description: training?.description || null,
        name: training?.name || '',
        training_date: training ? new Date(training.training_date) : new Date(),
        training_end_time: training
          ? new Date(training.training_end_time)
          : new Date(),
        training_instructor: training?.training_instructor || '',
        training_location: training?.training_location || '',
        training_start_time: training
          ? new Date(training.training_start_time)
          : new Date(),
        training_type: training?.training_type || 'other'
      }
    })

    const onSubmit = async (values: FormValues) => {
      logger.info(
        'Submitting training form',
        { values, isEdit: !!training },
        'onSubmit'
      )
      logger.time('training-submission')

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

        startTransition(async () => {
          const result = training
            ? await updateTraining(training.id, {
                ...values,
                training_date: values.training_date.toISOString(),
                training_start_time: values.training_start_time.toISOString(),
                training_end_time: values.training_end_time.toISOString()
              })
            : await createTraining({
                ...values,
                training_date: values.training_date.toISOString(),
                training_start_time: values.training_start_time.toISOString(),
                training_end_time: values.training_end_time.toISOString()
              })

          if (result) {
            logger.info(
              'Training form submitted successfully',
              { trainingId: result.id },
              'onSubmit'
            )
            toast.success(
              `Training ${training ? 'updated' : 'created'} successfully`
            )
            onSuccess?.({
              ...result,
              training_date: result.training_date.toISOString(),
              training_start_time: result.training_start_time.toISOString(),
              training_end_time: result.training_end_time.toISOString(),
              created_at: result.created_at.toISOString(),
              updated_at: result.updated_at.toISOString()
            })
            form.reset()
          }
        })
      } catch (error) {
        logger.error(
          'Form submission failed',
          logger.errorWithData(error),
          'onSubmit'
        )
        toast.error(`Failed to ${training ? 'update' : 'create'} training`)
      } finally {
        logger.timeEnd('training-submission')
      }
    }

    const handleTimeChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      currentDate: Date,
      onChange: (date: Date) => void
    ) => {
      logger.info(
        'Handling time change',
        { value: e.target.value },
        'handleTimeChange'
      )
      try {
        const timeValue = e.target.value || '00:00'
        const [hours = '0', minutes = '0'] = timeValue.split(':')
        const date = new Date(currentDate)
        date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10))

        logger.debug(
          'Time updated successfully',
          { newDate: date.toISOString() },
          'handleTimeChange'
        )

        onChange(date)
      } catch (error) {
        logger.error(
          'Error handling time change',
          logger.errorWithData(error),
          'handleTimeChange'
        )
        toast.error('Invalid time format')
      }
    }

    if (isLoading) {
      return (
        <div className='flex items-center justify-center p-4'>
          <p>Loading...</p>
        </div>
      )
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Training name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Training description'
                    className='min-h-[100px] resize-y'
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='training_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select training type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='firearms'>Firearms</SelectItem>
                    <SelectItem value='defensive_tactics'>
                      Defensive Tactics
                    </SelectItem>
                    <SelectItem value='emergency_vehicle_operations'>
                      Emergency Vehicle Operations
                    </SelectItem>
                    <SelectItem value='first_aid'>First Aid</SelectItem>
                    <SelectItem value='legal_updates'>Legal Updates</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='training_date'
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
                      disabled={date =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='training_start_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      type='time'
                      value={format(field.value, 'HH:mm')}
                      onChange={e =>
                        handleTimeChange(e, field.value, field.onChange)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='training_end_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input
                      type='time'
                      value={format(field.value, 'HH:mm')}
                      onChange={e =>
                        handleTimeChange(e, field.value, field.onChange)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='training_location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder='Training location' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='training_instructor'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor</FormLabel>
                <Select
                  onValueChange={value =>
                    field.onChange(Number.parseInt(value))
                  }
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select instructor' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='1'>John Doe</SelectItem>
                    <SelectItem value='2'>Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end'>
            <Button type='submit' disabled={isLoading || isPending}>
              {isPending
                ? 'Saving...'
                : training
                  ? 'Update Training'
                  : 'Create Training'}
            </Button>
          </div>
        </form>
      </Form>
    )
  } catch (error) {
    logger.error(
      'Error rendering training form',
      logger.errorWithData(error),
      'render'
    )
    throw error
  } finally {
    logger.timeEnd('training-form-render')
  }
}
