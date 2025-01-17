import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function UserEquipmentLoading() {
  return (
    <div className='container mx-auto pt-8'>
      <div className='mb-8'>
        <Skeleton className='mb-2 h-9 w-[400px]' />
        <Skeleton className='h-5 w-[300px]' />
      </div>

      <div className='grid grid-cols-12 gap-8'>
        {/* Assign New Equipment Form Card */}
        <Card className='col-span-12 p-6 xl:col-span-4 2xl:col-span-3'>
          <Skeleton className='mb-6 h-7 w-[200px]' />
          <div className='space-y-6'>
            <div>
              <Skeleton className='mb-2 h-5 w-[100px]' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div>
              <Skeleton className='mb-2 h-5 w-[100px]' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div>
              <Skeleton className='mb-2 h-5 w-[100px]' />
              <Skeleton className='h-20 w-full' />
            </div>
            <Skeleton className='h-10 w-full' />
          </div>
        </Card>

        {/* Assigned Equipment Table Card */}
        <Card className='col-span-12 p-6 xl:col-span-8 2xl:col-span-9'>
          <Skeleton className='mb-6 h-7 w-[200px]' />
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div className='space-y-1'>
                  <Skeleton className='h-5 w-[300px]' />
                  <div className='flex gap-4'>
                    <Skeleton className='h-4 w-[120px]' />
                    <Skeleton className='h-4 w-[100px]' />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Skeleton className='size-8' />
                  <Skeleton className='size-8' />
                  <Skeleton className='size-8' />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
