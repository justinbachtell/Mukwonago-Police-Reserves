'use client'

import type { Training } from '@/types/training'
import { Button } from '@/components/ui/button'
import {
  createTrainingAssignment,
  deleteTrainingAssignment
} from '@/actions/trainingAssignment'
import { getCurrentUser } from '@/actions/user'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { useEffect, useState } from 'react'
import type { DBUser } from '@/types/user'

const logger = createLogger({
  module: 'training',
  file: 'TrainingSignUpButton.tsx'
})

interface TrainingSignUpButtonProps {
  training: Training
}

export function TrainingSignUpButton({ training }: TrainingSignUpButtonProps) {
  const router = useRouter()
  const [user, setUser] = useState<DBUser | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    fetchUser()
  }, [])

  if (!user) {
    return null
  }

  const isAssigned = training.assignments?.some(a => a.user_id === user.id)
  const isLocked = training.is_locked
  const canSignUp =
    !isLocked ||
    (isLocked && training.assignments?.some(a => a.user_id === user.id))

  const isPast = new Date(training.training_date) < new Date()

  const handleSignUp = async () => {
    try {
      if (!canSignUp) {
        toast.error('This training is locked and you are not assigned to it')
        return
      }

      const result = await createTrainingAssignment({
        training_id: training.id,
        user_id: user.id
      })

      if (result) {
        toast.success('Successfully signed up for training')
        router.refresh()
      } else {
        toast.error('Failed to sign up for training')
      }
    } catch (error) {
      logger.error(
        'Error signing up for training',
        logger.errorWithData(error),
        'handleSignUp'
      )
      toast.error('Failed to sign up for training')
    }
  }

  const handleLeaveTraining = async () => {
    try {
      const result = await deleteTrainingAssignment(training.id, user.id)

      if (result) {
        toast.success('Successfully left training')
        router.refresh()
      } else {
        toast.error('Failed to leave training')
      }
    } catch (error) {
      logger.error(
        'Error leaving training',
        logger.errorWithData(error),
        'handleLeaveTraining'
      )
      toast.error('Failed to leave training')
    }
  }

  if (isPast) {
    return (
      <Button
        variant='ghost'
        size='sm'
        className='w-[140px] bg-gray-100 text-gray-500 dark:bg-gray-800'
        disabled
      >
        Training Ended
      </Button>
    )
  }

  if (isAssigned) {
    return (
      <Button
        size='sm'
        variant='destructive'
        disabled={!user}
        onClick={handleLeaveTraining}
        className='w-[140px]'
      >
        Leave Training
      </Button>
    )
  }

  return (
    <Button
      size='sm'
      variant={canSignUp ? 'default' : 'outline'}
      onClick={handleSignUp}
      disabled={!canSignUp}
      className='w-[140px]'
    >
      {isLocked ? 'Restricted Training' : 'Sign Up'}
    </Button>
  )
}
