import { Skeleton } from '@/components/ui/skeleton'

export default function PoliciesLoading() {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header Skeleton */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <Skeleton className='mb-2 h-9 w-[250px]' />
          <Skeleton className='h-5 w-[350px]' />
        </div>
        <Skeleton className='h-10 w-[140px]' />
      </div>

      {/* Table Loading State */}
      <div className='rounded-md border'>
        {/* Table Header */}
        <div className='border-b bg-muted/50 p-4'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-4 w-[120px]' />
            <Skeleton className='h-4 w-[150px]' />
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-4 w-[120px]' />
          </div>
        </div>

        {/* Table Body */}
        <div className='p-4'>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`loading-row-${i}`}
                className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
              >
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-4 w-[120px]' />
                  <Skeleton className='h-4 w-[150px]' />
                  <Skeleton className='h-4 w-[100px]' />
                  <Skeleton className='h-4 w-[120px]' />
                </div>
                <div className='flex items-center gap-2'>
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
