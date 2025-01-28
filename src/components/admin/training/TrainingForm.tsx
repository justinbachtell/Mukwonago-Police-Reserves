import { trainingTypeEnum } from '@/models/Schema'
import type { Training } from '@/types/training'
import type { DBUser } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createLogger } from '@/lib/debug'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

const logger = createLogger({
  module: 'admin',
  file: 'TrainingForm.tsx'
})

const formSchema = z
  .object({
    training_name: z
      .string()
      .min(2, 'Training name must be at least 2 characters')
      .max(100, 'Training name cannot exceed 100 characters')
      .regex(
        /^[a-z0-9\s\-.,()]*$/i,
        'Training name can only contain letters, numbers, spaces, and basic punctuation'
      ),
    training_type: z.enum(trainingTypeEnum.enumValues),
    training_date: z.date({
      required_error: 'Training date is required'
    }),
    training_start_time: z
      .string()
      .min(1, 'Start time is required')
      .regex(
        /^([01]?\d|2[0-3]):[0-5]\d$/,
        'Please enter a valid time in 24-hour format (HH:MM)'
      ),
    training_end_time: z
      .string()
      .min(1, 'End time is required')
      .regex(
        /^([01]?\d|2[0-3]):[0-5]\d$/,
        'Please enter a valid time in 24-hour format (HH:MM)'
      ),
    training_location: z
      .string()
      .min(5, 'Location must be at least 5 characters')
      .max(100, 'Location cannot exceed 100 characters')
      .regex(
        /^[a-z0-9\s\-.,#]*$/i,
        'Location can only contain letters, numbers, spaces, and basic punctuation'
      ),
    notes: z
      .string()
      .max(500, 'Notes cannot exceed 500 characters')
      .regex(
        /^[a-z0-9\s.,!?()'\-"]*$/i,
        'Notes can only contain letters, numbers, and basic punctuation'
      )
      .nullable(),
    min_participants: z
      .number()
      .min(1, 'Minimum participants must be at least 1')
      .max(100, 'Minimum participants cannot exceed 100'),
    max_participants: z
      .number()
      .min(1, 'Maximum participants must be at least 1')
      .max(100, 'Maximum participants cannot exceed 100'),
    is_locked: z.boolean().default(false),
    assigned_users: z.array(z.string()).optional()
  })
  .refine(
    (data: { min_participants: number; max_participants: number }) =>
      data.max_participants >= data.min_participants,
    {
      message:
        'Maximum participants must be greater than or equal to minimum participants',
      path: ['max_participants']
    }
  )

interface Props {
  training?: Training
  onSuccess?: () => void
  closeDialog?: () => void
  availableUsers: DBUser[]
}

export function TrainingForm({
  training,
  onSuccess,
  closeDialog,
  availableUsers
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      training_name: training?.name || '',
      training_type: training?.training_type || trainingTypeEnum.enumValues[0],
      training_date: training?.training_date
        ? new Date(training.training_date)
        : new Date(),
      training_start_time: training?.training_start_time || '',
      training_end_time: training?.training_end_time || '',
      training_location: training?.training_location || '',
      notes: training?.description || '',
      min_participants: training?.min_participants || 1,
      max_participants: training?.max_participants || 10,
      is_locked: training?.is_locked || false,
      assigned_users: training?.assignments?.map(a => a.user_id) || []
    }
  })

  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

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

    logger.info('Setting up auth state change listener', undefined, 'useEffect')
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event: string, currentSession: Session | null) => {
        logger.info(
          'Auth state changed',
          { userId: currentSession?.user?.id },
          'onAuthStateChange'
        )
        setSession(currentSession)
        setIsLoading(false)
      }
    )

    return () => {
      logger.info('Cleaning up auth state listener', undefined, 'useEffect')
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    try {
      if (isLoading) {
        logger.warn(
          'Form submission attempted while loading',
          undefined,
          'onSubmit'
        )
        toast.error('Please wait while we load your session')
        return
      }

      if (!session?.user) {
        logger.warn(
          'Form submission attempted without auth',
          undefined,
          'onSubmit'
        )
        toast.error('You must be logged in to submit the form')
        return
      }

      // Create or update training logic here
      logger.info('Submitting training form', { formData }, 'onSubmit')
      onSuccess?.()
      closeDialog?.()
    } catch (error) {
      logger.error(
        'Failed to submit training form',
        logger.errorWithData(error),
        'onSubmit'
      )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6 p-2'>
        <FormField
          control={form.control}
          name='training_name'
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
              <FormLabel>Training Date</FormLabel>
              <FormControl>
                <Input
                  type='date'
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.value)
                  }
                />
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
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder='Enter training notes'
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
                        render={({ field }) => (
                          <FormItem
                            key={user.id}
                            className='flex flex-row items-start space-x-3 space-y-0'
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(user.id)}
                                onCheckedChange={checked => {
                                  const current = field.value || []
                                  const updated = checked
                                    ? [...current, user.id]
                                    : current.filter(id => id !== user.id)
                                  field.onChange(updated)
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

        <Button type='submit' className='w-full' disabled={isLoading}>
          {training ? 'Update Training' : 'Create Training'}
        </Button>
      </form>
    </Form>
  )
}
