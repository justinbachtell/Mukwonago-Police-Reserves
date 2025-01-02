import {
  LoadingHeader,
  LoadingCard,
  LoadingGrid
} from '@/components/loading/LoadingShell'

export default function DashboardLoading() {
  return (
    <div className='container py-8 space-y-8 mx-auto'>
      <LoadingHeader />

      {/* Stats Section */}
      <div className='grid gap-4 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className='space-y-4'>
        <LoadingCard />
        <LoadingGrid />
      </div>
    </div>
  )
}
