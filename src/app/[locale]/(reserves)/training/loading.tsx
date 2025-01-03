import { LoadingHeader, LoadingGrid } from '@/components/loading/LoadingShell'

export default function TrainingLoading() {
  return (
    <div className='container mx-auto space-y-6 py-8'>
      <LoadingHeader />
      <LoadingGrid />
    </div>
  )
}
