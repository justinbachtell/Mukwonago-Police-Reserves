import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditUserLoading() {
  return (
    <div className='container mx-auto px-4 py-8 md:px-6 lg:px-8'>
      <div className='mb-8'>
        <Skeleton className='mb-2 h-9 w-[250px]' />
        <Skeleton className='h-5 w-[300px]' />
      </div>

      <Card className='p-6'>
        <div className='grid gap-6 md:grid-cols-2'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-5 w-[100px]' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>
        <div className='mt-6 flex justify-end gap-4'>
          <Skeleton className='h-10 w-[100px]' />
          <Skeleton className='h-10 w-[120px]' />
        </div>
      </Card>
    </div>
  )
}
