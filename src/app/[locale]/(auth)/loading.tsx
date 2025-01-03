import { Skeleton } from '@/components/ui/skeleton'

export default function AuthLoading() {
  return (
    <div className='container mx-auto space-y-8 py-8'>
      {/* Header Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-10 w-[250px]' />
        <Skeleton className='h-4 w-[350px]' />
      </div>

      {/* Main Content Skeleton */}
      <div className='space-y-6'>
        <div className='rounded-lg border p-6'>
          <div className='space-y-4'>
            <Skeleton className='h-6 w-[200px]' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>
            <div className='flex gap-4'>
              <Skeleton className='h-10 w-[120px]' />
              <Skeleton className='h-10 w-[120px]' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
