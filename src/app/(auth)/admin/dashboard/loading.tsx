import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AdminDashboardLoading() {
  return (
    <div className='min-h-screen px-4 md:px-6 lg:px-10'>
      <div className='container mx-auto space-y-8'>
        {/* Header Section */}
        <div className='space-y-2'>
          <Skeleton className='h-10 w-[300px]' />
          <Skeleton className='h-6 w-[400px]' />
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className='group overflow-hidden border-0 bg-white/80 shadow-md dark:bg-white/5'
            >
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3'>
                <Skeleton className='h-5 w-[100px]' />
                <Skeleton className='size-5' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-[60px]' />
                <Skeleton className='mt-2 h-4 w-[120px]' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Grid */}
        <div className='grid gap-6 xl:grid-cols-2'>
          {/* Upcoming Events Card */}
          <Card className='overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'>
            <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
              <div className='flex items-center gap-2'>
                <Skeleton className='size-5' />
                <Skeleton className='h-6 w-[150px]' />
              </div>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-4 rounded-lg border p-3'
                  >
                    <Skeleton className='size-10 rounded-lg' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-5 w-[200px]' />
                      <div className='flex items-center gap-2'>
                        <Skeleton className='size-4' />
                        <Skeleton className='h-4 w-[150px]' />
                      </div>
                    </div>
                    <Skeleton className='h-6 w-[100px]' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Activity Card */}
          <Card className='overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'>
            <CardHeader className='border-b border-gray-100 pb-4 dark:border-gray-800'>
              <div className='flex items-center gap-2'>
                <Skeleton className='size-5' />
                <Skeleton className='h-6 w-[150px]' />
              </div>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-4 rounded-lg border p-3'
                  >
                    <Skeleton className='size-10 rounded-lg' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-5 w-[200px]' />
                      <div className='flex items-center gap-2'>
                        <Skeleton className='size-4' />
                        <Skeleton className='h-4 w-[150px]' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='rounded-lg border-0 bg-white/80 p-4 shadow-md dark:bg-white/5'
            >
              <div className='flex items-center gap-3'>
                <Skeleton className='size-5' />
                <Skeleton className='h-5 w-[120px]' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
