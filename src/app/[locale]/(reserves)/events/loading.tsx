import { LoadingHeader, LoadingGrid } from '@/components/loading/LoadingShell'

export default function EventsLoading() {
  return (
    <div className='container mx-auto space-y-6 py-8'>
      <LoadingHeader />
      <LoadingGrid />
    </div>
  )
}
