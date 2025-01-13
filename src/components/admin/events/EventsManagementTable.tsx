'use client'

import type { Event } from '@/types/event'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/admin/events/management/columns'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'EventsManagementTable.tsx'
})

interface EventsManagementTableProps {
  data: Event[]
}

export function EventsManagementTable({ data }: EventsManagementTableProps) {
  logger.info(
    'Rendering events management table',
    { eventCount: data.length },
    'EventsManagementTable'
  )
  logger.time('events-management-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'event_date', desc: true }
    ])

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
      const sortedFutureEvents = futureEvents.sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      )

      // Sort past events by most recent first
      const sortedPastEvents = pastEvents.sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      )

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
      'EventsManagementTable'
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
      'Error rendering events management table',
      logger.errorWithData(error),
      'EventsManagementTable'
    )
    throw error
  } finally {
    logger.timeEnd('events-management-table-render')
  }
}
