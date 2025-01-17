import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function PolicyCompletionsLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Header Section */}
      <div className='mb-6'>
        <Skeleton className='mb-2 h-9 w-[250px]' />
        <Skeleton className='h-5 w-[300px]' />
      </div>

      {/* Completions Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-7 w-[200px]' />
              <Skeleton className='h-5 w-[300px]' />
            </div>
            <div className='flex gap-2'>
              <Skeleton className='size-10' />
              <Skeleton className='size-10' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='border-t'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center justify-between border-b p-4 last:border-0'
              >
                <div className='flex items-center gap-4'>
                  <Skeleton className='size-10 rounded-full' />
                  <div className='space-y-1'>
                    <Skeleton className='h-5 w-[200px]' />
                    <div className='flex gap-4'>
                      <Skeleton className='h-4 w-[100px]' />
                      <Skeleton className='h-4 w-[150px]' />
                    </div>
                  </div>
                </div>
                <div className='flex gap-2'>
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
