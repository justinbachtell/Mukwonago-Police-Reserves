import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function PolicyLoading() {
  return (
    <div className='container mx-auto px-4 py-8 md:px-6 lg:px-8'>
      <Card className='space-y-8 p-6'>
        {/* Policy Details Skeleton */}
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-9 w-[300px]' />
          <div className='flex gap-4'>
            <Skeleton className='h-5 w-[120px]' />
            <Skeleton className='h-5 w-[150px]' />
          </div>
          <Skeleton className='h-5 w-[400px]' />
        </div>

        {/* PDF Viewer Skeleton */}
        <Card className='h-[calc(90vh-12rem)] overflow-hidden'>
          <div className='flex items-center justify-between border-b p-4'>
            <div className='flex gap-4'>
              <Skeleton className='h-8 w-[100px]' />
              <Skeleton className='h-8 w-[50px]' />
            </div>
            <div className='flex gap-2'>
              <Skeleton className='size-8' />
              <Skeleton className='size-8' />
              <Skeleton className='size-8' />
            </div>
          </div>

          <CardContent className='flex h-[calc(100%-8rem)] items-center justify-center p-8'>
            <Skeleton className='size-full max-w-3xl' />
          </CardContent>

          <div className='flex items-center justify-between border-t p-4'>
            <Skeleton className='h-8 w-[100px]' />
            <div className='flex gap-2'>
              <Skeleton className='size-8' />
              <Skeleton className='size-8' />
            </div>
          </div>
        </Card>
      </Card>
    </div>
  )
}
