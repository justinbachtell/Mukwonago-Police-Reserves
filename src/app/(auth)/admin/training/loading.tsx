import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminTrainingLoading() {
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

      {/* Training Table */}
      <Card>
        <CardContent className='p-0'>
          <div className='border-b p-4'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-5 w-[200px]' />
              <div className='flex gap-2'>
                <Skeleton className='size-8' />
                <Skeleton className='size-8' />
              </div>
            </div>
          </div>
          <div className='p-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='mb-4 flex items-center justify-between border-b pb-4 last:mb-0 last:border-0 last:pb-0'
              >
                <div className='space-y-1'>
                  <Skeleton className='h-5 w-[300px]' />
                  <div className='flex gap-4'>
                    <Skeleton className='h-4 w-[100px]' />
                    <Skeleton className='h-4 w-[150px]' />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Skeleton className='size-8' />
                  <Skeleton className='size-8' />
                  <Skeleton className='size-8' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
