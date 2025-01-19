'use client'

import type { Training } from '@/types/training'
import type { DBUser } from '@/types/user'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { trainingTypeEnum } from '@/models/Schema'
import { createTraining, updateTraining } from '@/actions/training'
import { createTrainingAssignment } from '@/actions/trainingAssignment'
import { toast } from 'sonner'
import { createLogger } from '@/lib/debug'
import { toISOString } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const logger = createLogger({
  module: 'admin',
  file: 'TrainingForm.tsx'
})

interface TrainingFormProps {
  training?: Training
  onSuccess?: () => void
  availableUsers?: DBUser[]
  closeDialog?: () => void
}

const defaultUsers: DBUser[] = []

export function TrainingForm({
  training,
  onSuccess,
  availableUsers = defaultUsers
}: TrainingFormProps) {
  logger.info(
    'Rendering training form',
    { trainingId: training?.id },
    'TrainingForm'
  )

  type FormValues = {
    name: string
    training_type: (typeof trainingTypeEnum.enumValues)[number]
    training_date: string
    training_start_time: string
    training_end_time: string
    training_location: string
    training_instructor: string | null
    description?: string
    is_locked: boolean
    assigned_users?: string[]
    min_participants: number
    max_participants: number
  }

  const formSchema = z
    .object({
      name: z.string().min(1, 'Training name is required'),
      training_type: z.enum(trainingTypeEnum.enumValues),
      training_date: z.string().min(1, 'Training date is required'),
      training_start_time: z.string().min(1, 'Start time is required'),
      training_end_time: z.string().min(1, 'End time is required'),
      training_location: z.string().min(1, 'Location is required'),
      training_instructor: z.string().nullable(),
      description: z.string().optional(),
      is_locked: z.boolean().default(false),
      assigned_users: z.array(z.string()).optional(),
      min_participants: z
        .number()
        .min(1, 'Minimum participants must be at least 1'),
      max_participants: z
        .number()
        .min(1, 'Maximum participants must be at least 1')
    })
    .refine(data => data.max_participants >= data.min_participants, {
      message:
        'Maximum participants must be greater than or equal to minimum participants',
      path: ['max_participants']
    })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: training?.name || '',
      training_type: training?.training_type || 'other',
      training_date: training
        ? new Date(training.training_date).toISOString().split('T')[0]
        : '',
      training_start_time: training
        ? new Date(training.training_start_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        : '',
      training_end_time: training
        ? new Date(training.training_end_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        : '',
      training_location: training?.training_location || '',
      training_instructor: training?.training_instructor || null,
      description: training?.description || '',
      is_locked: training?.is_locked || false,
      assigned_users: training?.assignments?.map(a => a.user_id) || [],
      min_participants: training?.min_participants || 1,
      max_participants: training?.max_participants || 10
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      // Create date objects for start and end times
      const trainingDate = new Date(values.training_date)
      const startParts = values.training_start_time.split(':')
      const endParts = values.training_end_time.split(':')

      const startTime = new Date(trainingDate)
      startTime.setHours(
        Number.parseInt(startParts[0] || '0'),
        Number.parseInt(startParts[1] || '0')
      )

      const endTime = new Date(trainingDate)
      endTime.setHours(
        Number.parseInt(endParts[0] || '0'),
        Number.parseInt(endParts[1] || '0')
      )

      const data = {
        ...values,
        training_date: toISOString(trainingDate),
        training_start_time: toISOString(startTime),
        training_end_time: toISOString(endTime)
      }

      logger.info(
        'Submitting training form',
        {
          trainingId: training?.id,
          data
        },
        'onSubmit'
      )

      if (training) {
        const result = await updateTraining(training.id, data)
        if (result) {
          if (values.is_locked) {
            try {
              const currentAssignments =
                training.assignments?.map(a => a.user_id) || []
              const newAssignments = values.assigned_users || []

              // Add new assignments
              for (const userId of newAssignments) {
                if (!currentAssignments.includes(userId)) {
                  await createTrainingAssignment({
                    training_id: training.id,
                    user_id: userId
                  })
                }
              }
            } catch (assignmentError) {
              logger.error(
                'Error updating training assignments',
                logger.errorWithData(assignmentError),
                'onSubmit'
              )
              toast.error('Failed to update training assignments')
              return
            }
          }

          toast.success('Training updated successfully')
          form.reset()
          onSuccess?.()
        } else {
          toast.error('Failed to update training')
        }
      } else {
        const result = await createTraining(data)
        if (result) {
          if (values.is_locked && values.assigned_users?.length) {
            try {
              for (const userId of values.assigned_users) {
                await createTrainingAssignment({
                  training_id: result.id,
                  user_id: userId
                })
              }
            } catch (assignmentError) {
              logger.error(
                'Error creating training assignments',
                logger.errorWithData(assignmentError),
                'onSubmit'
              )
              toast.error('Failed to create training assignments')
              return
            }
          }

          toast.success('Training created successfully')
          form.reset()
          onSuccess?.()
        } else {
          toast.error('Failed to create training')
        }
      }
    } catch (error) {
      logger.error(
        'Error submitting training form',
        logger.errorWithData(error),
        'onSubmit'
      )
      toast.error('Failed to save training')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6 p-2'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='grid gap-2'>
              <FormLabel>Training Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trainingTypeEnum.enumValues.map(type => (
                    <SelectItem key={type} value={type} className='capitalize'>
                      {type.replace(/_/g, ' ')}
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
          name='training_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='training_start_time'
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
            name='training_end_time'
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
          name='training_location'
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
          name='training_instructor'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructor</FormLabel>
              <Select
                onValueChange={value =>
                  field.onChange(value === 'none' ? null : value)
                }
                defaultValue={field.value?.toString() || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select an instructor' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='none'>No instructor</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
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
                    min={1}
                    {...field}
                    onChange={e =>
                      field.onChange(Number.parseInt(e.target.value))
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
                    min={1}
                    {...field}
                    onChange={e =>
                      field.onChange(Number.parseInt(e.target.value))
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
          name='is_locked'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Locked Training</FormLabel>
                <FormDescription>
                  Only assigned users can sign up for this training
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {form.watch('is_locked') && (
          <FormField
            control={form.control}
            name='assigned_users'
            render={() => (
              <FormItem>
                <FormLabel>Assigned Users</FormLabel>
                <ScrollArea className='h-[200px] rounded-md border p-4'>
                  <div className='space-y-4'>
                    {availableUsers.map(user => (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name='assigned_users'
                        render={({ field: _field }) => (
                          <FormItem
                            key={user.id}
                            className='flex flex-row items-start space-x-3 space-y-0'
                          >
                            <FormControl>
                              <Checkbox
                                checked={_field.value?.includes(user.id)}
                                onCheckedChange={checked => {
                                  const current = _field.value || []
                                  const updated = checked
                                    ? [...current, user.id]
                                    : current.filter(id => id !== user.id)
                                  _field.onChange(updated)
                                }}
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              {user.first_name} {user.last_name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type='submit' className='w-full'>
          {training ? 'Update Training' : 'Create Training'}
        </Button>
      </form>
    </Form>
  )
}
