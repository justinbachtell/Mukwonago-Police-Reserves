'use client'

import type { Equipment, NewEquipment } from '@/types/equipment'
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
import { Switch } from '@/components/ui/switch'
import { createEquipment, updateEquipment } from '@/actions/equipment'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'admin',
  file: 'equipmentForm.tsx'
})

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters'),
  serial_number: z
    .string()
    .max(50, 'Serial number cannot exceed 50 characters'),
  purchase_date: z.string().nullable(),
  notes: z.string().nullable(),
  obsolete: z.boolean().default(false)
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
        ? new Date(equipment.purchase_date).toISOString().split('T')[0]
        : '',
      notes: equipment?.notes || '',
      obsolete: equipment?.is_obsolete || false
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

      const formData: NewEquipment = {
        name: values.name,
        description: values.description || null,
        serial_number: values.serial_number || null,
        purchase_date: values.purchase_date
          ? new Date(values.purchase_date)
          : null,
        notes: values.notes || null,
        is_obsolete: values.obsolete,
        is_assigned: false // Default to false for new equipment
      }

      const result = equipment
        ? await updateEquipment({ ...formData, id: equipment.id })
        : await createEquipment(formData)

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
                  <Input {...field} placeholder='Enter serial number' />
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
                    value={field.value || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      field.onChange(e.target.value || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='obsolete'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Obsolete</FormLabel>
                  <FormMessage />
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
                    placeholder='Enter notes'
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
