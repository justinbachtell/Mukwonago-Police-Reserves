'use client'

import type { Event } from '@/types/event'
import { Button } from '@/components/ui/button'
import {
  createEventAssignment,
  deleteEventAssignment
} from '@/actions/eventAssignment'
import { getCurrentUser } from '@/actions/user'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

interface EventSignUpButtonProps {
  event: Event
}

export function EventSignUpButton({ event }: EventSignUpButtonProps) {
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSignUpStatus = async () => {
      const user = await getCurrentUser()
      if (!user) {
        return
      }

      // Check if user is already signed up for this event
      const assignments = event.assignments || []
      const isUserSignedUp = assignments.some(
        assignment => assignment.user_id === user.id
      )
      setIsSignedUp(isUserSignedUp)
    }

    checkSignUpStatus()
  }, [event])

  const handleSignUp = async () => {
    try {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (!user) {
        toast.error('You must be logged in to sign up for events')
        return
      }

      if (isSignedUp) {
        await deleteEventAssignment(event.id, user.id)
        setIsSignedUp(false)
        toast.success('Successfully left event')
      } else {
        await createEventAssignment({
          event_id: event.id,
          user_id: user.id
        })
        setIsSignedUp(true)
        toast.success('Successfully signed up for event')
      }
    } catch (error) {
      console.error('Error handling event sign up:', error)
      toast.error('Failed to update event registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isSignedUp ? 'destructive' : 'default'}
      onClick={handleSignUp}
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : isSignedUp ? 'Leave Event' : 'Sign Up'}
    </Button>
  )
}
