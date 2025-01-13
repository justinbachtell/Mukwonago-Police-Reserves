'use client'

import type { Equipment, NewEquipment } from '@/types/equipment'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createEquipment, updateEquipment } from '@/actions/equipment'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'admin',
  file: 'EquipmentForm.tsx'
})

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().nullable(),
  serial_number: z.string().nullable(),
  purchase_date: z.date().nullable(),
  notes: z.string().nullable(),
  is_obsolete: z.boolean().default(false),
  is_assigned: z.boolean().default(false),
  assigned_to: z.string().nullable()
})

type FormValues = z.infer<typeof formSchema>

interface EquipmentFormProps {
  equipment?: Equipment
  onSuccess?: (equipment: Equipment) => void
  closeDialog?: () => void
}

export function EquipmentForm({
  equipment,
  onSuccess,
  closeDialog
}: EquipmentFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  logger.time('equipment-form-render')

  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()
        if (error) {
          logger.error(
            'Failed to get auth session',
            logger.errorWithData(error),
            'checkSession'
          )
          throw error
        }
        logger.info(
          'Auth session retrieved',
          { userId: session?.user?.id },
          'checkSession'
        )
        setSession(session)
      } catch (error) {
        logger.error(
          'Session check error',
          logger.errorWithData(error),
          'checkSession'
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    logger.info('Setting up auth state change listener', undefined, 'useEffect')
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.info(
        'Auth state changed',
        { userId: session?.user?.id },
        'onAuthStateChange'
      )
      setSession(session)
      setIsLoading(false)
    })

    return () => {
      logger.info('Cleaning up auth state listener', undefined, 'useEffect')
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: equipment?.name || '',
      description: equipment?.description || '',
      serial_number: equipment?.serial_number || '',
      purchase_date: equipment?.purchase_date
        ? new Date(equipment.purchase_date)
        : null,
      notes: equipment?.notes || '',
      is_obsolete: equipment?.is_obsolete || false,
      is_assigned: equipment?.is_assigned || false,
      assigned_to: equipment?.assigned_to || null
    }
  })

  const onSubmit = async (values: FormValues) => {
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

      logger.info(
        'Submitting equipment form',
        {
          isEdit: !!equipment,
          equipmentId: equipment?.id,
          values
        },
        'onSubmit'
      )

      const result = equipment
        ? await updateEquipment({ ...values, id: equipment.id })
        : await createEquipment({
            ...values,
            purchase_date: values.purchase_date
              ? new Date(values.purchase_date)
              : null
          } as NewEquipment)

      if (result) {
        logger.info(
          'Equipment form submitted successfully',
          { equipmentId: 'id' in result ? result.id : undefined },
          'onSubmit'
        )
        toast.success(
          `Equipment ${equipment ? 'updated' : 'created'} successfully`
        )
        onSuccess?.(result as Equipment)
        closeDialog?.()
        form.reset()
      }
    } catch (error) {
      logger.error(
        'Form submission failed',
        logger.errorWithData(error),
        'onSubmit'
      )
      toast.error(`Failed to ${equipment ? 'update' : 'create'} equipment`)
    }
  }

  try {
    logger.info('Rendering equipment form', { isEdit: !!equipment }, 'render')

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Enter equipment name' />
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
                    {...field}
                    value={field.value || ''}
                    placeholder='Enter equipment description'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='serial_number'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder='Enter serial number'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='purchase_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    value={
                      field.value ? toISOString(field.value).split('T')[0] : ''
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
            name='is_obsolete'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Obsolete</FormLabel>
                  <FormDescription>
                    Mark this equipment as obsolete if it is no longer in use
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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

          <Button type='submit' disabled={isLoading}>
            {equipment ? 'Update Equipment' : 'Create Equipment'}
          </Button>
        </form>
      </Form>
    )
  } catch (error) {
    logger.error(
      'Error rendering equipment form',
      logger.errorWithData(error),
      'render'
    )
    throw error
  } finally {
    logger.timeEnd('equipment-form-render')
  }
}
