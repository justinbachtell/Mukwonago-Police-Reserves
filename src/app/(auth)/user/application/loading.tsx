import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ApplicationLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Header Section */}
      <div className='mb-6'>
        <Skeleton className='mb-2 h-9 w-[250px]' />
        <Skeleton className='h-5 w-[300px]' />
      </div>

      {/* Application Forms */}
      <div className='space-y-6'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-7 w-[200px]' />
              <Skeleton className='h-5 w-[300px]' />
            </CardHeader>
            <CardContent className='space-y-6'>
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className='space-y-2'>
                  <Skeleton className='h-5 w-[150px]' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ))}
              <div className='flex justify-end gap-4'>
                <Skeleton className='h-10 w-[100px]' />
                <Skeleton className='h-10 w-[120px]' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
