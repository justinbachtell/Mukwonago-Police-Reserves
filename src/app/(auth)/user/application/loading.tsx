import { LoadingHeader, LoadingForm } from '@/components/loading/LoadingShell'

export default function ApplicationLoading() {
  return (
    <div className='container mx-auto space-y-8 py-8'>
      <LoadingHeader />
      <div className='space-y-6'>
        {/* Multiple form sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='space-y-4'>
            <LoadingForm />
          </div>
        ))}
      </div>
    </div>
  )
}
