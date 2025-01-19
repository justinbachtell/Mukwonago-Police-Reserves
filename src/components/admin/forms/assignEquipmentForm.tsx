'use client';

import type { Equipment } from '@/types/equipment';
import type { DBUser } from '@/types/user';
import { createAssignedEquipment } from '@/actions/assignedEquipment'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createLogger } from '@/lib/debug'
import { FormInput } from '@/components/ui/form-input'
import { FormTextarea } from '@/components/ui/form-textarea'
import { rules } from '@/lib/validation'

const logger = createLogger({
  module: 'admin',
  file: 'AssignEquipmentForm.tsx'
})

const formSchema = z.object({
  equipment_id: z.number(),
  user_id: z.string(),
  condition: z.enum(['new', 'good', 'fair', 'poor', 'damaged/broken']),
  assigned_date: z.date(),
  notes: z.string().nullable()
})

type FormValues = z.infer<typeof formSchema>

interface AssignEquipmentFormProps {
  users?: DBUser[]
  targetUserId?: string
  availableEquipment: Equipment[]
  onSuccess?: () => void
}

const DEFAULT_USERS: DBUser[] = []
const DEFAULT_EQUIPMENT: Equipment[] = []

export function AssignEquipmentForm({
  users = DEFAULT_USERS,
  targetUserId,
  availableEquipment = DEFAULT_EQUIPMENT,
  onSuccess
}: AssignEquipmentFormProps) {
  logger.info(
    'Rendering assign equipment form',
    {
      userCount: users?.length ?? 0,
      targetUserId,
      availableEquipmentCount: availableEquipment?.length ?? 0
    },
    'AssignEquipmentForm'
  )
  logger.time('assign-equipment-form-render')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assigned_date: new Date(),
      notes: null,
      user_id: targetUserId // Set initial user if provided
    }
  })

  // Validation checks after hooks
  if (!Array.isArray(availableEquipment)) {
    logger.error(
      'Invalid props provided to AssignEquipmentForm',
      {
        availableEquipment: typeof availableEquipment
      },
      'AssignEquipmentForm'
    )
    return (
      <div className='p-4 text-center text-sm text-muted-foreground'>
        Error loading form data. Please try again.
      </div>
    )
  }

  // Check for empty arrays after validation
  if (availableEquipment.length === 0) {
    return (
      <div className='p-4 text-center text-sm text-muted-foreground'>
        No equipment available for assignment.
      </div>
    )
  }

  try {
    logger.debug(
      'Form initialized',
      { defaultValues: form.getValues(), targetUserId },
      'AssignEquipmentForm'
    )

    const onSubmit = async (values: FormValues) => {
      logger.info('Submitting form', { values }, 'onSubmit')
      logger.time('form-submission')

      try {
        const result = await createAssignedEquipment({
          ...values,
          notes: values.notes || undefined,
          checked_out_at: values.assigned_date.toISOString(),
          condition: values.condition,
          equipment_id: values.equipment_id,
          expected_return_date: undefined
        })

        if (result) {
          logger.info('Assignment created successfully', { result }, 'onSubmit')
          toast.success('Equipment assigned successfully')
          form.reset()
          onSuccess?.()
        } else {
          throw new Error('Failed to create assignment')
        }
      } catch (error) {
        logger.error(
          'Failed to submit form',
          logger.errorWithData(error),
          'onSubmit'
        )
        toast.error('Failed to assign equipment')
      } finally {
        logger.timeEnd('form-submission')
      }
    }

    logger.debug(
      'Rendering form',
      { availableEquipment, users, targetUserId },
      'AssignEquipmentForm'
    )

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='equipment_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment</FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select equipment' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableEquipment.map(item => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!targetUserId && (
            <FormField
              control={form.control}
              name='user_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select user' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
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
          )}

          <FormField
            control={form.control}
            name='condition'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select condition' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='new'>New</SelectItem>
                    <SelectItem value='good'>Good</SelectItem>
                    <SelectItem value='fair'>Fair</SelectItem>
                    <SelectItem value='poor'>Poor</SelectItem>
                    <SelectItem value='damaged/broken'>
                      Damaged/Broken
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='assigned_date'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormInput
                    type='date'
                    name='assigned_date'
                    label='Assigned Date'
                    value={
                      field.value ? field.value.toISOString().split('T')[0] : ''
                    }
                    onValueChange={value => field.onChange(new Date(value))}
                    rules={[rules.required('Assigned date')]}
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
                <FormControl>
                  <FormTextarea
                    {...field}
                    label='Notes'
                    name='notes'
                    value={field.value || ''}
                    placeholder='Enter any additional notes'
                    rules={[rules.notes()]}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit'>Assign Equipment</Button>
        </form>
      </Form>
    )
  } catch (error) {
    logger.error(
      'Error rendering assign equipment form',
      logger.errorWithData(error),
      'AssignEquipmentForm'
    )
    return (
      <div className='p-4 text-center text-sm text-muted-foreground'>
        An error occurred while loading the form. Please try again.
      </div>
    )
  } finally {
    logger.timeEnd('assign-equipment-form-render')
  }
}
