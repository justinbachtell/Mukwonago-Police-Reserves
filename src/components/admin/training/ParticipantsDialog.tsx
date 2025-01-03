'use client'

import type { Training } from '@/types/training'
import type { CompletionStatus } from '@/types/trainingAssignment'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateTrainingAssignmentCompletion } from '@/actions/trainingAssignment'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ParticipantsDialogProps {
  training: Training
}

export function ParticipantsDialog({ training }: ParticipantsDialogProps) {
  const handleCompletionStatusChange = async (
    userId: number,
    status: CompletionStatus | null,
    notes: string | null = null
  ) => {
    try {
      const result = await updateTrainingAssignmentCompletion(
        training.id,
        userId,
        {
          completion_notes: notes,
          completion_status: status === null ? 'incomplete' : status
        }
      )

      if (result) {
        toast.success('Training completion status updated')
      }
    } catch (error) {
      console.error('Error updating completion status:', error)
      toast.error('Failed to update completion status')
    }
  }

  return (
    <div className='space-y-4 py-4'>
      {training.assignments?.map(assignment => (
        <div
          key={assignment.user_id}
          className='flex flex-col gap-4 rounded-lg border p-4'
        >
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='font-medium'>
                {assignment.user.first_name} {assignment.user.last_name}
              </p>
              <p className='text-sm text-muted-foreground'>
                {assignment.user.email}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Label htmlFor={`status-${assignment.user_id}`}>Status</Label>
              <select
                id={`status-${assignment.user_id}`}
                className={cn(
                  'h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
                value={assignment.completion_status || ''}
                onChange={e =>
                  handleCompletionStatusChange(
                    assignment.user_id,
                    e.target.value as CompletionStatus | null,
                    assignment.completion_notes
                  )
                }
                aria-label={`Completion status for ${assignment.user.first_name} ${assignment.user.last_name}`}
              >
                <option value=''>Select status</option>
                <option value='completed'>Completed</option>
                <option value='incomplete'>Incomplete</option>
                <option value='excused'>Excused</option>
                <option value='unexcused'>Unexcused</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor={`notes-${assignment.user_id}`}>Notes</Label>
            <Textarea
              id={`notes-${assignment.user_id}`}
              placeholder='Add notes about completion status'
              value={assignment.completion_notes || ''}
              onChange={e =>
                handleCompletionStatusChange(
                  assignment.user_id,
                  assignment.completion_status,
                  e.target.value
                )
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}
