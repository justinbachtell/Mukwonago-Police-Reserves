import { Skeleton } from '@/components/ui/skeleton'

export default function PolicyLoading() {
  return (
    <div className='container py-8 mx-auto'>
      <div className='flex flex-col gap-8'>
        {/* Policy Details Skeleton */}
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-8 w-[300px]' />
          <Skeleton className='h-4 w-[200px]' />
          <Skeleton className='h-4 w-[150px]' />
          <Skeleton className='h-4 w-[400px]' />
        </div>

        {/* PDF Viewer Skeleton */}
        <div className='h-[calc(90vh-8rem)] rounded-lg border'>
          <div className='flex items-center justify-center gap-4 p-4 border-b'>
            <Skeleton className='h-8 w-[100px]' />
            <Skeleton className='h-6 w-[50px]' />
            <Skeleton className='h-8 w-[100px]' />
          </div>

          <div className='h-[calc(100%-8rem)] flex items-center justify-center'>
            <Skeleton className='h-full w-[600px]' />
          </div>

          <div className='flex items-center justify-center gap-4 p-4 border-t'>
            <Skeleton className='h-8 w-[40px]' />
            <Skeleton className='h-6 w-[100px]' />
            <Skeleton className='h-8 w-[40px]' />
          </div>
        </div>
      </div>
    </div>
  )
}
