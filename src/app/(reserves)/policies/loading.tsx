import { Skeleton } from '@/components/ui/skeleton'

export default function PoliciesLoading() {
  return (
    <div className='container mx-auto px-4 py-8 md:px-6 lg:px-8'>
      <Skeleton className='mb-6 h-8 w-[200px]' />
      <div className='grid gap-6 md:grid-cols-12'>
        {/* Navigation Skeleton */}
        <div className='col-span-3 rounded-lg border p-4'>
          <Skeleton className='mb-4 h-6 w-[150px]' />
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={`nav-skeleton-${i}`}
                className='h-10 w-full rounded-md'
              />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className='col-span-9 rounded-lg border p-4'>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`row-skeleton-${i}`}
                className='flex items-center justify-between'
              >
                <div className='flex flex-1 gap-4'>
                  <Skeleton className='h-4 w-[100px]' />
                  <Skeleton className='h-4 w-[200px]' />
                  <Skeleton className='h-4 w-[100px]' />
                  <Skeleton className='h-4 w-[100px]' />
                </div>
                <div className='flex gap-2'>
                  <Skeleton className='size-8' />
                  <Skeleton className='size-8' />
                  <Skeleton className='size-8' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
