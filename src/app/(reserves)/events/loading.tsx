import { LoadingHeader, LoadingGrid } from '@/components/loading/LoadingShell'

export default function EventsLoading() {
  return (
    <div className='container mx-auto space-y-6 px-4 py-8 md:px-6 lg:px-8'>
      <LoadingHeader />
      <LoadingGrid />
    </div>
  )
}
