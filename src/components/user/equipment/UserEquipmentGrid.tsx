'use client'

import type { AssignedEquipment } from '@/types/assignedEquipment'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Boxes, Calendar, FileText } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface UserEquipmentGridProps {
  data: AssignedEquipment[]
}

export function UserEquipmentGrid({ data }: UserEquipmentGridProps) {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'table'

  if (view !== 'grid') {
    return null
  }

  // Sort equipment: active first, then returned
  const sortedEquipment = [...data].sort((a, b) => {
    if (!a.checked_in_at && b.checked_in_at) {
      return -1
    }
    if (a.checked_in_at && !b.checked_in_at) {
      return 1
    }

    // If both are active or both are returned, sort by most recent action
    if (!a.checked_in_at && !b.checked_in_at) {
      // Both active, sort by most recently checked out
      return (
        new Date(b.checked_out_at).getTime() -
        new Date(a.checked_out_at).getTime()
      )
    } else if (a.checked_in_at && b.checked_in_at) {
      // Both returned, sort by most recently checked in
      return (
        new Date(b.checked_in_at).getTime() -
        new Date(a.checked_in_at).getTime()
      )
    }
    return 0
  })

  return (
    <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {sortedEquipment.map(item => (
        <Card
          key={item.id}
          className='flex flex-col bg-white/80 shadow-md transition-all hover:shadow-lg dark:bg-white/5'
        >
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  {item.equipment?.name}
                </h3>
                <div className='mt-2 flex flex-wrap gap-2'>
                  <Badge variant='outline' className='capitalize'>
                    {item.condition}
                  </Badge>
                  <Badge
                    variant={item.checked_in_at ? 'secondary' : 'default'}
                    className='capitalize'
                  >
                    {item.checked_in_at ? 'Returned' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='flex grow flex-col space-y-4'>
            {item.equipment?.serial_number && (
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                <FileText className='size-4' />
                <span>Serial Number: {item.equipment.serial_number}</span>
              </div>
            )}
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <Calendar className='size-4' />
              <span>
                Checked out:{' '}
                {format(new Date(item.checked_out_at), 'MMM d, yyyy')}
              </span>
            </div>
            {item.checked_in_at && (
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                <Boxes className='size-4' />
                <span>
                  Returned:{' '}
                  {format(new Date(item.checked_in_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {item.notes && (
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                {item.notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
