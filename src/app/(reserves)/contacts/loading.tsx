import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function ContactsLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Header Section */}
      <div className='mb-6'>
        <Skeleton className='mb-2 h-9 w-[250px]' />
        <Skeleton className='h-5 w-[300px]' />
      </div>

      {/* Contacts Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='bg-white/80 shadow-md dark:bg-white/5'>
            <CardContent className='flex items-start gap-4 p-6'>
              <Skeleton className='size-16 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-6 w-[200px]' />
                <Skeleton className='h-4 w-[150px]' />
                <div className='flex gap-4'>
                  <Skeleton className='h-8 w-[100px]' />
                  <Skeleton className='h-8 w-[100px]' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
