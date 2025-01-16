import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditUserLoading() {
  return (
    <div className='container mx-auto px-4 py-8 md:px-6 lg:px-8'>
      <div className='mb-8'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='mt-2 h-4 w-64' />
      </div>

      <Card className='p-6'>
        <div className='grid gap-4 md:grid-cols-2'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-9 w-24' />
        </div>
      </Card>
    </div>
  )
}
