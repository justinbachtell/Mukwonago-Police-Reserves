import { LoadingHeader, LoadingGrid } from '@/components/loading/LoadingShell'

export default function EventsLoading() {
  return (
    <div className='container py-8 space-y-6 mx-auto'>
      <LoadingHeader />
      <LoadingGrid />
    </div>
  )
}
