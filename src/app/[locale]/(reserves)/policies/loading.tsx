import { Skeleton } from '@/components/ui/skeleton'

export default function PoliciesLoading() {
  return (
    <div className='container mx-auto py-6'>
      <Skeleton className='h-8 w-[200px] mb-6' />
      <div className='grid gap-6 md:grid-cols-12'>
        {/* Navigation Skeleton */}
        <div className='rounded-lg border p-4 col-span-3'>
          <Skeleton className='h-6 w-[150px] mb-4' />
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
        <div className='rounded-lg border p-4 col-span-9'>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`row-skeleton-${i}`}
                className='flex justify-between items-center'
              >
                <div className='flex gap-4 flex-1'>
                  <Skeleton className='h-4 w-[100px]' />
                  <Skeleton className='h-4 w-[200px]' />
                  <Skeleton className='h-4 w-[100px]' />
                  <Skeleton className='h-4 w-[100px]' />
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
