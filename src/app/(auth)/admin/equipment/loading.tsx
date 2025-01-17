import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminEquipmentLoading() {
  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 pt-4 md:px-6 lg:px-10'>
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

      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='mb-2'>
            <Skeleton className='h-9 w-[250px]' />
          </h2>
          <Skeleton className='h-5 w-[300px]' />
        </div>
        <Skeleton className='h-10 w-[160px]' />
      </div>

      <div className='w-full space-y-4 overflow-x-auto'>
        <div className='rounded-md border'>
          <div className='p-4'>
            {/* Table Content */}
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Skeleton className='h-5 w-[300px]' />
                    <div className='flex gap-4'>
                      <Skeleton className='h-4 w-[120px]' />
                      <Skeleton className='h-4 w-[100px]' />
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
          </div>
        </div>
      </div>
    </div>
  )
}
