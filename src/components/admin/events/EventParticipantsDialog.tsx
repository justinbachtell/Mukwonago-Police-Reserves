'use client'

import type { Event } from '@/types/event'
import type { CompletionStatus } from '@/types/eventAssignment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { CompletionStatusDialog } from '../shared/CompletionStatusDialog'
import {
  deleteEventAssignment,
  updateEventAssignmentCompletion
} from '@/actions/eventAssignment'
import { toast } from 'sonner'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'EventParticipantsDialog.tsx'
})

interface EventParticipantsDialogProps {
  event: Event
}

export function EventParticipantsDialog({
  event
}: EventParticipantsDialogProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<{
    eventId: number
    userId: string
    status?: CompletionStatus
    notes?: string | null
  } | null>(null)

  const handleRemoveParticipant = async (eventId: number, userId: string) => {
    try {
      logger.info(
        'Removing participant',
        { eventId, userId },
        'handleRemoveParticipant'
      )
      await deleteEventAssignment(eventId, userId)
      toast.success('Participant removed successfully')
    } catch (error) {
      logger.error(
        'Error removing participant',
        logger.errorWithData(error),
        'handleRemoveParticipant'
      )
      toast.error('Failed to remove participant')
    }
  }

  const handleUpdateCompletion = async (data: {
    status: CompletionStatus
    notes?: string | null
  }) => {
    if (!selectedAssignment) {
      return
    }

    try {
      logger.info(
        'Updating completion status',
        { assignment: selectedAssignment, data },
        'handleUpdateCompletion'
      )
      await updateEventAssignmentCompletion(
        selectedAssignment.eventId,
        selectedAssignment.userId,
        {
          completion_status: data.status,
          completion_notes: data.notes
        }
      )
      setSelectedAssignment(null)
      toast.success('Status updated successfully')
    } catch (error) {
      logger.error(
        'Error updating completion status',
        logger.errorWithData(error),
        'handleUpdateCompletion'
      )
      toast.error('Failed to update status')
    }
  }

  const assignments = event.assignments || []
  const isPast = new Date(event.event_end_time) < new Date()

  return (
    <>
      <div className='space-y-4'>
        {assignments.length > 0 ? (
          <div className='divide-y'>
            {assignments.map(assignment => (
              <div
                key={assignment.id}
                className='flex items-center justify-between py-2'
              >
                <div>
                  <span className='text-sm'>
                    {assignment.user?.first_name} {assignment.user?.last_name}
                  </span>
                  {isPast && assignment.completion_status && (
                    <Badge
                      variant={
                        assignment.completion_status === 'completed'
                          ? 'default'
                          : assignment.completion_status === 'excused'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className='ml-2'
                    >
                      {assignment.completion_status}
                    </Badge>
                  )}
                </div>
                <div className='flex gap-2'>
                  {isPast && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setSelectedAssignment({
                          eventId: event.id,
                          userId: assignment.user_id,
                          status: assignment.completion_status || undefined,
                          notes: assignment.completion_notes || undefined
                        })
                      }
                    >
                      Update Status
                    </Button>
                  )}
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() =>
                      handleRemoveParticipant(event.id, assignment.user_id)
                    }
                  >
                    <Trash className='size-4' />
                    <span className='sr-only'>Remove participant</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            No participants yet
          </p>
        )}
      </div>

      {selectedAssignment && (
        <CompletionStatusDialog
          isOpen
          onClose={() => setSelectedAssignment(null)}
          onSubmit={data =>
            handleUpdateCompletion({
              status: data.completion_status,
              notes: data.completion_notes
            })
          }
          title='Update Completion Status'
          currentStatus={selectedAssignment.status}
          currentNotes={selectedAssignment.notes}
        />
      )}
    </>
  )
}
