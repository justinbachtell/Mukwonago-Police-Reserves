'use client'

import type { Event } from '@/types/event'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/admin/events/columns'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'EventsTable.tsx'
})

interface EventsTableProps {
  data: Event[]
}

export function EventsTable({ data }: EventsTableProps) {
  logger.info(
    'Rendering events table',
    { eventCount: data.length },
    'EventsTable'
  )
  logger.time('events-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'event_date', desc: true }
    ])

    logger.debug('Initializing table state', { sorting }, 'EventsTable')

    // Custom sort function
    const sortEvents = (events: Event[]) => {
      const now = new Date()

      // First, separate future and past events
      const futureEvents = events.filter(
        event => new Date(event.event_date) >= now
      )
      const pastEvents = events.filter(
        event => new Date(event.event_date) < now
      )

      // Sort future events by closest date first
      const sortedFutureEvents = futureEvents.sort((a, b) => {
        return (
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
      })

      // Sort past events by most recent first
      const sortedPastEvents = pastEvents.sort((a, b) => {
        return (
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        )
      })

      // Combine the arrays with future events first, then past events
      return [...sortedFutureEvents, ...sortedPastEvents]
    }

    logger.debug(
      'Sorted events data',
      {
        totalEvents: data.length,
        firstEvent: data[0]?.event_date,
        lastEvent: data[data.length - 1]?.event_date
      },
      'EventsTable'
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
      'Error rendering events table',
      logger.errorWithData(error),
      'EventsTable'
    )
    throw error
  } finally {
    logger.timeEnd('events-table-render')
  }
}
