'use client'

import type { EventAssignment } from '@/types/eventAssignment'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/user/events/columns'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'user',
  file: 'UserEventsTable.tsx'
})

interface UserEventsTableProps {
  data: EventAssignment[]
}

export function UserEventsTable({ data }: UserEventsTableProps) {
  logger.info(
    'Rendering user events table',
    { eventCount: data.length },
    'UserEventsTable'
  )
  logger.time('user-events-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([])
    const searchParams = useSearchParams()
    const view = searchParams.get('view') ?? 'table'

    if (view !== 'table') {
      return null
    }

    // Custom sort function
    const sortEvents = (assignments: EventAssignment[]) => {
      const now = new Date()

      // First, separate future and past events
      const futureEvents = assignments.filter(
        assignment =>
          assignment.event && new Date(assignment.event.event_date) >= now
      )
      const pastEvents = assignments.filter(
        assignment =>
          assignment.event && new Date(assignment.event.event_date) < now
      )

      // Sort future events by closest date first
      const sortedFutureEvents = futureEvents.sort((a, b) => {
        if (!a.event || !b.event) {
          return 0
        }
        return (
          new Date(a.event.event_date).getTime() -
          new Date(b.event.event_date).getTime()
        )
      })

      // Sort past events by most recent first
      const sortedPastEvents = pastEvents.sort((a, b) => {
        if (!a.event || !b.event) {
          return 0
        }
        return (
          new Date(b.event.event_date).getTime() -
          new Date(a.event.event_date).getTime()
        )
      })

      // Combine the arrays with future events first, then past events
      return [...sortedFutureEvents, ...sortedPastEvents]
    }

    logger.debug(
      'Sorted events data',
      {
        totalEvents: data.length,
        firstEvent: data[0]?.event?.event_date,
        lastEvent: data[data.length - 1]?.event?.event_date
      },
      'UserEventsTable'
    )

    return (
      <DataTable
        columns={columns}
        data={sortEvents(data)}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    )
  } catch (error) {
    logger.error(
      'Error rendering user events table',
      logger.errorWithData(error),
      'UserEventsTable'
    )
    throw error
  } finally {
    logger.timeEnd('user-events-table-render')
  }
}
