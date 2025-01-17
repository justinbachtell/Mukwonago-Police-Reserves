import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PoliciesLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 pt-4 md:px-6 lg:px-10'>
      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Skeleton className='size-5' />
            <Skeleton className='h-6 w-[150px]' />
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className='h-5 w-[120px]' />
              <Skeleton className='mt-1 h-8 w-[60px]' />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Header Section */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <Skeleton className='mb-2 h-9 w-[250px]' />
          <Skeleton className='h-5 w-[300px]' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='size-10' />
          <Skeleton className='size-10' />
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-12'>
        {/* Navigation */}
        <Card className='col-span-3 p-4'>
          <Skeleton className='mb-4 h-6 w-[150px]' />
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={`nav-skeleton-${i}`}
                className='h-10 w-full rounded-md'
              />
            ))}
          </div>
        </Card>

        {/* Content */}
        <Card className='col-span-9 p-4'>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`row-skeleton-${i}`}
                className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
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
        </Card>
      </div>
    </div>
  )
}
