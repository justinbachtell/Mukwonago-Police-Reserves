import { LoadingHeader, LoadingCard } from '@/components/loading/LoadingShell'

export default function AdminDashboardLoading() {
  return (
    <div className='container py-8 space-y-8 mx-auto'>
      <LoadingHeader />

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <LoadingCard />
          <div className='space-y-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
        <div className='space-y-4'>
          <LoadingCard />
          <div className='space-y-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
