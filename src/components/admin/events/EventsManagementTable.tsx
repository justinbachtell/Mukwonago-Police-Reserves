'use client'

import type { Event } from '@/types/event'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/admin/events/management/columns'
import { useState, useEffect, useMemo } from 'react'
import { createLogger } from '@/lib/debug'
import { Loader2 } from 'lucide-react'

const logger = createLogger({
  module: 'admin',
  file: 'EventsManagementTable.tsx'
})

interface EventsManagementTableProps {
  data: Event[]
  onDataChange?: () => void
}

export function EventsManagementTable({
  data,
  onDataChange
}: EventsManagementTableProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [sortedData, setSortedData] = useState<Event[]>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'event_date', desc: true }
  ])

  const tableColumns = useMemo(() => columns(onDataChange), [onDataChange])

  logger.info(
    'Rendering events management table',
    { eventCount: data.length },
    'EventsManagementTable'
  )
  logger.time('events-management-table-render')

  // Custom sort function
  const sortEvents = (events: Event[]) => {
    const now = new Date()

    // First, separate future and past events
    const futureEvents = events.filter(
      event => new Date(event.event_date) >= now
    )
    const pastEvents = events.filter(event => new Date(event.event_date) < now)

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

  useEffect(() => {
    const prepareData = async () => {
      try {
        const sorted = sortEvents(data)
        setSortedData(sorted)
      } finally {
        setIsLoading(false)
      }
    }

    prepareData()
  }, [data])

  logger.debug(
    'Sorted events data',
    {
      totalEvents: data.length,
      firstEvent: data[0]?.event_date,
      lastEvent: data[data.length - 1]?.event_date
    },
    'EventsManagementTable'
  )

  if (isLoading) {
    return (
      <div className='flex h-[500px] items-center justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='size-8 animate-spin' />
          <p className='text-sm text-muted-foreground'>Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <DataTable
      columns={tableColumns}
      data={sortedData}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  )
}
