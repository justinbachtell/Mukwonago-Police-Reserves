import { Skeleton } from '@/components/ui/skeleton'

export default function AuthCenterLoading() {
  return (
    <div className='container mx-auto flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        {/* Logo Skeleton */}
        <div className='flex flex-col space-y-2 text-center'>
          <Skeleton className='mx-auto size-12 rounded-full' />
          <Skeleton className='mx-auto h-6 w-[200px]' />
          <Skeleton className='mx-auto h-4 w-[250px]' />
        </div>

        {/* Form Skeleton */}
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Footer Links Skeleton */}
        <div className='flex justify-center gap-4'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-4 w-[100px]' />
        </div>
      </div>
    </div>
  )
}
