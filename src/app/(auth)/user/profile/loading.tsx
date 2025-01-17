import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function ProfileLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Header Section */}
      <div className='mb-6'>
        <Skeleton className='mb-2 h-9 w-[250px]' />
        <Skeleton className='h-5 w-[300px]' />
      </div>

      <Card className='space-y-8 p-6'>
        {/* Profile Header */}
        <div className='flex items-center gap-6 border-b pb-6'>
          <Skeleton className='size-24 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-7 w-[250px]' />
            <div className='flex gap-4'>
              <Skeleton className='h-5 w-[120px]' />
              <Skeleton className='h-5 w-[150px]' />
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-5 w-[100px]' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>
          <div className='flex justify-end gap-4'>
            <Skeleton className='h-10 w-[100px]' />
            <Skeleton className='h-10 w-[120px]' />
          </div>
        </div>
      </Card>
    </div>
  )
}
