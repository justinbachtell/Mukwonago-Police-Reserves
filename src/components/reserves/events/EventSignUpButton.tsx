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
import { Loader2 } from 'lucide-react'

interface EventSignUpButtonProps {
  event: Event
}

export function EventSignUpButton({ event }: EventSignUpButtonProps) {
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isEventPast = () => {
    try {
      const eventDate = new Date(event.event_date)
      const now = new Date()
      return eventDate < now
    } catch (error) {
      console.error('Error comparing dates:', error)
      return false
    }
  }

  const isEventFull = () => {
    const currentParticipants = event.assignments?.length || 0
    const maxParticipants = event.max_participants || 0
    return currentParticipants >= maxParticipants
  }

  useEffect(() => {
    const checkSignUpStatus = async () => {
      const user = await getCurrentUser()
      if (!user) {
        return
      }

      const assignments = event.assignments || []
      const isUserSignedUp = assignments.some(
        assignment => assignment.user_id === user.id
      )
      setIsSignedUp(isUserSignedUp)
    }

    checkSignUpStatus()
  }, [event.id, event.event_date, event.assignments])

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

  const isPast = isEventPast()
  const isFull = isEventFull()

  if (isPast) {
    return (
      <Button
        variant='ghost'
        size='sm'
        className='w-[140px] bg-gray-100 text-gray-500 dark:bg-gray-800'
        disabled
      >
        Event Ended
      </Button>
    )
  }

  if (isFull && !isSignedUp) {
    return (
      <Button
        variant='ghost'
        size='sm'
        className='w-[140px] bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400'
        disabled
      >
        Event Full
      </Button>
    )
  }

  return (
    <Button
      key={`${event.id}-${event.event_date}`}
      variant={isSignedUp ? 'destructive' : 'default'}
      size='sm'
      onClick={handleSignUp}
      disabled={isLoading}
      className='w-[140px]'
    >
      {isLoading ? (
        <>
          <Loader2 className='mr-1 size-4 animate-spin' />
          Processing
        </>
      ) : isSignedUp ? (
        'Leave Event'
      ) : (
        'Sign Up'
      )}
    </Button>
  )
}
