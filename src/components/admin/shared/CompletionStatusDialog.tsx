'use client'

import type { CompletionStatus } from '@/types/eventAssignment'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'

interface CompletionStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    completion_status: CompletionStatus
    completion_notes?: string
  }) => Promise<void>
  title: string
  currentStatus?: CompletionStatus | null
  currentNotes?: string | null
}

export function CompletionStatusDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  currentStatus,
  currentNotes
}: CompletionStatusDialogProps) {
  const [status, setStatus] = useState<CompletionStatus | undefined>(
    currentStatus || undefined
  )
  const [notes, setNotes] = useState<string>(currentNotes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!status) {
      toast.error('Please select a completion status')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        completion_status: status,
        completion_notes: notes
      })
      onClose()
      toast.success('Completion status updated successfully')
    } catch (error) {
      console.error('Error updating completion status:', error)
      toast.error('Failed to update completion status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 pt-4'>
          <div className='space-y-2'>
            <Label htmlFor='completion-status'>Completion Status</Label>
            <Select
              value={status}
              onValueChange={value => setStatus(value as CompletionStatus)}
              name='completion-status'
            >
              <SelectTrigger id='completion-status'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='incomplete'>Incomplete</SelectItem>
                <SelectItem value='excused'>Excused</SelectItem>
                <SelectItem value='unexcused'>Unexcused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='completion-notes'>Notes</Label>
            <Textarea
              id='completion-notes'
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Add any notes about completion status'
              className='min-h-[100px]'
            />
          </div>
          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
