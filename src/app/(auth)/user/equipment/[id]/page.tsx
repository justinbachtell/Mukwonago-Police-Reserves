import { notFound } from 'next/navigation'
import { getEquipment } from '@/actions/equipment'
import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function EquipmentPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  const equipment = await getEquipment(Number.parseInt(id))
  if (!equipment) {
    return notFound()
  }

  return (
    <div className='container mx-auto py-8'>
      <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'>
        <CardHeader className='border-b border-gray-100 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
              <Boxes className='size-6 text-blue-500' />
              {equipment.name}
            </CardTitle>
            <Badge
              variant='secondary'
              className='bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            >
              {equipment.is_assigned ? 'Assigned' : 'Available'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-6 p-6'>
          {/* Equipment Details */}
          <div className='grid gap-4 sm:grid-cols-2'>
            {equipment.serial_number && (
              <div className='flex items-center gap-2'>
                <FileText className='size-5 text-gray-500' />
                <span className='text-sm'>
                  Serial Number: {equipment.serial_number}
                </span>
              </div>
            )}
            {equipment.purchase_date && (
              <div className='flex items-center gap-2'>
                <Calendar className='size-5 text-gray-500' />
                <span className='text-sm'>
                  Purchased:{' '}
                  {format(new Date(equipment.purchase_date), 'MMMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {equipment.description && (
            <div className='prose prose-gray dark:prose-invert max-w-none'>
              <h3 className='text-lg font-semibold'>Description</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                {equipment.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {equipment.notes && (
            <div className='prose prose-gray dark:prose-invert max-w-none'>
              <h3 className='text-lg font-semibold'>Notes</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                {equipment.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
