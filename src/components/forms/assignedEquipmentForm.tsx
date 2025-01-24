'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { SaveResult } from '@/types/forms';
import type { DBUser } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FormTextarea } from '@/components/ui/form-textarea'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  getAssignedEquipment,
  updateAssignedEquipment
} from '@/actions/assignedEquipment'
import { createClient } from '@/lib/client'
import { format } from 'date-fns'
import type { Session } from '@supabase/supabase-js'
import { createLogger } from '@/lib/debug'
import { rules } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

const logger = createLogger({
  module: 'forms',
  file: 'assignedEquipmentForm.tsx'
})

interface AssignedEquipmentFormProps {
  user: DBUser
  saveRef: React.MutableRefObject<(() => Promise<SaveResult>) | null>
}

const notesSchema = z.object({
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .regex(
      /^[a-z0-9\s.,!?()'\-"]*$/i,
      'Notes can only contain letters, numbers, and basic punctuation'
    )
    .nullable()
    .transform((val): string => (val === null ? '' : val))
}) as z.ZodType<{ notes: string }, z.ZodTypeDef, { notes: string | null }>

export function AssignedEquipmentForm({
  saveRef,
  user
}: AssignedEquipmentFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()
  const [assignedEquipment, setAssignedEquipment] = useState<
    AssignedEquipment[]
  >([])
  const [editingNotes, _setEditingNotes] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()
        if (error) {
          logger.error('Failed to get auth session', { error }, 'checkSession')
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
          {
            error:
              error instanceof Error ? error : new Error('Session check failed')
          },
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

  useEffect(() => {
    const loadEquipment = async () => {
      logger.info(
        'Loading assigned equipment',
        { userId: user.id },
        'loadEquipment'
      )
      try {
        const equipment = await getAssignedEquipment(user.id)
        if (!equipment) {
          logger.warn(
            'No equipment data returned',
            { userId: user.id },
            'loadEquipment'
          )
          return
        }

        logger.info(
          'Processing equipment data',
          { count: equipment.length },
          'loadEquipment'
        )

        // Convert null equipment to undefined to match AssignedEquipment type
        const processedEquipment = equipment.map(item => ({
          ...item,
          equipment: item.equipment || null
        }))

        const sortedEquipment = processedEquipment.sort(
          (a: AssignedEquipment, b: AssignedEquipment) => {
            if (!a.checked_in_at && b.checked_in_at) {
              return -1
            }
            if (a.checked_in_at && !b.checked_in_at) {
              return 1
            }
            return (
              new Date(b.checked_out_at).getTime() -
              new Date(a.checked_out_at).getTime()
            )
          }
        )

        logger.info(
          'Equipment data processed and sorted',
          {
            total: sortedEquipment.length,
            active: sortedEquipment.filter(e => !e.checked_in_at).length
          },
          'loadEquipment'
        )

        setAssignedEquipment(sortedEquipment)
      } catch (error) {
        logger.error(
          'Failed to load equipment',
          {
            error:
              error instanceof Error
                ? error
                : new Error('Failed to load equipment')
          },
          'loadEquipment'
        )
      }
    }

    if (session?.user && !isLoading) {
      logger.info(
        'Session active, loading equipment',
        { userId: user.id },
        'useEffect'
      )
      loadEquipment()
    }
  }, [user.id, session, isLoading])

  const handleNotesChange = async (equipmentId: number, notes: string) => {
    const equipment = assignedEquipment.find(e => e.id === equipmentId)
    if (!equipment) {
      return
    }

    try {
      const validatedData = notesSchema.parse({ notes: notes || null })
      const notesValue = validatedData.notes

      const updatedEquipment = await updateAssignedEquipment(equipmentId, {
        notes: notesValue === '' ? undefined : notesValue
      })

      if (updatedEquipment) {
        setAssignedEquipment(prev =>
          prev.map(e =>
            e.id === equipmentId ? { ...e, notes: notesValue } : e
          )
        )
        setHasChanges(true)
        toast({
          title: 'Success',
          description: 'Notes updated successfully'
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Invalid input'
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
        return
      }

      logger.error(
        'Failed to update notes',
        {
          error:
            error instanceof Error ? error : new Error('Failed to update notes')
        },
        'handleNotesChange'
      )
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive'
      })
    }
  }

  const handleSaveChanges = useCallback(async () => {
    logger.info('Handling save changes', undefined, 'handleSaveChanges')
    try {
      if (isLoading) {
        logger.warn('Auth state still loading', undefined, 'handleSaveChanges')
        return { message: 'Loading authentication state', success: false }
      }

      if (!session?.user) {
        logger.warn('No active session', undefined, 'handleSaveChanges')
        return { message: 'Not authenticated', success: false }
      }

      if (!user) {
        logger.warn('No user data available', undefined, 'handleSaveChanges')
        return { message: 'User data not available', success: false }
      }

      if (!hasChanges) {
        logger.info('No changes to save', undefined, 'handleSaveChanges')
        return { message: 'No changes needed', success: true }
      }

      // Update notes for each changed item
      const updates = Object.entries(editingNotes).map(async ([id, notes]) => {
        const { error } = await supabase
          .from('assigned_equipment')
          .update({ notes })
          .eq('id', id)

        if (error) {
          throw error
        }
      })

      await Promise.all(updates)

      // Refresh the equipment list
      const equipment = await getAssignedEquipment(user.id)
      if (!equipment) {
        throw new Error('Failed to refresh equipment list')
      }

      setAssignedEquipment(equipment)
      setHasChanges(false)

      const successMessage = 'Changes saved successfully'
      toast({
        title: 'Success',
        description: successMessage
      })
      return { message: successMessage, success: true }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save changes'
      logger.error(
        'Save changes failed',
        { error: error instanceof Error ? error : new Error(errorMessage) },
        'handleSaveChanges'
      )
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return { message: errorMessage, success: false }
    }
  }, [
    isLoading,
    session?.user,
    hasChanges,
    editingNotes,
    user,
    toast,
    supabase
  ])

  useEffect(() => {
    logger.info('Updating save ref', undefined, 'useEffect')
    saveRef.current = handleSaveChanges
  }, [handleSaveChanges, saveRef])

  return (
    <Card className='p-6 shadow-md md:col-span-12'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Assigned Equipment
        </h2>
        {hasChanges && (
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            Save Changes
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-1/3'>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignedEquipment.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-center text-muted-foreground'
              >
                No equipment assigned
              </TableCell>
            </TableRow>
          ) : (
            assignedEquipment.map(item => (
              <TableRow
                key={item.id}
                className={item.checked_in_at ? 'opacity-40' : ''}
              >
                <TableCell>{item.equipment?.name ?? 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant={getConditionVariant(item.condition)}>
                    {item.condition}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(item.checked_out_at), 'PPP')}
                </TableCell>
                <TableCell>
                  {item.checked_in_at
                    ? format(new Date(item.checked_in_at), 'PPP')
                    : 'Not returned'}
                </TableCell>
                <TableCell>
                  <Badge variant={item.checked_in_at ? 'secondary' : 'default'}>
                    {item.checked_in_at ? 'Returned' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!item.checked_in_at ? (
                    <FormTextarea
                      name={`notes-${item.id}`}
                      label='Equipment Notes'
                      defaultValue={item.notes || ''}
                      rules={[rules.notes()]}
                      formatter='notes'
                      onValueChange={value => handleNotesChange(item.id, value)}
                      placeholder='Add notes about the equipment condition or usage'
                    />
                  ) : (
                    item.notes || 'No notes'
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

function getConditionVariant(condition: AssignedEquipment['condition']) {
  switch (condition) {
    case 'new':
      return 'default'
    case 'good':
      return 'secondary'
    case 'fair':
      return 'outline'
    case 'poor':
      return 'destructive'
    case 'damaged/broken':
      return 'destructive'
    default:
      return 'outline'
  }
}
