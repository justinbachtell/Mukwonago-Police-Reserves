import { Skeleton } from '@/components/ui/skeleton'

export default function RecruitingLoading() {
  return (
    <div className='container py-8 space-y-8 mx-auto'>
      {/* Hero Section Skeleton */}
      <div className='space-y-4'>
        <Skeleton className='h-16 w-[600px] max-w-full' />
        <Skeleton className='h-6 w-[400px]' />
        <div className='flex gap-4'>
          <Skeleton className='h-12 w-[150px]' />
          <Skeleton className='h-12 w-[150px]' />
        </div>
      </div>

      {/* Content Sections Skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='space-y-6'>
          <Skeleton className='h-8 w-[300px]' />
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <Skeleton className='h-[200px] w-full rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-[250px]' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            </div>
            <div className='space-y-4'>
              <Skeleton className='h-[200px] w-full rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-[250px]' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
