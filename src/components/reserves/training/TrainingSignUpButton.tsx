'use client'

import type { Training } from '@/types/training'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/actions/user'
import {
  createTrainingAssignment,
  deleteTrainingAssignment
} from '@/actions/trainingAssignment'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { toISOString } from '@/lib/utils'

interface TrainingSignUpButtonProps {
  training: Training
}

export function TrainingSignUpButton({ training }: TrainingSignUpButtonProps) {
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isTrainingPast = () => {
    return (
      toISOString(new Date(training.training_end_time)) <
      toISOString(new Date())
    )
  }

  useEffect(() => {
    const checkSignUpStatus = async () => {
      const user = await getCurrentUser()
      if (!user) {
        return
      }

      // Check if user is already signed up for this training
      const assignments = training.assignments || []
      const isUserSignedUp = assignments.some(
        assignment => assignment.user_id === user.id
      )
      setIsSignedUp(isUserSignedUp)
    }

    checkSignUpStatus()
  }, [training])

  const handleSignUp = async () => {
    try {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (!user) {
        toast.error('You must be logged in to sign up for training')
        return
      }

      if (isSignedUp) {
        await deleteTrainingAssignment(training.id, user.id)
        setIsSignedUp(false)
        toast.success('Successfully left training')
      } else {
        await createTrainingAssignment({
          training_id: training.id,
          user_id: user.id
        })
        setIsSignedUp(true)
        toast.success('Successfully signed up for training')
      }
    } catch (error) {
      console.error('Error handling training sign up:', error)
      toast.error('Failed to update training registration')
    } finally {
      setIsLoading(false)
    }
  }

  const isPast = isTrainingPast()

  if (isPast) {
    return (
      <Button variant='outline' disabled>
        Training Ended
      </Button>
    )
  }

  return (
    <Button
      variant={isSignedUp ? 'destructive' : 'default'}
      onClick={handleSignUp}
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : isSignedUp ? 'Leave Training' : 'Sign Up'}
    </Button>
  )
}
