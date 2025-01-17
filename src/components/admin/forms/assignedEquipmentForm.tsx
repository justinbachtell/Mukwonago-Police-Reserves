'use client'

import type { AssignedEquipment } from '@/types/assignedEquipment'
import type { SaveResult } from '@/types/forms'
import type { DBUser } from '@/types/user'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
import { FormTextarea } from '@/components/ui/form-textarea'
import { rules } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

const logger = createLogger({
  module: 'forms',
  file: 'assignedEquipmentForm.tsx'
})

interface AssignedEquipmentFormProps {
  user: DBUser
  saveRef: React.MutableRefObject<(() => Promise<SaveResult>) | null>
}

export function AssignedEquipmentForm({
  saveRef,
  user
}: AssignedEquipmentFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()
  const [assignedEquipment, setAssignedEquipment] = useState<
    AssignedEquipment[]
  >([])
  const [hasChanges, setHasChanges] = useState(false)

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
          logger.errorWithData(error),
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
      const updatedEquipment = await updateAssignedEquipment(equipmentId, {
        notes: notes || undefined
      })

      if (updatedEquipment) {
        setAssignedEquipment(prev =>
          prev.map(e => (e.id === equipmentId ? { ...e, notes } : e))
        )
        setHasChanges(true)
        toast({
          title: 'Success',
          description: 'Notes updated successfully'
        })
      }
    } catch (error) {
      logger.error(
        'Failed to update notes',
        logger.errorWithData(error),
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

      if (!hasChanges) {
        logger.info('No changes needed', undefined, 'handleSaveChanges')
        return { message: 'No changes needed', success: true }
      }

      // Reset changes flag after successful save
      setHasChanges(false)
      return { message: 'Changes saved successfully', success: true }
    } catch (error) {
      logger.error(
        'Save changes failed',
        logger.errorWithData(error),
        'handleSaveChanges'
      )
      return { message: 'Failed to save changes', success: false }
    }
  }, [session, isLoading, hasChanges])

  useEffect(() => {
    logger.info('Updating save ref', undefined, 'useEffect')
    saveRef.current = handleSaveChanges
  }, [handleSaveChanges, saveRef])

  return (
    <Card className='p-6 shadow-md md:col-span-12'>
      <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
        Assigned Equipment
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
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

export default AssignedEquipmentForm
