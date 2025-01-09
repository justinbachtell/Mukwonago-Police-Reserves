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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'AssignEquipmentForm.tsx'
})

const formSchema = z.object({
  equipment_id: z.number(),
  condition: z.enum(['new', 'good', 'fair', 'poor', 'damaged/broken']),
  assigned_date: z.date(),
  notes: z.string().nullable()
})

type FormValues = z.infer<typeof formSchema>

interface AssignEquipmentFormProps {
  user: DBUser
  availableEquipment: Equipment[]
  onSuccess?: () => void
}

export function AssignEquipmentForm({
  user,
  availableEquipment,
  onSuccess
}: AssignEquipmentFormProps) {
  logger.info(
    'Rendering assign equipment form',
    {
      userId: user.id,
      availableEquipmentCount: availableEquipment.length
    },
    'AssignEquipmentForm'
  )
  logger.time('assign-equipment-form-render')

  try {
    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        assigned_date: new Date(),
        notes: null
      }
    })

    logger.debug(
      'Form initialized',
      { defaultValues: form.getValues() },
      'AssignEquipmentForm'
    )

    const onSubmit = async (values: FormValues) => {
      logger.info('Submitting form', { values }, 'onSubmit')
      logger.time('form-submission')

      try {
        const result = await createAssignedEquipment({
          ...values,
          user_id: user.id,
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
      { availableEquipment },
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
                <FormLabel>Assigned Date</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    value={
                      field.value ? field.value.toISOString().split('T')[0] : ''
                    }
                    onChange={e => field.onChange(e.target.valueAsDate)}
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
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder='Enter any additional notes'
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
    throw error
  } finally {
    logger.timeEnd('assign-equipment-form-render')
  }
}
