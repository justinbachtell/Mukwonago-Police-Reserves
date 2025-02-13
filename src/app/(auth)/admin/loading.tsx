import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className='container mx-auto space-y-6 py-8'>
      {/* Header Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-[200px]' />
        <Skeleton className='h-4 w-[300px]' />
      </div>

      {/* Table Loading State */}
      <div className='space-y-4'>
        <div className='rounded-md border'>
          <div className='p-4'>
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`loading-skeleton-${i}`}
                  className='flex items-center justify-between'
                >
                  <Skeleton className='h-4 w-[200px]' />
                  <div className='flex gap-2'>
                    <Skeleton className='size-8' />
                    <Skeleton className='size-8' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
