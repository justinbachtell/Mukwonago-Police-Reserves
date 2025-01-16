import { Skeleton } from '@/components/ui/skeleton'

export default function ReservesLoading() {
  return (
    <div className='container mx-auto space-y-6 px-4 py-8 md:px-6 lg:px-8'>
      {/* Header Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-10 w-[300px]' />
        <Skeleton className='h-4 w-[400px]' />
      </div>

      {/* Navigation Skeleton */}
      <div className='flex gap-4 border-b pb-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-[100px]' />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='space-y-4'>
            <Skeleton className='h-[200px] w-full rounded-lg' />
            <div className='space-y-2'>
              <Skeleton className='h-5 w-[250px]' />
              <Skeleton className='h-4 w-[200px]' />
              <Skeleton className='h-4 w-[150px]' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
