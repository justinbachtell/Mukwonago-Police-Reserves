import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EventsLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Skeleton className='size-5' />
            <Skeleton className='h-6 w-[150px]' />
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
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

      {/* Events Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className='overflow-hidden bg-white/80 shadow-md dark:bg-white/5'
          >
            <Skeleton className='aspect-video w-full' />
            <CardContent className='space-y-3 p-4'>
              <Skeleton className='h-6 w-[250px]' />
              <div className='flex gap-2'>
                <Skeleton className='h-5 w-[100px]' />
                <Skeleton className='h-5 w-[100px]' />
              </div>
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
