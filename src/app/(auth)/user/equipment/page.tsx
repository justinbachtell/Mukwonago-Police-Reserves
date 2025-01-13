import { getAssignedEquipment } from '@/actions/assignedEquipment'
import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ViewToggle } from '@/components/ui/view-toggle'
import { UserEquipmentTable } from '@/components/user/equipment/UserEquipmentTable'
import { UserEquipmentGrid } from '@/components/user/equipment/UserEquipmentGrid'
import { Suspense } from 'react'

export const metadata = {
  title: 'My Equipment - Mukwonago Police Reserves',
  description: 'View your assigned equipment'
}

export default async function UserEquipmentPage() {
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  const equipmentAssignments = await getAssignedEquipment(user.id)

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>My Equipment</h1>
          <p className='mt-2 text-muted-foreground'>
            View your assigned equipment
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Boxes className='size-5 text-blue-500' />
            Equipment Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-3'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Assignments</p>
            <p className='mt-1 text-2xl font-bold'>
              {equipmentAssignments?.length ?? 0}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Currently Assigned</p>
            <p className='mt-1 text-2xl font-bold'>
              {equipmentAssignments?.filter(item => !item.checked_in_at)
                .length ?? 0}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Returned Items</p>
            <p className='mt-1 text-2xl font-bold'>
              {equipmentAssignments?.filter(item => item.checked_in_at)
                .length ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Loading equipment...</div>}>
        <UserEquipmentTable data={equipmentAssignments ?? []} />
        <UserEquipmentGrid data={equipmentAssignments ?? []} />
      </Suspense>
    </div>
  )
}
