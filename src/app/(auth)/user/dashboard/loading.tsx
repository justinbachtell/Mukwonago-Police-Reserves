import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Header Section */}
      <div className='mb-6'>
        <Skeleton className='mb-2 h-9 w-[250px]' />
        <Skeleton className='h-5 w-[300px]' />
      </div>

      {/* Stats Section */}
      <div className='grid gap-6 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className='bg-white/80 shadow-md dark:bg-white/5'>
            <CardContent className='flex items-center justify-between p-6'>
              <div className='space-y-1'>
                <Skeleton className='h-5 w-[120px]' />
                <Skeleton className='h-7 w-[80px]' />
              </div>
              <Skeleton className='size-12' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className='space-y-6'>
        {/* Activity Summary */}
        <Card className='bg-white/80 shadow-md dark:bg-white/5'>
          <CardHeader>
            <Skeleton className='h-7 w-[200px]' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
              >
                <div className='space-y-1'>
                  <Skeleton className='h-5 w-[250px]' />
                  <Skeleton className='h-4 w-[150px]' />
                </div>
                <Skeleton className='h-8 w-[100px]' />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Grid */}
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
    </div>
  )
}
