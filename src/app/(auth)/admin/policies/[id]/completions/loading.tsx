import { Skeleton } from '@/components/ui/skeleton'

export default function PolicyCompletionsLoading() {
  return (
    <div className='container mx-auto space-y-6 py-8'>
      {/* Header Skeleton */}
      <div className='mb-4'>
        <Skeleton className='mb-2 h-8 w-[250px]' />
        <Skeleton className='h-4 w-[400px]' />
      </div>

      {/* Reset Button Skeleton */}
      <div className='mb-6 flex items-center justify-end'>
        <Skeleton className='h-10 w-[150px]' />
      </div>

      {/* Table Loading State */}
      <div className='rounded-md border'>
        {/* Table Header */}
        <div className='border-b bg-muted/50 p-4'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-4 w-[120px]' />
            <Skeleton className='h-4 w-[80px]' />
          </div>
        </div>

        {/* Table Body */}
        <div className='p-4'>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`loading-row-${i}`}
                className='flex items-center justify-between'
              >
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[120px]' />
                <Skeleton className='h-8 w-[80px]' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
