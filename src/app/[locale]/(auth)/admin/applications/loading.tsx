import { LoadingHeader, LoadingCard } from '@/components/loading/LoadingShell'

export default function AdminApplicationsLoading() {
  return (
    <div className='container py-8 space-y-6 mx-auto'>
      <LoadingHeader />
      <div className='rounded-md border'>
        <div className='p-4 space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center justify-between'>
              <div className='space-y-2'>
                <LoadingCard />
              </div>
              <div className='flex gap-2'>
                <div className='h-8 w-8 rounded-md bg-muted animate-pulse' />
                <div className='h-8 w-8 rounded-md bg-muted animate-pulse' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
