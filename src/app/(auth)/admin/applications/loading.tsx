import { LoadingHeader, LoadingCard } from '@/components/loading/LoadingShell'

export default function AdminApplicationsLoading() {
  return (
    <div className='container mx-auto space-y-6 py-8'>
      <LoadingHeader />
      <div className='rounded-md border'>
        <div className='space-y-4 p-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center justify-between'>
              <div className='space-y-2'>
                <LoadingCard />
              </div>
              <div className='flex gap-2'>
                <div className='size-8 animate-pulse rounded-md bg-muted' />
                <div className='size-8 animate-pulse rounded-md bg-muted' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
