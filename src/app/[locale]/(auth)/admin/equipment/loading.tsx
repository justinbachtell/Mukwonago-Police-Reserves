import { LoadingHeader } from '@/components/loading/LoadingShell'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminEquipmentLoading() {
  return (
    <div className='container py-8 space-y-6 mx-auto'>
      <LoadingHeader />
      <div className='rounded-md border'>
        <div className='p-4'>
          {/* Table Header */}
          <div className='flex items-center justify-between pb-4'>
            <Skeleton className='h-8 w-[200px]' />
            <Skeleton className='h-9 w-[100px]' />
          </div>

          {/* Table Content */}
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Skeleton className='h-5 w-[300px]' />
                  <Skeleton className='h-4 w-[200px]' />
                </div>
                <div className='flex gap-2'>
                  <Skeleton className='h-8 w-8' />
                  <Skeleton className='h-8 w-8' />
                  <Skeleton className='h-8 w-8' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
