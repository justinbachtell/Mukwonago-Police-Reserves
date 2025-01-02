import { LoadingHeader } from '@/components/loading/LoadingShell'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserProfileLoading() {
  return (
    <div className='container py-8 space-y-6 mx-auto'>
      <LoadingHeader />

      {/* User Profile Header */}
      <div className='flex items-center gap-6'>
        <Skeleton className='h-24 w-24 rounded-full' />
        <div className='space-y-3'>
          <Skeleton className='h-7 w-[250px]' />
          <div className='flex gap-4'>
            <Skeleton className='h-5 w-[120px]' />
            <Skeleton className='h-5 w-[150px]' />
          </div>
        </div>
      </div>

      {/* User Details Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Personal Information */}
        <div className='space-y-4'>
          <Skeleton className='h-6 w-[180px]' />
          <div className='space-y-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-[100px]' />
                <Skeleton className='h-5 w-[200px]' />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className='space-y-4'>
          <Skeleton className='h-6 w-[180px]' />
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-[100px]' />
                <Skeleton className='h-5 w-[200px]' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <Skeleton className='h-10 w-[120px]' />
        <Skeleton className='h-10 w-[120px]' />
      </div>
    </div>
  )
}
