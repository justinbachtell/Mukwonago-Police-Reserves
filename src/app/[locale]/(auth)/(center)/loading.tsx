import { Skeleton } from '@/components/ui/skeleton'

export default function AuthCenterLoading() {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center mx-auto'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        {/* Logo Skeleton */}
        <div className='flex flex-col space-y-2 text-center'>
          <Skeleton className='h-12 w-12 mx-auto rounded-full' />
          <Skeleton className='h-6 w-[200px] mx-auto' />
          <Skeleton className='h-4 w-[250px] mx-auto' />
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
