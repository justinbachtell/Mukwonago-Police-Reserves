import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function ReservesLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Header Section */}
      <div className='space-y-2'>
        <Skeleton className='h-10 w-[300px]' />
        <Skeleton className='h-6 w-[400px]' />
      </div>

      {/* Stats Card */}
      <Card className='bg-white/80 shadow-md dark:bg-white/5'>
        <CardContent className='grid gap-4 p-6 sm:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className='h-5 w-[120px]' />
              <Skeleton className='mt-1 h-8 w-[60px]' />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex gap-4 border-b pb-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-[120px]' />
        ))}
      </div>

      {/* Content Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className='overflow-hidden border-0 bg-white/80 shadow-md dark:bg-white/5'
          >
            <Skeleton className='aspect-video w-full' />
            <CardContent className='space-y-2 p-4'>
              <Skeleton className='h-6 w-[250px]' />
              <Skeleton className='h-4 w-[200px]' />
              <div className='flex gap-2'>
                <Skeleton className='h-8 w-[100px]' />
                <Skeleton className='h-8 w-[100px]' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
